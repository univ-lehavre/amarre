import type { Cookies } from '@sveltejs/kit';
import { ID, type Models } from 'node-appwrite';

import { SESSION_COOKIE } from '$lib/constants';
import { env } from '$env/dynamic/public';
import { createAdminClient, createSessionClient } from '$lib/server/appwrite';
import { validateMagicUrlLogin, validateSignupEmail, validateUserId } from '$lib/server/validators/auth';

export const signupWithEmail = async (unsecuredEmail: unknown): Promise<Models.Token> => {
  // Validate email
  const email: string = await validateSignupEmail(unsecuredEmail);

  // Fix redirect URL
  const url: string = `${env.PUBLIC_LOGIN_URL}/login`;

  // Create magic URL token
  const { account } = createAdminClient();
  const userId: string = ID.unique();
  const token: Models.Token = await account.createMagicURLToken({ userId, email, url });

  return token;
};

export const login = async (
  unsecuredUserId: unknown,
  unsecuredSecret: unknown,
  cookies: Cookies,
): Promise<Models.Session> => {
  // Validate inputs
  const { userId, secret } = validateMagicUrlLogin(unsecuredUserId, unsecuredSecret);

  // Create session
  const { account } = createAdminClient();
  const session: Models.Session = await account.createSession({ userId, secret });
  cookies.set(SESSION_COOKIE, session.secret, {
    sameSite: 'strict',
    expires: new Date(session.expire),
    secure: true,
    path: '/',
  });

  return session;
};

export const logout = async (unsecuredUserId: unknown, cookies: Cookies): Promise<void> => {
  // Validate userId
  validateUserId(unsecuredUserId);

  // Delete all sessions for the user
  const { account } = createSessionClient(cookies);
  await account.deleteSessions();
  cookies.delete(SESSION_COOKIE, { path: '/' });
};
