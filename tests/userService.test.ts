import { describe, it, expect, beforeEach, vi } from 'vitest';
import { listUsersFromRedcap } from '../src/lib/server/services/userService';
import { transformToName } from '../src/lib/transformers/build-name';

describe('listUsersFromRedcap', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should map REDCap contacts to {id,name}', async () => {
    const contacts = [
      { id: '1', first_name: 'jean', middle_name: '', last_name: 'dupont' },
      { id: '2', first_name: 'marie', middle_name: 'louise', last_name: 'durand' },
    ];

    // mock global fetch
    globalThis.fetch = vi.fn(async () => ({ json: async () => contacts }) as unknown as Response);

    const result = await listUsersFromRedcap('token-x', 'https://redcap.test');

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ id: '1', name: transformToName('jean', '', 'dupont') });
    expect(result[1]).toEqual({ id: '2', name: transformToName('marie', 'louise', 'durand') });
  });

  it('returns empty array when REDCap returns no contacts', async () => {
    globalThis.fetch = vi.fn(async () => ({ json: async () => [] }) as unknown as Response);
    const result = await listUsersFromRedcap('token-x', 'https://redcap.test');
    expect(result).toEqual([]);
  });

  it('throws when fetch rejects (network error)', async () => {
    globalThis.fetch = vi.fn(async () => {
      throw new Error('network');
    });
    await expect(listUsersFromRedcap('token-x', 'https://redcap.test')).rejects.toThrow('network');
  });

  it('throws when response.json throws (invalid json)', async () => {
    globalThis.fetch = vi.fn(
      async () =>
        ({
          json: async () => {
            throw new Error('invalid json');
          },
        }) as unknown as Response,
    );
    await expect(listUsersFromRedcap('token-x', 'https://redcap.test')).rejects.toThrow('invalid json');
  });

  it('handles contacts with missing name parts', async () => {
    const contacts = [{ id: '3', first_name: '', middle_name: '', last_name: '' }];
    globalThis.fetch = vi.fn(async () => ({ json: async () => contacts }) as unknown as Response);
    const result = await listUsersFromRedcap('token-x', 'https://redcap.test');
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ id: '3', name: '' });
  });
});
