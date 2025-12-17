import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { mapErrorToResponse } from '$lib/errors/mapper';
import { newRequest } from '$lib/server/services/surveys';

export const POST: RequestHandler = async ({ locals, fetch }) => {
  try {
    const userId = locals.userId;
    if (!userId)
      return json(
        { data: null, error: { code: 'unauthenticated', message: 'No authenticated user' } },
        { status: 401 },
      );
    const user = await fetch(`/api/v1/me`).then(res => res.json());
    const result = await newRequest(user.data, { fetch });
    return json({ data: { newRequestCreated: result.count }, error: null }, { status: 200 });
  } catch (error) {
    return mapErrorToResponse(error);
  }
};
