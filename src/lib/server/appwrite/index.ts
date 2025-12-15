import { Client, Account, Users } from 'node-appwrite';
import type { Cookies } from '@sveltejs/kit';

import { SessionError } from '$lib/errors';
import { SESSION_COOKIE } from '$lib/constants';
import { env as private_env } from '$env/dynamic/private';
import { env } from '$env/dynamic/public';

interface AdminClient {
  readonly account: Account;
  readonly users: Users;
}

const createAdminClient = (): AdminClient => {
  if (!env.PUBLIC_APPWRITE_ENDPOINT || !env.PUBLIC_APPWRITE_PROJECT || !private_env.APPWRITE_KEY) {
    throw new Error('Appwrite admin client not configured: missing environment variables');
  }

  const client = new Client()
    .setEndpoint(env.PUBLIC_APPWRITE_ENDPOINT)
    .setProject(env.PUBLIC_APPWRITE_PROJECT)
    .setKey(private_env.APPWRITE_KEY);

  return {
    get account() {
      return new Account(client);
    },
    get users() {
      return new Users(client);
    },
  };
};

const createSession = (cookies: Cookies): Client => {
  const client: Client = new Client().setEndpoint(env.PUBLIC_APPWRITE_ENDPOINT).setProject(env.PUBLIC_APPWRITE_PROJECT);
  const session: string | undefined = cookies.get(SESSION_COOKIE);
  if (!session || session === '') throw new SessionError('No active session', { cause: 'No secret set in cookie' });

  client.setSession(session);
  return client;
};

interface SessionAccount {
  readonly account: Account;
}

const createSessionClient = (cookies: Cookies): SessionAccount => {
  const client = createSession(cookies);
  return {
    get account() {
      return new Account(client);
    },
  };
};

export { createAdminClient, createSessionClient };
