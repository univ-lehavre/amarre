import { describe, expect, it, vi } from 'vitest';

vi.mock('$lib/server/services/surveys', () => ({ listRequests: vi.fn() }));

describe('GET /api/v1/surveys/list (anti-derive OpenAPI)', () => {
  it('401 est documenté et conforme au schéma', async () => {
    const mod = await import('../../../../../src/routes/api/v1/surveys/list/+server');
    const res = await mod.GET({ locals: {}, fetch: vi.fn() } as never);

    expect(res.status).toBe(401);
    expect(mod._openapi.responses[401]).toBeTruthy();

    const body = await res.json();
    const schema = mod._openapi.responses[401].content['application/json'].schema;
    expect(() => schema.parse(body)).not.toThrow();

    // Attendu par l’implémentation
    expect(body).toMatchObject({ data: null, error: { code: 'unauthenticated', message: 'No authenticated user' } });
  });

  it('200 est documenté et conforme au schéma', async () => {
    const services = await import('$lib/server/services/surveys');
    const listRequests = services.listRequests as unknown as ReturnType<typeof vi.fn>;

    listRequests.mockResolvedValue([
      {
        record_id: 'abc123',
        created_at: '2025-12-17T12:34:56Z',
        form_complete: '2',
        composante_complete: '1',
        labo_complete: '0',
        encadrant_complete: '2',
        validation_finale_complete: '0',
      },
    ]);

    const mod = await import('../../../../../src/routes/api/v1/surveys/list/+server');
    const res = await mod.GET({ locals: { userId: 'user_1' }, fetch: vi.fn() } as never);

    expect(res.status).toBe(200);
    expect(mod._openapi.responses[200]).toBeTruthy();

    const body = await res.json();
    const schema = mod._openapi.responses[200].content['application/json'].schema;
    expect(() => schema.parse(body)).not.toThrow();

    expect(body.error).toBeNull();
    expect(Array.isArray(body.data)).toBe(true);
  });
});
