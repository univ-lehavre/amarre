import { describe, expect, it, vi } from 'vitest';

// Mock environment variables before importing the module
vi.mock('$env/static/public', () => ({ PUBLIC_APPWRITE_ENDPOINT: 'https://cloud.appwrite.io/v1' }));

// Mock the online-check module to avoid actual network calls in tests
vi.mock('$lib/server/net/online-check', async importOriginal => {
  const actual = await importOriginal<typeof import('../../../../../../src/lib/server/net/online-check')>();
  return { ...actual, checkOnline: vi.fn() };
});

describe('GET /api/v1/health/online', () => {
  describe('parameter validation', () => {
    it('returns 400 when host parameter is missing', async () => {
      const mod = await import('../../../../../../src/routes/api/v1/health/online/+server');
      const url = new URL('http://localhost/api/v1/health/online?port=443');
      const res = await mod.GET({ url } as never);

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.data).toBeNull();
      expect(body.error.code).toBe('invalid_parameters');
    });

    it('returns 400 when port parameter is missing', async () => {
      const mod = await import('../../../../../../src/routes/api/v1/health/online/+server');
      const url = new URL('http://localhost/api/v1/health/online?host=www.google.com');
      const res = await mod.GET({ url } as never);

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.data).toBeNull();
      expect(body.error.code).toBe('invalid_parameters');
    });

    it('returns 400 when port is not 443', async () => {
      const mod = await import('../../../../../../src/routes/api/v1/health/online/+server');
      const url = new URL('http://localhost/api/v1/health/online?host=www.google.com&port=80');
      const res = await mod.GET({ url } as never);

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.data).toBeNull();
      expect(body.error.code).toBe('invalid_port');
      expect(body.error.message).toBe('Only port 443 is allowed');
    });

    it('accepts timeoutMs as optional parameter with default 3000', async () => {
      const onlineCheck = await import('$lib/server/net/online-check');
      const mockCheckOnline = onlineCheck.checkOnline as unknown as ReturnType<typeof vi.fn>;

      mockCheckOnline.mockResolvedValue({
        online: true,
        host: 'www.google.com',
        port: 443,
        timeoutMs: 3000,
        tcp: { ok: true, latencyMs: 10 },
        tls: { ok: true, latencyMs: 20, authorized: true },
      });

      const mod = await import('../../../../../../src/routes/api/v1/health/online/+server');
      const url = new URL('http://localhost/api/v1/health/online?host=www.google.com&port=443');
      await mod.GET({ url } as never);

      expect(mockCheckOnline).toHaveBeenCalledWith('www.google.com', 443, 3000);
    });

    it('accepts custom timeoutMs parameter', async () => {
      const onlineCheck = await import('$lib/server/net/online-check');
      const mockCheckOnline = onlineCheck.checkOnline as unknown as ReturnType<typeof vi.fn>;

      mockCheckOnline.mockResolvedValue({
        online: true,
        host: 'www.google.com',
        port: 443,
        timeoutMs: 5000,
        tcp: { ok: true, latencyMs: 10 },
        tls: { ok: true, latencyMs: 20, authorized: true },
      });

      const mod = await import('../../../../../../src/routes/api/v1/health/online/+server');
      const url = new URL('http://localhost/api/v1/health/online?host=www.google.com&port=443&timeoutMs=5000');
      await mod.GET({ url } as never);

      expect(mockCheckOnline).toHaveBeenCalledWith('www.google.com', 443, 5000);
    });
  });

  describe('allowlist enforcement (anti-SSRF)', () => {
    it('returns 400 when host is not in allowlist', async () => {
      const mod = await import('../../../../../../src/routes/api/v1/health/online/+server');
      const url = new URL('http://localhost/api/v1/health/online?host=malicious.example.com&port=443');
      const res = await mod.GET({ url } as never);

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.data).toBeNull();
      expect(body.error.code).toBe('host_not_allowed');
      expect(body.error.message).toContain('malicious.example.com');
    });

    it('allows www.google.com (in allowlist)', async () => {
      const onlineCheck = await import('$lib/server/net/online-check');
      const mockCheckOnline = onlineCheck.checkOnline as unknown as ReturnType<typeof vi.fn>;

      mockCheckOnline.mockResolvedValue({
        online: true,
        host: 'www.google.com',
        port: 443,
        timeoutMs: 3000,
        tcp: { ok: true, latencyMs: 10 },
        tls: { ok: true, latencyMs: 20, authorized: true },
      });

      const mod = await import('../../../../../../src/routes/api/v1/health/online/+server');
      const url = new URL('http://localhost/api/v1/health/online?host=www.google.com&port=443');
      const res = await mod.GET({ url } as never);

      expect(res.status).toBe(200);
    });

    it('allows redcap.univ-lehavre.fr (in allowlist)', async () => {
      const onlineCheck = await import('$lib/server/net/online-check');
      const mockCheckOnline = onlineCheck.checkOnline as unknown as ReturnType<typeof vi.fn>;

      mockCheckOnline.mockResolvedValue({
        online: true,
        host: 'redcap.univ-lehavre.fr',
        port: 443,
        timeoutMs: 3000,
        tcp: { ok: true, latencyMs: 10 },
        tls: { ok: true, latencyMs: 20, authorized: true },
      });

      const mod = await import('../../../../../../src/routes/api/v1/health/online/+server');
      const url = new URL('http://localhost/api/v1/health/online?host=redcap.univ-lehavre.fr&port=443');
      const res = await mod.GET({ url } as never);

      expect(res.status).toBe(200);
    });

    it('allows Appwrite hostname (derived from PUBLIC_APPWRITE_ENDPOINT)', async () => {
      const onlineCheck = await import('$lib/server/net/online-check');
      const mockCheckOnline = onlineCheck.checkOnline as unknown as ReturnType<typeof vi.fn>;

      mockCheckOnline.mockResolvedValue({
        online: true,
        host: 'cloud.appwrite.io',
        port: 443,
        timeoutMs: 3000,
        tcp: { ok: true, latencyMs: 10 },
        tls: { ok: true, latencyMs: 20, authorized: true },
      });

      const mod = await import('../../../../../../src/routes/api/v1/health/online/+server');
      const url = new URL('http://localhost/api/v1/health/online?host=cloud.appwrite.io&port=443');
      const res = await mod.GET({ url } as never);

      expect(res.status).toBe(200);
    });

    it('rejects localhost (SSRF protection)', async () => {
      const mod = await import('../../../../../../src/routes/api/v1/health/online/+server');
      const url = new URL('http://localhost/api/v1/health/online?host=localhost&port=443');
      const res = await mod.GET({ url } as never);

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error.code).toBe('host_not_allowed');
    });

    it('rejects internal IP (SSRF protection)', async () => {
      const mod = await import('../../../../../../src/routes/api/v1/health/online/+server');
      const url = new URL('http://localhost/api/v1/health/online?host=192.168.1.1&port=443');
      const res = await mod.GET({ url } as never);

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error.code).toBe('host_not_allowed');
    });
  });

  describe('response format', () => {
    it('returns 200 with complete data when online (tcp.ok && tls.ok && tls.authorized)', async () => {
      const onlineCheck = await import('$lib/server/net/online-check');
      const mockCheckOnline = onlineCheck.checkOnline as unknown as ReturnType<typeof vi.fn>;

      mockCheckOnline.mockResolvedValue({
        online: true,
        host: 'www.google.com',
        port: 443,
        timeoutMs: 3000,
        tcp: { ok: true, latencyMs: 12 },
        tls: {
          ok: true,
          latencyMs: 34,
          authorized: true,
          protocol: 'TLSv1.3',
          alpnProtocol: 'h2',
          cert: {
            subjectCN: '*.google.com',
            issuerCN: 'GTS CA 1C3',
            validFrom: 'Nov 27 08:22:51 2024 GMT',
            validTo: 'Feb 19 08:22:50 2025 GMT',
            fingerprint256: 'AB:CD:EF:...',
          },
        },
      });

      const mod = await import('../../../../../../src/routes/api/v1/health/online/+server');
      const url = new URL('http://localhost/api/v1/health/online?host=www.google.com&port=443');
      const res = await mod.GET({ url } as never);

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.error).toBeNull();
      expect(body.data.online).toBe(true);
      expect(body.data.host).toBe('www.google.com');
      expect(body.data.port).toBe(443);
      expect(body.data.tcp.ok).toBe(true);
      expect(body.data.tls.ok).toBe(true);
      expect(body.data.tls.authorized).toBe(true);
      expect(body.data.tls.cert).toBeDefined();
    });

    it('returns 503 with error when offline (tcp failed)', async () => {
      const onlineCheck = await import('$lib/server/net/online-check');
      const mockCheckOnline = onlineCheck.checkOnline as unknown as ReturnType<typeof vi.fn>;

      mockCheckOnline.mockResolvedValue({
        online: false,
        host: 'www.google.com',
        port: 443,
        timeoutMs: 3000,
        tcp: { ok: false, error: 'Connection refused' },
        tls: { ok: false, authorized: false, error: 'Connection refused' },
      });

      const mod = await import('../../../../../../src/routes/api/v1/health/online/+server');
      const url = new URL('http://localhost/api/v1/health/online?host=www.google.com&port=443');
      const res = await mod.GET({ url } as never);

      expect(res.status).toBe(503);
      const body = await res.json();
      expect(body.error).not.toBeNull();
      expect(body.error.code).toBe('offline');
      expect(body.data.online).toBe(false);
      expect(body.data.tcp.ok).toBe(false);
    });

    it('returns 503 when TLS is unauthorized', async () => {
      const onlineCheck = await import('$lib/server/net/online-check');
      const mockCheckOnline = onlineCheck.checkOnline as unknown as ReturnType<typeof vi.fn>;

      mockCheckOnline.mockResolvedValue({
        online: false,
        host: 'www.google.com',
        port: 443,
        timeoutMs: 3000,
        tcp: { ok: true, latencyMs: 12 },
        tls: { ok: true, latencyMs: 34, authorized: false, error: 'Certificate verification failed' },
      });

      const mod = await import('../../../../../../src/routes/api/v1/health/online/+server');
      const url = new URL('http://localhost/api/v1/health/online?host=www.google.com&port=443');
      const res = await mod.GET({ url } as never);

      expect(res.status).toBe(503);
      const body = await res.json();
      expect(body.error).not.toBeNull();
      expect(body.error.code).toBe('offline');
      expect(body.data.online).toBe(false);
      expect(body.data.tcp.ok).toBe(true);
      expect(body.data.tls.authorized).toBe(false);
    });
  });

  describe('OpenAPI metadata', () => {
    it('has valid OpenAPI metadata export', async () => {
      const mod = await import('../../../../../../src/routes/api/v1/health/online/+server');
      expect(mod._openapi).toBeDefined();
      expect(mod._openapi.method).toBe('get');
      expect(mod._openapi.path).toBe('/api/v1/health/online');
      expect(mod._openapi.tags).toContain('health');
      expect(mod._openapi.responses[200]).toBeDefined();
      expect(mod._openapi.responses[400]).toBeDefined();
      expect(mod._openapi.responses[503]).toBeDefined();
    });

    it('validates 200 response schema', async () => {
      const onlineCheck = await import('$lib/server/net/online-check');
      const mockCheckOnline = onlineCheck.checkOnline as unknown as ReturnType<typeof vi.fn>;

      mockCheckOnline.mockResolvedValue({
        online: true,
        host: 'www.google.com',
        port: 443,
        timeoutMs: 3000,
        tcp: { ok: true, latencyMs: 12 },
        tls: { ok: true, latencyMs: 34, authorized: true, protocol: 'TLSv1.3' },
      });

      const mod = await import('../../../../../../src/routes/api/v1/health/online/+server');
      const url = new URL('http://localhost/api/v1/health/online?host=www.google.com&port=443');
      const res = await mod.GET({ url } as never);

      expect(res.status).toBe(200);
      expect(mod._openapi.responses[200]).toBeTruthy();

      const body = await res.json();
      const schema = mod._openapi.responses[200].content['application/json'].schema;
      expect(() => schema.parse(body)).not.toThrow();
    });

    it('validates 400 response schema', async () => {
      const mod = await import('../../../../../../src/routes/api/v1/health/online/+server');
      const url = new URL('http://localhost/api/v1/health/online?host=malicious.example.com&port=443');
      const res = await mod.GET({ url } as never);

      expect(res.status).toBe(400);
      expect(mod._openapi.responses[400]).toBeTruthy();

      const body = await res.json();
      const schema = mod._openapi.responses[400].content['application/json'].schema;
      expect(() => schema.parse(body)).not.toThrow();
    });

    it('validates 503 response schema', async () => {
      const onlineCheck = await import('$lib/server/net/online-check');
      const mockCheckOnline = onlineCheck.checkOnline as unknown as ReturnType<typeof vi.fn>;

      mockCheckOnline.mockResolvedValue({
        online: false,
        host: 'www.google.com',
        port: 443,
        timeoutMs: 3000,
        tcp: { ok: false, error: 'Timeout' },
        tls: { ok: false, authorized: false },
      });

      const mod = await import('../../../../../../src/routes/api/v1/health/online/+server');
      const url = new URL('http://localhost/api/v1/health/online?host=www.google.com&port=443');
      const res = await mod.GET({ url } as never);

      expect(res.status).toBe(503);
      expect(mod._openapi.responses[503]).toBeTruthy();

      const body = await res.json();
      const schema = mod._openapi.responses[503].content['application/json'].schema;
      expect(() => schema.parse(body)).not.toThrow();
    });
  });
});
