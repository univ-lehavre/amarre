import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals }) => {
  const userId = locals.userId;
  if (!userId)
    return json({ data: null, error: { code: 'unauthenticated', message: 'No authenticated user' } }, { status: 401 });

  // À implémenter: création d'une nouvelle demande côté REDCap / Appwrite
  return json({ data: null, error: { code: 'not_implemented', message: 'Not implemented' } }, { status: 501 });
};

export const GET: RequestHandler = async () =>
  json({ data: null, error: { code: 'method_not_allowed', message: 'Use POST' } }, { status: 405 });
