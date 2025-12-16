import { fail } from '@sveltejs/kit';

import type { TUser } from '$lib/types/api/user';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ fetch, locals }) => {
  const userId = locals.userId;
  if (!userId) return { user: null };
  const user = (await fetch('/api/v1/me').then(res => res.json())) as { data: TUser } | null;
  const result = { user: user?.data };
  return result;
};

export const actions = {
  newSurvey: event => event.fetch(`/api/v1/surveys/new`, { method: 'POST' }).then(res => res.json()),
  signup: async event => {
    const data: FormData = await event.request.formData();
    const email: string | undefined = data.get('email')?.toString();
    const response = await event
      .fetch(`/api/v1/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      .then(res => res.json());
    if (response.error) fail(response.status, { message: response.error.message });
    return response;
  },
  logout: event => event.fetch(`/api/v1/auth/logout`, { method: 'POST' }).then(res => res.json()),
} satisfies Actions;
