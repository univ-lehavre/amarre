import type { Fetch } from '$lib/types';
import { env as private_env } from '$env/dynamic/private';

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
  const token = private_env.REDCAP_API_TOKEN;
  const url = private_env.REDCAP_URL;
  if (!token || !url) throw new Error('REDCAP env not configured');
  const requestData: Record<string, string> = { ...defaultParameters, ...params, token };
  const DATA = new URLSearchParams(requestData).toString();
  const response = await context.fetch(url, {
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
