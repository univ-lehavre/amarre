import type { Actions } from './$types';

import type { PageServerLoad } from './$types';
import type { TUser } from '$lib/types/api/user';

export const load: PageServerLoad = async ({ fetch, locals }) => {
  const userId = locals.userId;
  if (!userId) return { user: null };
  const user = (await fetch('/api/v1/me').then(res => res.json())) as { data: TUser } | null;
  const result = { user: user?.data };
  return result;
};

export const actions = {
  newSurvey: event => event.fetch(`/api/v1/surveys/new`).then(res => res.json()),
  signup: event =>
    event.request
      .formData()
      .then(body => event.fetch(`/api/v1/auth/signup`, { method: 'POST', body }))
      .then(res => res.json()),
  logout: event => event.fetch(`/api/v1/auth/logout`, { method: 'POST' }).then(res => res.json()),
} satisfies Actions;
