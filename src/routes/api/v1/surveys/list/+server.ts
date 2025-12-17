import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { mapErrorToResponse } from '$lib/errors/mapper';
import { listRequests } from '$lib/server/services/surveys';

export const POST: RequestHandler = async ({ locals, fetch }) => {
  try {
    const userId = locals.userId;
    if (!userId)
      return json(
        { data: null, error: { code: 'unauthenticated', message: 'No authenticated user' } },
        { status: 401 },
      );
    const result = await listRequests(userId, { fetch });
    return json({ data: result, error: null }, { status: 200 });
  } catch (error) {
    return mapErrorToResponse(error);
  }
};

export const GET: RequestHandler = async () =>
  json({ data: null, error: { code: 'method_not_allowed', message: 'Use POST' } }, { status: 405 });
