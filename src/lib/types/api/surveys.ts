import z from 'zod';
import { makeResponseSchema } from './common';

export const surveyRequestItem = z
  .object({
    record_id: z.string().describe('Identifiant de la demande').openapi({ example: '0123456789abcdef01234567' }),
    created_at: z.string().describe('Date de création (ISO)').openapi({ example: '2025-12-17T12:34:56Z' }),
    type: z.string().describe('Enseignant chercheur, enseignants, autres'),
    voyage: z.string().describe('Type de demande (invitation ou voyage)'),
    name: z.string().describe("Nom de l'invité"),
    eunicoast: z.string().describe('Université Eunicoast'),
    gu8: z.string().describe('Université GU8'),
    uni: z.string().describe('Université Le Havre Normandie'),
    form_complete: z.string().describe('Complétude de la demande (ex: 0/1/2)'),
    avis: z
      .string()
      .describe(
        "Avis de la composante (code d'avis sous forme de chaîne ; par exemple '3' pour un avis défavorable / rejet, d'autres valeurs pouvant représenter d'autres états comme accord ou en attente)"
      ),
    composante_complete: z.string().describe('Complétude de la composante (ex: 0/1/2)'),
    avis_v2: z
      .string()
      .describe(
        "Avis du laboratoire (code d'avis sous forme de chaîne ; par exemple '3' pour un avis défavorable / rejet, d'autres valeurs pouvant représenter d'autres états comme accord ou en attente)"
      ),
    labo_complete: z.string().describe('Complétude du laboratoire (ex: 0/1/2)'),
    avis_v2_v2: z
      .string()
      .describe(
        "Avis de l'encadrant (code d'avis sous forme de chaîne ; par exemple '3' pour un avis défavorable / rejet, d'autres valeurs pouvant représenter d'autres états comme accord ou en attente)"
      ),
    encadrant_complete: z.string().describe("Complétude de l'encadrant (ex: 0/1/2)"),
    confirmation: z.string().describe("Confirmation finale par l'utilisateur"),
    validation_finale_complete: z.string().describe('Complétude de la validation finale (ex: 0/1/2)'),
    form: z.string().optional().describe('Lien vers le formulaire'),
    validation_finale: z.string().optional().describe('Lien vers la validation finale'),
  })
  .openapi('SurveyRequestItem');

export type SurveyRequestItem = z.infer<typeof surveyRequestItem>;

export const surveyRequestList = z.array(surveyRequestItem).openapi('SurveyRequestList');

export type SurveyRequestList = z.infer<typeof surveyRequestList>;

export const surveyListResponse = makeResponseSchema(surveyRequestList).openapi('SurveyListResponse');

export type SurveyListResponse = z.infer<typeof surveyListResponse>;
