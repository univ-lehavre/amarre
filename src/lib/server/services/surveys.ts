import type { Fetch } from '$lib/types';
import { fetchRedcapJSON, fetchRedcapText } from '$lib/server/redcap';
import { ID } from 'node-appwrite';
import type { TUser } from '$lib/types/api/user';
import type { SurveyRequestItem } from '$lib/types/api/surveys';

export const getSurveyUrl = async (record: string, context: { fetch: Fetch }): Promise<string> => {
  const result = await fetchRedcapText({ content: 'surveyLink', instrument: 'create_my_project', record }, context);
  return result;
};

export const downloadSurvey = async (userid: string, context: { fetch: Fetch }): Promise<unknown> => {
  const requestData = {
    type: 'flat',
    filterLogic: `[userid] = "${userid}"`,
    rawOrLabel: 'label',
    rawOrLabelHeaders: 'label',
    exportCheckboxLabel: 'true',
  };
  const result = await fetchRedcapJSON<unknown>(requestData, context);
  return result;
};

export const newRequest = async (user: TUser, { fetch }: { fetch: Fetch }) => {
  const payload = [
    {
      record_id: ID.unique(),
      created_at: new Date().toISOString(),
      userid: user.id,
      email: user.email,
      contact_complete: 1,
    },
  ];
  const requestData = {
    action: 'import',
    type: 'flat',
    overwriteBehavior: 'normal',
    forceAutoNumber: 'false',
    data: JSON.stringify(payload),
    returnContent: 'count',
  };
  const result = await fetchRedcapJSON<{ count: number }>(requestData, { fetch });
  return result;
};

export const listRequests = async (userid: string, { fetch }: { fetch: Fetch }): Promise<SurveyRequestItem[]> => {
  const requestData = {
    type: 'flat',
    filterLogic: `[userid] = "${userid}"`,
    fields: [
      'record_id',
      'created_at',
      'form_complete',
      'composante_complete',
      'labo_complete',
      'encadrant_complete',
      'validation_finale_complete',
    ].join(','),
  };
  const result = await fetchRedcapJSON<SurveyRequestItem[]>(requestData, { fetch });
  return result;
};
