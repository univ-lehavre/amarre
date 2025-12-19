import z from 'zod';
import { makeResponseSchema } from './common';

export const surveyRequestItem = z
  .object({
    record_id: z.string().describe('Identifiant de la demande').openapi({ example: '0123456789abcdef01234567' }),
    created_at: z.string().describe('Date de création (ISO)').openapi({ example: '2025-12-17T12:34:56Z' }),
    form_complete: z.union([z.string()]).describe('Statut REDCap (ex: 0/1/2)'),
    composante_complete: z.union([z.string()]).describe('Statut REDCap (ex: 0/1/2)'),
    labo_complete: z.union([z.string()]).describe('Statut REDCap (ex: 0/1/2)'),
    encadrant_complete: z.union([z.string()]).describe('Statut REDCap (ex: 0/1/2)'),
    validation_finale_complete: z.union([z.string()]).describe('Statut REDCap (ex: 0/1/2)'),
  })
  .openapi('SurveyRequestItem');

export type SurveyRequestItem = z.infer<typeof surveyRequestItem>;

export const surveyRequestList = z.array(surveyRequestItem).openapi('SurveyRequestList');

export type SurveyRequestList = z.infer<typeof surveyRequestList>;

export const surveyListResponse = makeResponseSchema(surveyRequestList).openapi('SurveyListResponse');

export type SurveyListResponse = z.infer<typeof surveyListResponse>;
