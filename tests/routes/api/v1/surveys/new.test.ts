import { describe, expect, it, vi } from 'vitest';

vi.mock('$lib/server/services/surveys', () => ({ newRequest: vi.fn() }));

describe('POST /api/v1/surveys/new (anti-derive OpenAPI)', () => {
  it('401 when unauthenticated', async () => {
    const mod = await import('../../../../../src/routes/api/v1/surveys/new/+server');
    const res = await mod.POST({ locals: {}, fetch: vi.fn() } as never);

    expect(res.status).toBe(401);
    const body = await res.json();

    // Validate response structure
    expect(body).toMatchObject({ data: null, error: { code: 'unauthenticated', message: 'No authenticated user' } });
  });

  it('200 when creating new request successfully', async () => {
    const services = await import('$lib/server/services/surveys');
    const newRequest = services.newRequest as unknown as ReturnType<typeof vi.fn>;

    newRequest.mockResolvedValue({ count: 1 });

    const mockFetch = vi
      .fn()
      .mockResolvedValue({ json: vi.fn().mockResolvedValue({ data: { email: 'test@inserm.fr' } }) });

    const mod = await import('../../../../../src/routes/api/v1/surveys/new/+server');
    const res = await mod.POST({ locals: { userId: 'user_1' }, fetch: mockFetch } as never);

    expect(res.status).toBe(200);

    const body = await res.json();

    // Validate response structure
    expect(body.error).toBeNull();
    expect(body.data).toMatchObject({ newRequestCreated: 1 });
  });
});
