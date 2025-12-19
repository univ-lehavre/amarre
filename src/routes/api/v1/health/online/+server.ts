import { json, type RequestHandler } from '@sveltejs/kit';
import { z } from '$lib/types/api/zod-openapi';
import { ApiError, makeResponseSchema } from '$lib/types/api/common';
import { checkOnline, isHostAllowed } from '$lib/server/net/online-check';

/**
 * Schema for online check response data
 */
const OnlineCheckData = z
  .object({
    online: z.boolean(),
    host: z.string(),
    port: z.number().int(),
    timeoutMs: z.number().int(),
    tcp: z.object({
      ok: z.boolean(),
      latencyMs: z.number().int().optional(),
      error: z.string().optional(),
    }),
    tls: z.object({
      ok: z.boolean(),
      latencyMs: z.number().int().optional(),
      authorized: z.boolean(),
      protocol: z.string().optional(),
      alpnProtocol: z.string().optional(),
      cert: z
        .object({
          subjectCN: z.string(),
          issuerCN: z.string(),
          validFrom: z.string(),
          validTo: z.string(),
          fingerprint256: z.string(),
        })
        .optional(),
      error: z.string().optional(),
    }),
  })
  .strict();

const OnlineCheckResponse = makeResponseSchema(OnlineCheckData);

/**
 * Query parameters schema
 */
const QueryParams = z.object({
  host: z.string().min(1),
  port: z.coerce.number().int(),
  timeoutMs: z.coerce.number().int().min(100).max(30000).optional().default(3000),
});

/**
 * OpenAPI metadata for the /api/v1/health/online endpoint
 */
export const _openapi = {
  method: 'get',
  path: '/api/v1/health/online',
  tags: ['health'],
  summary: 'Check network connectivity to an allowed host (TCP + TLS)',
  description:
    'Performs TCP connection check and TLS/HTTPS certificate validation. Only allows port 443 and specific whitelisted hosts (www.google.com, redcap.univ-lehavre.fr, and Appwrite host from PUBLIC_APPWRITE_ENDPOINT). Returns 200 if online, 503 if offline, 400 if invalid parameters or host not allowed.',
  parameters: [
    {
      name: 'host',
      in: 'query',
      required: true,
      schema: { type: 'string' },
      description: 'Target hostname (must be in allowlist)',
    },
    {
      name: 'port',
      in: 'query',
      required: true,
      schema: { type: 'integer' },
      description: 'Target port (must be 443)',
    },
    {
      name: 'timeoutMs',
      in: 'query',
      required: false,
      schema: { type: 'integer', minimum: 100, maximum: 30000, default: 3000 },
      description: 'Timeout in milliseconds (default: 3000)',
    },
  ],
  responses: {
    200: {
      description: 'Host is online (TCP and TLS checks passed)',
      content: { 'application/json': { schema: OnlineCheckResponse } },
    },
    400: {
      description: 'Invalid parameters (port not 443, host not in allowlist, or validation error)',
      content: { 'application/json': { schema: OnlineCheckResponse } },
    },
    503: {
      description: 'Host is offline (TCP or TLS check failed)',
      content: { 'application/json': { schema: OnlineCheckResponse } },
    },
  },
  components: { schemas: { ApiError } },
} as const;

/**
 * GET handler for /api/v1/health/online
 */
export const GET: RequestHandler = async ({ url }) => {
  // Extract and validate query parameters
  const rawParams = {
    host: url.searchParams.get('host'),
    port: url.searchParams.get('port'),
    timeoutMs: url.searchParams.get('timeoutMs'),
  };

  // Validate parameters
  const parseResult = QueryParams.safeParse(rawParams);
  if (!parseResult.success) {
    return json(
      {
        data: null,
        error: {
          code: 'invalid_parameters',
          message: 'Invalid query parameters',
          details: parseResult.error.format(),
        },
      },
      { status: 400 },
    );
  }

  const { host, port, timeoutMs } = parseResult.data;

  // Enforce port 443 only (anti-SSRF)
  if (port !== 443) {
    return json(
      {
        data: null,
        error: {
          code: 'invalid_port',
          message: 'Only port 443 is allowed',
        },
      },
      { status: 400 },
    );
  }

  // Enforce host allowlist (anti-SSRF)
  if (!isHostAllowed(host)) {
    return json(
      {
        data: null,
        error: {
          code: 'host_not_allowed',
          message: `Host '${host}' is not in the allowlist`,
        },
      },
      { status: 400 },
    );
  }

  // Perform the online check
  const result = await checkOnline(host, port, timeoutMs);

  // Determine response based on online status
  if (result.online) {
    return json({ data: result, error: null }, { status: 200 });
  } else {
    return json(
      {
        data: result,
        error: {
          code: 'offline',
          message: `Host '${host}' is offline or unreachable`,
        },
      },
      { status: 503 },
    );
  }
};
