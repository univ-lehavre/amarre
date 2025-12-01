import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('accountService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('checkAccountPushed returns correct flags when record matches', async () => {
    vi.resetModules();
    // mock appwrite/server so importing the service doesn't fail due to SvelteKit env imports
    vi.mock('$lib/appwrite/server', () => ({ getSession: () => ({}) }));
    const accountService = await import('../src/lib/server/services/accountService');
    const payload = [{ id: '1', mail: 'a@b', active: 'Oui' }];
    globalThis.fetch = vi.fn(async () => ({ json: async () => payload }) as unknown as Response);
    const res = await accountService.checkAccountPushed('tok', 'https://r', '1', 'a@b');
    expect(res.hasPushedID).toBe(true);
    expect(res.hasPushedEmail).toBe(true);
    expect(res.isActive).toBe(true);
    expect(res.hasPushedAccount).toBe(true);
  });

  it('checkAccountPushed handles missing record', async () => {
    vi.resetModules();
    vi.mock('$lib/appwrite/server', () => ({ getSession: () => ({}) }));
    const accountService = await import('../src/lib/server/services/accountService');
    globalThis.fetch = vi.fn(async () => ({ json: async () => [] }) as unknown as Response);
    const res = await accountService.checkAccountPushed('tok', 'https://r', '1', 'a@b');
    expect(res.hasPushedID).toBe(false);
    expect(res.hasPushedEmail).toBe(false);
    expect(res.isActive).toBe(false);
    expect(res.hasPushedAccount).toBe(false);
  });

  it('pushAccountToRedcap returns count', async () => {
    vi.resetModules();
    vi.mock('$lib/appwrite/server', () => ({ getSession: () => ({}) }));
    const accountService = await import('../src/lib/server/services/accountService');
    globalThis.fetch = vi.fn(async () => ({ json: async () => ({ count: 2 }) }) as unknown as Response);
    const res = await accountService.pushAccountToRedcap('tok', 'https://r', [{ id: '1' }]);
    expect(res).toEqual({ count: 2 });
  });

  it('throws when fetch rejects', async () => {
    vi.resetModules();
    vi.mock('$lib/appwrite/server', () => ({ getSession: () => ({}) }));
    const accountService = await import('../src/lib/server/services/accountService');
    globalThis.fetch = vi.fn(async () => {
      throw new Error('network');
    });
    await expect(accountService.checkAccountPushed('tok', 'https://r', '1', 'a@b')).rejects.toThrow('network');
  });
});
