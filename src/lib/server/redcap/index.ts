import type { Fetch } from '$lib/types';
import { REDCAP_API_TOKEN } from '$env/static/private';
import { PUBLIC_REDCAP_URL } from '$env/static/public';

const defaultParameters = {
  content: 'record',
  action: 'export',
  format: 'json',
  type: 'eav',
  csvDelimiter: '',
  records: '',
  fields: '',
  forms: '',
  rawOrLabel: 'raw',
  rawOrLabelHeaders: 'raw',
  exportCheckboxLabel: 'false',
  exportSurveyFields: 'false',
  exportDataAccessGroups: 'false',
  returnFormat: 'json',
  filterLogic: '',
};

const fetchRedcap = async (params: Record<string, string>, context: { fetch: Fetch }): Promise<Response> => {
  const requestData: Record<string, string> = { ...defaultParameters, ...params, token: REDCAP_API_TOKEN };
  const DATA = new URLSearchParams(requestData).toString();
  const response = await context.fetch(PUBLIC_REDCAP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: DATA,
  });
  return response;
};

export const fetchRedcapJSON = async <T>(params: Record<string, string>, context: { fetch: Fetch }): Promise<T> => {
  const response = await fetchRedcap(params, context);
  return response.json() as Promise<T>;
};

export const fetchRedcapText = async (params: Record<string, string>, context: { fetch: Fetch }): Promise<string> => {
  const response = await fetchRedcap(params, context);
  return response.text();
};
