import { describe, expect, it, vi } from 'vitest';

// Mock environment variables before importing the module
vi.mock('$env/static/public', () => ({ PUBLIC_APPWRITE_ENDPOINT: 'https://cloud.appwrite.io/v1' }));

// Mock the online-check module to avoid actual network calls in tests
vi.mock('$lib/server/net/online-check', async importOriginal => {
  const actual = await importOriginal<typeof import('../../../../../../src/lib/server/net/online-check')>();
  return {
    ...actual,
    checkOnline: vi.fn(),
    getAllowedHosts: vi.fn(() => ['www.google.com', 'redcap.univ-lehavre.fr', 'cloud.appwrite.io']),
  };
});

describe('GET /api/v1/health/status', () => {
  describe('successful health check', () => {
    it('returns 200 with healthy status when all services are healthy', async () => {
      const onlineCheck = await import('$lib/server/net/online-check');
      const mockCheckOnline = onlineCheck.checkOnline as unknown as ReturnType<typeof vi.fn>;

      mockCheckOnline.mockResolvedValue({
        online: true,
        host: 'test.example.com',
        port: 443,
        timeoutMs: 3000,
        tcp: { ok: true, latencyMs: 10 },
        tls: { ok: true, latencyMs: 20, authorized: true },
      });

      const mod = await import('../../../../../../src/routes/api/v1/health/status/+server');
      const res = await mod.GET({} as never);

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.error).toBeNull();
      expect(body.data.status).toBe('healthy');
      expect(body.data.timestamp).toBeDefined();
      expect(body.data.uptime).toBeGreaterThan(0);
      expect(body.data.services).toBeInstanceOf(Array);
    });

    it('includes system uptime in response', async () => {
      const onlineCheck = await import('$lib/server/net/online-check');
      const mockCheckOnline = onlineCheck.checkOnline as unknown as ReturnType<typeof vi.fn>;

      mockCheckOnline.mockResolvedValue({
        online: true,
        host: 'test.example.com',
        port: 443,
        timeoutMs: 3000,
        tcp: { ok: true, latencyMs: 10 },
        tls: { ok: true, latencyMs: 20, authorized: true },
      });

      const mod = await import('../../../../../../src/routes/api/v1/health/status/+server');
      const res = await mod.GET({} as never);

      const body = await res.json();
      expect(body.data.uptime).toBeDefined();
      expect(typeof body.data.uptime).toBe('number');
      expect(body.data.uptime).toBeGreaterThanOrEqual(0);
    });

    it('includes current timestamp in ISO format', async () => {
      const onlineCheck = await import('$lib/server/net/online-check');
      const mockCheckOnline = onlineCheck.checkOnline as unknown as ReturnType<typeof vi.fn>;

      mockCheckOnline.mockResolvedValue({
        online: true,
        host: 'test.example.com',
        port: 443,
        timeoutMs: 3000,
        tcp: { ok: true, latencyMs: 10 },
        tls: { ok: true, latencyMs: 20, authorized: true },
      });

      const mod = await import('../../../../../../src/routes/api/v1/health/status/+server');
      const res = await mod.GET({} as never);

      const body = await res.json();
      expect(body.data.timestamp).toBeDefined();
      expect(() => new Date(body.data.timestamp)).not.toThrow();
    });
  });

  describe('service health checks', () => {
    it('checks multiple services and returns their status', async () => {
      const onlineCheck = await import('$lib/server/net/online-check');
      const mockCheckOnline = onlineCheck.checkOnline as unknown as ReturnType<typeof vi.fn>;

      mockCheckOnline.mockResolvedValue({
        online: true,
        host: 'test.example.com',
        port: 443,
        timeoutMs: 3000,
        tcp: { ok: true, latencyMs: 15 },
        tls: { ok: true, latencyMs: 25, authorized: true },
      });

      const mod = await import('../../../../../../src/routes/api/v1/health/status/+server');
      const res = await mod.GET({} as never);

      const body = await res.json();
      expect(body.data.services).toBeInstanceOf(Array);
      expect(body.data.services.length).toBeGreaterThan(0);

      const service = body.data.services[0];
      expect(service).toHaveProperty('name');
      expect(service).toHaveProperty('status');
      expect(service).toHaveProperty('lastChecked');
      expect(['healthy', 'degraded', 'unhealthy']).toContain(service.status);
    });

    it('includes latency information for healthy services', async () => {
      const onlineCheck = await import('$lib/server/net/online-check');
      const mockCheckOnline = onlineCheck.checkOnline as unknown as ReturnType<typeof vi.fn>;

      mockCheckOnline.mockResolvedValue({
        online: true,
        host: 'test.example.com',
        port: 443,
        timeoutMs: 3000,
        tcp: { ok: true, latencyMs: 12 },
        tls: { ok: true, latencyMs: 23, authorized: true },
      });

      const mod = await import('../../../../../../src/routes/api/v1/health/status/+server');
      const res = await mod.GET({} as never);

      const body = await res.json();
      const healthyService = body.data.services.find((s: { status: string }) => s.status === 'healthy');

      if (healthyService) {
        expect(healthyService.latencyMs).toBeDefined();
        expect(typeof healthyService.latencyMs).toBe('number');
        expect(healthyService.latencyMs).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('unhealthy services', () => {
    it('returns 503 when all services are unhealthy', async () => {
      const onlineCheck = await import('$lib/server/net/online-check');
      const mockCheckOnline = onlineCheck.checkOnline as unknown as ReturnType<typeof vi.fn>;

      mockCheckOnline.mockResolvedValue({
        online: false,
        host: 'test.example.com',
        port: 443,
        timeoutMs: 3000,
        tcp: { ok: false, error: 'Connection refused' },
        tls: { ok: false, authorized: false, error: 'Connection failed' },
      });

      const mod = await import('../../../../../../src/routes/api/v1/health/status/+server');
      const res = await mod.GET({} as never);

      expect(res.status).toBe(503);
      const body = await res.json();
      expect(body.data.status).toBe('unhealthy');
    });

    it('marks service as unhealthy with error message when check fails', async () => {
      const onlineCheck = await import('$lib/server/net/online-check');
      const mockCheckOnline = onlineCheck.checkOnline as unknown as ReturnType<typeof vi.fn>;

      mockCheckOnline.mockResolvedValue({
        online: false,
        host: 'test.example.com',
        port: 443,
        timeoutMs: 3000,
        tcp: { ok: false, error: 'Connection timeout' },
        tls: { ok: false, authorized: false, error: 'Connection timeout' },
      });

      const mod = await import('../../../../../../src/routes/api/v1/health/status/+server');
      const res = await mod.GET({} as never);

      const body = await res.json();
      const unhealthyService = body.data.services.find((s: { status: string }) => s.status === 'unhealthy');

      expect(unhealthyService).toBeDefined();
      expect(unhealthyService.message).toBeDefined();
      expect(unhealthyService.message).toContain('timeout');
    });
  });

  describe('overall status calculation', () => {
    it('sets overall status to unhealthy if any service is unhealthy', async () => {
      const onlineCheck = await import('$lib/server/net/online-check');
      const mockCheckOnline = onlineCheck.checkOnline as unknown as ReturnType<typeof vi.fn>;

      let callCount = 0;
      mockCheckOnline.mockImplementation(async () => {
        callCount++;
        if (callCount === 1) {
          return {
            online: true,
            host: 'service1.example.com',
            port: 443,
            timeoutMs: 3000,
            tcp: { ok: true, latencyMs: 10 },
            tls: { ok: true, latencyMs: 20, authorized: true },
          };
        } else {
          return {
            online: false,
            host: 'service2.example.com',
            port: 443,
            timeoutMs: 3000,
            tcp: { ok: false, error: 'Connection failed' },
            tls: { ok: false, authorized: false },
          };
        }
      });

      const mod = await import('../../../../../../src/routes/api/v1/health/status/+server');
      const res = await mod.GET({} as never);

      expect(res.status).toBe(503);
      const body = await res.json();
      expect(body.data.status).toBe('unhealthy');
    });
  });

  describe('OpenAPI metadata', () => {
    it('has valid OpenAPI metadata export', async () => {
      const mod = await import('../../../../../../src/routes/api/v1/health/status/+server');
      expect(mod._openapi).toBeDefined();
      expect(mod._openapi.method).toBe('get');
      expect(mod._openapi.path).toBe('/api/v1/health/status');
      expect(mod._openapi.tags).toContain('health');
      expect(mod._openapi.responses[200]).toBeDefined();
      expect(mod._openapi.responses[503]).toBeDefined();
    });

    it('validates 200 response schema', async () => {
      const onlineCheck = await import('$lib/server/net/online-check');
      const mockCheckOnline = onlineCheck.checkOnline as unknown as ReturnType<typeof vi.fn>;

      mockCheckOnline.mockResolvedValue({
        online: true,
        host: 'test.example.com',
        port: 443,
        timeoutMs: 3000,
        tcp: { ok: true, latencyMs: 10 },
        tls: { ok: true, latencyMs: 20, authorized: true },
      });

      const mod = await import('../../../../../../src/routes/api/v1/health/status/+server');
      const res = await mod.GET({} as never);

      expect(res.status).toBe(200);
      expect(mod._openapi.responses[200]).toBeTruthy();

      const body = await res.json();
      const schema = mod._openapi.responses[200].content['application/json'].schema;
      expect(() => schema.parse(body)).not.toThrow();
    });

    it('validates 503 response schema', async () => {
      const onlineCheck = await import('$lib/server/net/online-check');
      const mockCheckOnline = onlineCheck.checkOnline as unknown as ReturnType<typeof vi.fn>;

      mockCheckOnline.mockResolvedValue({
        online: false,
        host: 'test.example.com',
        port: 443,
        timeoutMs: 3000,
        tcp: { ok: false, error: 'Connection refused' },
        tls: { ok: false, authorized: false },
      });

      const mod = await import('../../../../../../src/routes/api/v1/health/status/+server');
      const res = await mod.GET({} as never);

      expect(res.status).toBe(503);
      expect(mod._openapi.responses[503]).toBeTruthy();

      const body = await res.json();
      const schema = mod._openapi.responses[503].content['application/json'].schema;
      expect(() => schema.parse(body)).not.toThrow();
    });
  });
});
