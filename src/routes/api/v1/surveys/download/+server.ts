import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { downloadSurvey } from '$lib/server/services/surveys';

export const GET: RequestHandler = async ({ locals, fetch }) => {
  try {
    const id = locals.userId;
    if (!id)
      return json(
        { data: null, error: { code: 'unauthenticated', message: 'No authenticated user' } },
        { status: 401 },
      );
    const result = await downloadSurvey(id, { fetch });
    return json({ data: result, error: null });
  } catch {
    return json({ data: null, error: { code: 'internal_error', message: 'Unexpected error' } }, { status: 500 });
  }
};
