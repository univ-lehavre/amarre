import { json, type RequestHandler } from '@sveltejs/kit';
import { z } from '$lib/types/api/zod-openapi';
import { ApiError, makeResponseSchema } from '$lib/types/api/common';
import { checkOnline, getAllowedHosts } from '$lib/server/net/online-check';
import { PUBLIC_APPWRITE_ENDPOINT } from '$env/static/public';

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
 * OpenAPI metadata for the /api/v1/health/status endpoint
 */
export const _openapi = {
  method: 'get',
  path: '/api/v1/health/status',
  tags: ['health'],
  summary: 'Get comprehensive system health status',
  description:
    'Returns overall system health status including server information and external service connectivity checks. This endpoint performs health checks on critical services and returns their status.',
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
  const startTime = Date.now();
  try {
    const result = await checkOnline(host, 443, 3000);
    const latencyMs = Date.now() - startTime;

    if (result.online) {
      return {
        name,
        status: 'healthy',
        message: 'Service is online and responding',
        latencyMs,
        lastChecked: new Date().toISOString(),
      };
    } else {
      return {
        name,
        status: 'unhealthy',
        message: result.tcp.error || result.tls.error || 'Service is not responding',
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

  const statusCode = overallStatus === 'unhealthy' ? 503 : 200;

  return json({ data, error: null }, { status: statusCode });
};
