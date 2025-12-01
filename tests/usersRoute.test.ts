import { describe, it, expect, vi, beforeEach } from 'vitest';

// small typed helper for our mocked json response
type MockJsonReturn = { body: unknown; status: number };

// mock SvelteKit json helper (use `unknown` instead of `any` to satisfy strict typing)
vi.mock('@sveltejs/kit', () => ({
  json: (body: unknown, init?: { status?: number }): MockJsonReturn => ({ body, status: init?.status ?? 200 }),
}));

// mock the service used by the route
vi.mock('$lib/server/services/userService', () => ({
  listUsersFromRedcap: vi.fn(async () => [{ id: '1', name: 'Jean Dupont' }]),
}));

import { GET } from '../src/routes/api/v1/users/+server';

describe('GET /api/v1/users route', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('returns 401 when unauthenticated', async () => {
    const res = await GET({ locals: {} } as unknown as Parameters<typeof GET>[0]);
    // our mock `json` returns a typed `{ body, status }` object
    const typed = res as unknown as { body: { data: unknown; error: { code: string } }; status: number };
    expect(typed.status).toBe(401);
    expect(typed.body.error.code).toBe('unauthenticated');
  });

  it('returns users when authenticated', async () => {
    const res = await GET({ locals: { userId: 'u1' } } as unknown as Parameters<typeof GET>[0]);
    const typed = res as unknown as {
      body: { data: Array<{ id: string; name: string }>; error: unknown };
      status: number;
    };
    expect(typed.status).toBe(200);
    expect(typed.body.data).toEqual([{ id: '1', name: 'Jean Dupont' }]);
  });
});
