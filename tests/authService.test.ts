import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Cookies } from '@sveltejs/kit';
import { SESSION_COOKIE } from '../src/lib/constants';

const importAuthService = () => import('../src/lib/server/services/authService');

const setupModuleMocks = () => {
  const account = { createMagicURLToken: vi.fn(), createSession: vi.fn() };
  const users = { delete: vi.fn() };
  const sessionAccount = { deleteSessions: vi.fn() };

  const fetchUserId = vi.fn();
  const validateSignupEmail = vi.fn();
  const validateMagicUrlLogin = vi.fn();
  const validateUserId = vi.fn();
  const idUnique = vi.fn(() => 'generated-user-id');

  vi.doMock('$env/static/public', () => ({ PUBLIC_LOGIN_URL: 'https://login.test' }));

  vi.doMock('$lib/appwrite/server', () => ({
    createAdminClient: () => ({ account, users }),
    createSessionClient: () => ({ account: sessionAccount }),
  }));

  vi.doMock('$lib/server/services/userService', () => ({ fetchUserId }));

  vi.doMock('$lib/validators/server/auth', () => ({ validateSignupEmail, validateMagicUrlLogin, validateUserId }));

  vi.doMock('node-appwrite', () => ({ ID: { unique: idUnique } }));

  return {
    account,
    users,
    sessionAccount,
    fetchUserId,
    validateSignupEmail,
    validateMagicUrlLogin,
    validateUserId,
    idUnique,
  };
};

describe('authService', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  const buildCookies = () => ({ set: vi.fn(), delete: vi.fn() }) as unknown as Cookies;

  it('signupWithEmail reuses REDCap identifiers when available', async () => {
    const mocks = setupModuleMocks();
    const token = { $id: 'token-id', secret: 'token-secret' };
    mocks.validateSignupEmail.mockResolvedValue('user@example.com');
    mocks.fetchUserId.mockResolvedValue('redcap-123');
    mocks.account.createMagicURLToken.mockResolvedValue(token);

    const ctx = { fetch: vi.fn() as unknown as typeof fetch };
    const { signupWithEmail } = await importAuthService();
    const result = await signupWithEmail('raw@example.com', ctx);

    expect(mocks.validateSignupEmail).toHaveBeenCalledWith('raw@example.com');
    expect(mocks.fetchUserId).toHaveBeenCalledWith(ctx.fetch, 'user@example.com');
    expect(mocks.idUnique).not.toHaveBeenCalled();
    expect(mocks.account.createMagicURLToken).toHaveBeenCalledWith({
      userId: 'redcap-123',
      email: 'user@example.com',
      url: 'https://login.test/login',
    });
    expect(result).toBe(token);
  });

  it('signupWithEmail falls back to generated IDs when REDCap returns nothing', async () => {
    const mocks = setupModuleMocks();
    const token = { $id: 'token-id', secret: 'token-secret' };
    mocks.validateSignupEmail.mockResolvedValue('user@example.com');
    mocks.fetchUserId.mockResolvedValue(undefined);
    mocks.idUnique.mockReturnValueOnce('generated-42');
    mocks.account.createMagicURLToken.mockResolvedValue(token);

    const ctx = { fetch: vi.fn() as unknown as typeof fetch };
    const { signupWithEmail } = await importAuthService();
    const result = await signupWithEmail('raw@example.com', ctx);

    expect(mocks.fetchUserId).toHaveBeenCalledWith(ctx.fetch, 'user@example.com');
    expect(mocks.idUnique).toHaveBeenCalledTimes(1);
    expect(mocks.account.createMagicURLToken).toHaveBeenCalledWith({
      userId: 'generated-42',
      email: 'user@example.com',
      url: 'https://login.test/login',
    });
    expect(result).toBe(token);
  });

  it('login creates an Appwrite session and stores it in cookies', async () => {
    const mocks = setupModuleMocks();
    const session = { secret: 'session-secret', expire: '2025-06-01T00:00:00.000Z' };
    mocks.validateMagicUrlLogin.mockReturnValue({ userId: 'user-1', secret: 'secret-1' });
    mocks.account.createSession.mockResolvedValue(session);

    const cookies = buildCookies();
    const { login } = await importAuthService();
    const result = await login('raw-user', 'raw-secret', cookies);

    expect(mocks.validateMagicUrlLogin).toHaveBeenCalledWith('raw-user', 'raw-secret');
    expect(mocks.account.createSession).toHaveBeenCalledWith({ userId: 'user-1', secret: 'secret-1' });
    expect(cookies.set).toHaveBeenCalledWith(
      SESSION_COOKIE,
      'session-secret',
      expect.objectContaining({ sameSite: 'strict', secure: true, path: '/', expires: new Date(session.expire) }),
    );
    expect(result).toBe(session);
  });

  it('logout deletes all sessions and clears the session cookie', async () => {
    const mocks = setupModuleMocks();
    mocks.validateUserId.mockReturnValue('user-42');
    mocks.sessionAccount.deleteSessions.mockResolvedValue(undefined);

    const cookies = buildCookies();
    const { logout } = await importAuthService();
    await logout('maybe-user', cookies);

    expect(mocks.validateUserId).toHaveBeenCalledWith('maybe-user');
    expect(mocks.sessionAccount.deleteSessions).toHaveBeenCalledTimes(1);
    expect(cookies.delete).toHaveBeenCalledWith(SESSION_COOKIE, { path: '/' });
  });

  it('deleteUser logs out the user before deleting them from Appwrite', async () => {
    const mocks = setupModuleMocks();
    mocks.validateUserId.mockReturnValue('user-99');
    mocks.sessionAccount.deleteSessions.mockResolvedValue(undefined);
    mocks.users.delete.mockResolvedValue(undefined);

    const cookies = buildCookies();
    const { deleteUser } = await importAuthService();
    await deleteUser('raw-user', cookies);

    expect(mocks.validateUserId).toHaveBeenCalledTimes(2);
    expect(mocks.validateUserId).toHaveBeenNthCalledWith(1, 'raw-user');
    expect(mocks.validateUserId).toHaveBeenNthCalledWith(2, 'user-99');
    expect(mocks.sessionAccount.deleteSessions).toHaveBeenCalledTimes(1);
    expect(mocks.users.delete).toHaveBeenCalledWith({ userId: 'user-99' });
    expect(cookies.delete).toHaveBeenCalledWith(SESSION_COOKIE, { path: '/' });
  });
});
