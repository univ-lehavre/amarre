import { json, type RequestHandler } from '@sveltejs/kit';
import { z } from '$lib/types/api/zod-openapi';
import { ApiError, makeResponseSchema } from '$lib/types/api/common';
import { checkOnline, getAllowedHosts } from '$lib/server/net/online-check';
import { PUBLIC_APPWRITE_ENDPOINT } from '$env/static/public';

// Configuration constants
const DEFAULT_HTTPS_PORT = 443;
const DEFAULT_HEALTH_CHECK_TIMEOUT_MS = 3000;
const LATENCY_DEGRADED_THRESHOLD_MS = 2000; // Over 2s is considered degraded
const CACHE_DURATION_MS = 10000; // Cache health check results for 10 seconds

// Simple in-memory cache
let cachedResponse: { data: unknown; timestamp: number } | null = null;

/**
 * Schema for a service health check
 */
const ServiceHealth = z.object({
  name: z.string(),
  status: z.enum(['healthy', 'degraded', 'unhealthy']),
  message: z.string().optional(),
  latencyMs: z.number().int().optional(),
  lastChecked: z.string(),
});

/**
 * Schema for health status response data
 */
const HealthStatusData = z
  .object({
    status: z.enum(['healthy', 'degraded', 'unhealthy']),
    timestamp: z.string(),
    uptime: z.number(),
    services: z.array(ServiceHealth),
  })
  .strict();

const HealthStatusResponse = makeResponseSchema(HealthStatusData);

/**
 * OpenAPI metadata for the /health/status endpoint
 */
export const _openapi = {
  method: 'get',
  path: '/health/status',
  tags: ['health'],
  summary: 'Get comprehensive system health status',
  description:
    'Returns overall system health status including server uptime, timestamp, and connectivity checks for critical services (Appwrite, REDCap, Internet). Returns 200 if all services are healthy, 503 if any service is unhealthy or degraded.',
  responses: {
    200: {
      description: 'Health status retrieved successfully',
      content: { 'application/json': { schema: HealthStatusResponse } },
    },
    503: { description: 'Service unhealthy', content: { 'application/json': { schema: HealthStatusResponse } } },
  },
  components: { schemas: { ApiError } },
} as const;

/**
 * Check health of a specific host
 */
async function checkServiceHealth(name: string, host: string): Promise<z.infer<typeof ServiceHealth>> {
  try {
    const result = await checkOnline(host, DEFAULT_HTTPS_PORT, DEFAULT_HEALTH_CHECK_TIMEOUT_MS);

    if (result.online) {
      // Use TLS latency as it includes TCP handshake + TLS negotiation
      const latencyMs = result.tls.latencyMs || result.tcp.latencyMs;

      // Determine status based on latency
      const status = latencyMs && latencyMs > LATENCY_DEGRADED_THRESHOLD_MS ? 'degraded' : 'healthy';

      return {
        name,
        status,
        message: status === 'degraded' ? 'Service is reachable but experiencing high latency' : 'Service is reachable',
        latencyMs,
        lastChecked: new Date().toISOString(),
      };
    } else {
      return {
        name,
        status: 'unhealthy',
        message: result.tcp.error || result.tls.error || 'Service check failed with no error details',
        lastChecked: new Date().toISOString(),
      };
    }
  } catch (error) {
    return {
      name,
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'Unknown error',
      lastChecked: new Date().toISOString(),
    };
  }
}

/**
 * GET handler for /api/v1/health/status
 */
export const GET: RequestHandler = async () => {
  // Check cache
  if (cachedResponse && Date.now() - cachedResponse.timestamp < CACHE_DURATION_MS) {
    return json(cachedResponse.data, { status: cachedResponse.data.error ? 503 : 200 });
  }

  const timestamp = new Date().toISOString();
  const uptime = process.uptime();

  // Perform health checks on allowed external services
  const allowedHosts = getAllowedHosts();
  const serviceChecks: Promise<z.infer<typeof ServiceHealth>>[] = [];

  // Check Appwrite if configured
  if (PUBLIC_APPWRITE_ENDPOINT) {
    try {
      const appwriteUrl = new URL(PUBLIC_APPWRITE_ENDPOINT);
      const appwriteHost = appwriteUrl.hostname;
      if (allowedHosts.includes(appwriteHost)) {
        serviceChecks.push(checkServiceHealth('Appwrite', appwriteHost));
      }
    } catch {
      // Invalid URL, skip
    }
  }

  // Check REDCap
  if (allowedHosts.includes('redcap.univ-lehavre.fr')) {
    serviceChecks.push(checkServiceHealth('REDCap', 'redcap.univ-lehavre.fr'));
  }

  // Check internet connectivity
  if (allowedHosts.includes('www.google.com')) {
    serviceChecks.push(checkServiceHealth('Internet', 'www.google.com'));
  }

  const services = await Promise.all(serviceChecks);

  // Determine overall status
  const hasUnhealthy = services.some(s => s.status === 'unhealthy');
  const hasDegraded = services.some(s => s.status === 'degraded');

  let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
  if (hasUnhealthy) {
    overallStatus = 'unhealthy';
  } else if (hasDegraded) {
    overallStatus = 'degraded';
  } else {
    overallStatus = 'healthy';
  }

  const data = { status: overallStatus, timestamp, uptime, services };

  // Return 503 for unhealthy or degraded status
  const statusCode = overallStatus === 'healthy' ? 200 : 503;

  const response = { data, error: null };

  // Cache the response
  cachedResponse = { data: response, timestamp: Date.now() };

  return json(response, { status: statusCode });
};
