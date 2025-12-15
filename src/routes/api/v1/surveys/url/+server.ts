import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSurveyUrl } from '$lib/server/services/surveys';

export const GET: RequestHandler = async ({ locals, fetch }) => {
  try {
    const id = locals.userId;
    if (!id)
      return json(
        { data: null, error: { code: 'unauthenticated', message: 'No authenticated user' } },
        { status: 401 },
      );

    const result = await getSurveyUrl(id, { fetch });

    if (result.match(/"error":/))
      return json({ data: null, error: { code: 'invalid_url', message: 'Invalid or missing URL' } }, { status: 422 });

    return json({ data: { url: result }, error: null });
  } catch (error) {
    console.error('Error fetching survey URL:', error);
    return json({ data: null, error: { code: 'internal_error', message: 'Unexpected error' } }, { status: 500 });
  }
};
