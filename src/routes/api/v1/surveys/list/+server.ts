import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { mapErrorToResponse } from '$lib/errors/mapper';
import { listRequests } from '$lib/server/services/surveys';
import { z } from '$lib/types/api/zod-openapi';
import { ApiError, makeResponseSchema } from '$lib/types/api/common';

const SurveyRequestItem = z
  .object({
    record_id: z.string().describe('Identifiant de la demande').openapi({ example: '0123456789abcdef01234567' }),
    created_at: z.string().describe('Date de création (ISO)').optional().openapi({ example: '2025-12-17T12:34:56Z' }),
    form_complete: z.union([z.string(), z.number()]).optional().describe('Statut REDCap (ex: 0/1/2)'),
    composante_complete: z.union([z.string(), z.number()]).optional().describe('Statut REDCap (ex: 0/1/2)'),
    labo_complete: z.union([z.string(), z.number()]).optional().describe('Statut REDCap (ex: 0/1/2)'),
    encadrant_complete: z.union([z.string(), z.number()]).optional().describe('Statut REDCap (ex: 0/1/2)'),
    validation_finale_complete: z.union([z.string(), z.number()]).optional().describe('Statut REDCap (ex: 0/1/2)'),
  })
  .passthrough()
  .openapi('SurveyRequestItem');

const SurveyListResponse = makeResponseSchema(z.array(SurveyRequestItem)).openapi('SurveyListResponse');

/**
 * Métadonnées OpenAPI locales (référence des schémas Zod).
 * Note SvelteKit: les exports arbitraires sont interdits, d'où le préfixe `_`.
 */
export const _openapi = {
  method: 'post',
  path: '/api/v1/surveys/list',
  tags: ['surveys'],
  summary: 'Liste les demandes de l’utilisateur (auth requis)',
  security: [{ bearerAuth: [] }],
  responses: {
    200: { description: 'OK', content: { 'application/json': { schema: SurveyListResponse } } },
    401: { description: 'Non authentifié', content: { 'application/json': { schema: SurveyListResponse } } },
    default: { description: 'Erreur', content: { 'application/json': { schema: makeResponseSchema(z.unknown()) } } },
  },
  components: { schemas: { ApiError } },
} as const;

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
