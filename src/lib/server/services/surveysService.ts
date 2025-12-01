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

export const downloadSurvey = async (fetch: Fetch, record: string) => {
  const requestData = {
    type: 'flat',
    'records[0]': record,
    rawOrLabel: 'label',
    rawOrLabelHeaders: 'label',
    exportCheckboxLabel: 'true',
  } as const;
  const result = await fetchRedcapText(fetch, requestData);
  return result;
};
