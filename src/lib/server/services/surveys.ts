import type { Fetch } from '$lib/types';
import { fetchRedcapText } from '$lib/server/redcap';

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
