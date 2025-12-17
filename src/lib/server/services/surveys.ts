import type { Fetch } from '$lib/types';
import { fetchRedcapJSON, fetchRedcapText } from '$lib/server/redcap';
import { ID } from 'node-appwrite';

export const getSurveyUrl = async (record: string, context: { fetch: Fetch }): Promise<string> => {
  const result = await fetchRedcapText({ content: 'surveyLink', instrument: 'create_my_project', record }, context);
  return result;
};

export const downloadSurvey = async (record: string, context: { fetch: Fetch }) => {
  const requestData = {
    type: 'flat',
    'records[0]': record,
    rawOrLabel: 'label',
    rawOrLabelHeaders: 'label',
    exportCheckboxLabel: 'true',
  };
  const result = await fetchRedcapText(requestData, context);
  return result;
};

export const newRequest = async (email: string, { fetch }: { fetch: Fetch }) => {
  const payload = [{ record_id: ID.unique(), created_at: new Date().toISOString(), email, contact_complete: 1 }];
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
