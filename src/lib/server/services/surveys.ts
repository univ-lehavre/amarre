import type { Fetch } from '$lib/types';
import { fetchRedcapJSON, fetchRedcapText } from '$lib/server/redcap';
import { ID } from 'node-appwrite';
import type { TUser } from '$lib/types/api/user';
import type { SurveyRequestItem } from '$lib/types/api/surveys';

/**
 * Escapes special characters in a value to be used in REDCap filterLogic.
 * This prevents injection attacks by escaping double quotes and backslashes.
 * @param value - The value to escape
 * @returns The escaped value safe for use in filterLogic
 */
const escapeFilterLogicValue = (value: string): string => {
  // Escape backslashes first, then double quotes
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
};

export const getSurveyUrl = async (record: string, instrument: string, context: { fetch: Fetch }): Promise<string> => {
  const result = await fetchRedcapText({ content: 'surveyLink', instrument, record }, context);
  return result;
};

export const downloadSurvey = async (userid: string, context: { fetch: Fetch }): Promise<unknown> => {
  const requestData = {
    type: 'flat',
    filterLogic: `[userid] = "${escapeFilterLogicValue(userid)}"`,
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
    filterLogic: `[userid] = "${escapeFilterLogicValue(userid)}"`,
    fields: [
      'record_id',
      'created_at',
      'type',
      'voyage',
      'name',
      'eunicoast',
      'gu8',
      'uni',
      'form_complete',
      'avis',
      'composante_complete',
      'avis_v2',
      'labo_complete',
      'avis_v2_v2',
      'encadrant_complete',
      'confirmation',
      'validation_finale_complete',
    ].join(','),
  };
  const result = await fetchRedcapJSON<SurveyRequestItem[]>(requestData, { fetch });
  return result;
};

type contactId = { userid: string };

/**
 * Looks up the REDCap contact associated with the given email address and returns its userid.
 *
 * @param email - The email address used to filter REDCap contact records.
 * @param fetch - An object providing a `fetch` implementation used to call the REDCap API.
 * @returns The userid string of the first matching contact, or `null` if no matching user is found.
 */
export const fetchUserId = async (email: string, { fetch }: { fetch: Fetch }): Promise<string | null> => {
  const requestData = {
    type: 'flat',
    fields: 'userid',
    rawOrLabel: 'raw',
    rawOrLabelHeaders: 'raw',
    exportCheckboxLabel: 'false',
    exportSurveyFields: 'false',
    exportDataAccessGroups: 'false',
    returnFormat: 'json',
    filterLogic: `[email] = "${escapeFilterLogicValue(email)}"`,
  };
  const contacts: contactId[] = await fetchRedcapJSON<contactId[]>(requestData, { fetch });
  const result = contacts.length > 0 && contacts[0]?.userid ? contacts[0].userid : null;
  return result;
};
