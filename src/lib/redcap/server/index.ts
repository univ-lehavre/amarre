import { REDCAP_API_TOKEN, REDCAP_URL } from '$env/static/private';
import type { Fetch } from '$lib/types';

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

export const fetchRedcapText = async (fetch: Fetch, params: Record<string, string>): Promise<string> => {
  const requestData = { ...defaultParameters, ...params, token: REDCAP_API_TOKEN } as Record<string, string>;
  const DATA = new URLSearchParams(requestData).toString();
  const response = await fetch(REDCAP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: DATA,
  });
  return response.text();
};

export const fetchRedcap = async <T>(fetch: Fetch, params: Record<string, string>): Promise<T> => {
  const requestData = { ...defaultParameters, ...params, token: REDCAP_API_TOKEN } as Record<string, string>;
  const DATA = new URLSearchParams(requestData).toString();
  const response = await fetch(REDCAP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: DATA,
  });
  return response.json() as T;
};
