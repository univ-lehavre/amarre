import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { deleteSurveyRecord } from '$lib/server/services/surveysService';

export const GET: RequestHandler = async ({ locals }) => {
  try {
    const id = locals.userId;
    if (!id)
      return json(
        { data: null, error: { code: 'unauthenticated', message: 'No authenticated user' } },
        { status: 401 },
      );
    const result = await deleteSurveyRecord(id);
    return json({ data: { result }, error: null });
  } catch {
    return json({ data: null, error: { code: 'internal_error', message: 'Unexpected error' } }, { status: 500 });
  }
};
