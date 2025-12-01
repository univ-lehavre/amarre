import type { Fetch } from '$lib/types';
import { REDCAP_API_TOKEN, REDCAP_URL } from '$env/static/private';

export const defaultParameters = {
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

const fetchRedcap = async (fetch: Fetch, params: Record<string, string>): Promise<Response> => {
  const requestData = { ...defaultParameters, ...params, token: REDCAP_API_TOKEN };
  const DATA = new URLSearchParams(requestData).toString();
  const response = await fetch(REDCAP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: DATA,
  });
  return response;
};

export const fetchRedcapJSON = async <T>(fetch: Fetch, params: Record<string, string>): Promise<T> => {
  const response = await fetchRedcap(fetch, params);
  return response.json() as Promise<T>;
};

export const fetchRedcapText = async (fetch: Fetch, params: Record<string, string>): Promise<string> => {
  const response = await fetchRedcap(fetch, params);
  return response.text();
};
