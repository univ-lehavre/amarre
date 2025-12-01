import type { Fetch } from '$lib/types';
import { fetchRedcap } from '$lib/redcap/server';
import { transformToName } from '$lib/transformers/build-name';

interface Contact {
  id: string;
  last_name: string;
  first_name: string;
  middle_name: string;
}

export const listUsersFromRedcap = async (fetch: Fetch): Promise<{ id: string; name: string }[]> => {
  const contacts = await fetchRedcap<Contact[]>(fetch, {
    type: 'flat',
    fields: 'id,last_name,first_name,middle_name',
    forms: 'introduce_me',
  });
  const result = contacts.map(item => ({
    id: item.id,
    name: transformToName(item.first_name, item.middle_name, item.last_name),
  }));
  return result;
};

export const fetchUserId = async (fetch: Fetch, email: string): Promise<string | null> => {
  const requestData = { type: 'flat', fields: 'id', forms: 'contact', filterLogic: `[mail] = "${email}"` };
  const contacts = await fetchRedcap<{ id: string }[]>(fetch, requestData);
  const result = contacts.length === 1 ? contacts[0].id : null;
  return result;
};

export const mapAppwriteUserToProfile = (user: Record<string, unknown> | null, fallbackId?: string) => {
  if (!user) return { id: fallbackId ?? null, email: null, name: null };
  const result = {
    id: (user['$id'] as string) ?? fallbackId ?? null,
    email: (user['email'] as string) ?? null,
    labels: (user['labels'] as string[]) ?? [],
  };
  return result;
};
