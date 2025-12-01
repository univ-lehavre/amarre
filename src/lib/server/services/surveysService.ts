import type { Fetch } from '$lib/types';
import { fetchRedcapText } from '$lib/redcap/server';

export const getSurveyUrl = async (record: string, fetch: Fetch): Promise<string> => {
  const result = await fetchRedcapText(fetch, { content: 'surveyLink', instrument: 'create_my_project', record });
  return result;
};

export const deleteSurveyRecord = async (record: string) => {
  const result = await fetchRedcapText(fetch, { action: 'delete', 'records[0]': record });
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
  const result = await fetchRedcapText(context.fetch, requestData);
  return result;
};
