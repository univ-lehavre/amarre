import { describe, expect, it, vi } from 'vitest';

vi.mock('$lib/server/services/surveys', () => ({ getSurveyUrl: vi.fn() }));

describe('GET /api/v1/surveys/url (anti-derive OpenAPI)', () => {
  it('401 when unauthenticated', async () => {
    const mod = await import('../../../../../src/routes/api/v1/surveys/url/+server');
    const res = await mod.GET({ locals: {}, fetch: vi.fn() } as never);

    expect(res.status).toBe(401);
    const body = await res.json();
    
    // Validate response structure
    expect(body).toMatchObject({ 
      data: null, 
      error: { code: 'unauthenticated', message: 'No authenticated user' } 
    });
  });

  it('200 when getting survey URL successfully', async () => {
    const services = await import('$lib/server/services/surveys');
    const getSurveyUrl = services.getSurveyUrl as unknown as ReturnType<typeof vi.fn>;

    getSurveyUrl.mockResolvedValue('https://example.com/survey');

    const mod = await import('../../../../../src/routes/api/v1/surveys/url/+server');
    const res = await mod.GET({ locals: { userId: 'user_1' }, fetch: vi.fn() } as never);

    expect(res.status).toBe(200);

    const body = await res.json();
    
    // Validate response structure
    expect(body.error).toBeNull();
    expect(body.data).toMatchObject({ url: 'https://example.com/survey' });
  });

  it('422 when survey URL contains error', async () => {
    const services = await import('$lib/server/services/surveys');
    const getSurveyUrl = services.getSurveyUrl as unknown as ReturnType<typeof vi.fn>;

    getSurveyUrl.mockResolvedValue('{"error": "something went wrong"}');

    const mod = await import('../../../../../src/routes/api/v1/surveys/url/+server');
    const res = await mod.GET({ locals: { userId: 'user_1' }, fetch: vi.fn() } as never);

    expect(res.status).toBe(422);

    const body = await res.json();
    
    // Validate response structure
    expect(body).toMatchObject({ 
      data: null, 
      error: { code: 'invalid_url', message: 'Invalid or missing URL' } 
    });
  });
});
