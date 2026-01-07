import { describe, expect, it, vi } from 'vitest';
import { fetchUserId } from '$lib/server/services/surveys';

vi.mock('$lib/server/redcap', () => ({
  fetchRedcapJSON: vi.fn(),
}));

describe('fetchUserId', () => {
  it('returns userid when user exists', async () => {
    const { fetchRedcapJSON } = await import('$lib/server/redcap');
    const mockFetchRedcapJSON = fetchRedcapJSON as unknown as ReturnType<typeof vi.fn>;

    mockFetchRedcapJSON.mockResolvedValue([{ userid: 'user_123' }]);

    const result = await fetchUserId('test@example.com', { fetch: vi.fn() });

    expect(result).toBe('user_123');
    expect(mockFetchRedcapJSON).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'flat',
        fields: 'userid',
        rawOrLabel: 'raw',
        rawOrLabelHeaders: 'raw',
        exportCheckboxLabel: 'false',
        exportSurveyFields: 'false',
        exportDataAccessGroups: 'false',
        returnFormat: 'json',
        filterLogic: '[email] = "test@example.com"',
      }),
      { fetch: expect.any(Function) }
    );
  });

  it('returns null when no matching user found (empty results)', async () => {
    const { fetchRedcapJSON } = await import('$lib/server/redcap');
    const mockFetchRedcapJSON = fetchRedcapJSON as unknown as ReturnType<typeof vi.fn>;

    mockFetchRedcapJSON.mockResolvedValue([]);

    const result = await fetchUserId('nonexistent@example.com', { fetch: vi.fn() });

    expect(result).toBeNull();
  });

  it('returns userid from first record when multiple matching records exist', async () => {
    const { fetchRedcapJSON } = await import('$lib/server/redcap');
    const mockFetchRedcapJSON = fetchRedcapJSON as unknown as ReturnType<typeof vi.fn>;

    mockFetchRedcapJSON.mockResolvedValue([
      { userid: 'user_first' },
      { userid: 'user_second' },
      { userid: 'user_third' },
    ]);

    const result = await fetchUserId('duplicate@example.com', { fetch: vi.fn() });

    expect(result).toBe('user_first');
  });

  it('returns null when userid field is missing in the response', async () => {
    const { fetchRedcapJSON } = await import('$lib/server/redcap');
    const mockFetchRedcapJSON = fetchRedcapJSON as unknown as ReturnType<typeof vi.fn>;

    mockFetchRedcapJSON.mockResolvedValue([{}]);

    const result = await fetchUserId('test@example.com', { fetch: vi.fn() });

    expect(result).toBeNull();
  });

  it('returns null when userid field is empty string', async () => {
    const { fetchRedcapJSON } = await import('$lib/server/redcap');
    const mockFetchRedcapJSON = fetchRedcapJSON as unknown as ReturnType<typeof vi.fn>;

    mockFetchRedcapJSON.mockResolvedValue([{ userid: '' }]);

    const result = await fetchUserId('test@example.com', { fetch: vi.fn() });

    expect(result).toBeNull();
  });

  it('propagates API errors from fetchRedcapJSON', async () => {
    const { fetchRedcapJSON } = await import('$lib/server/redcap');
    const mockFetchRedcapJSON = fetchRedcapJSON as unknown as ReturnType<typeof vi.fn>;

    const apiError = new Error('REDCap API error');
    mockFetchRedcapJSON.mockRejectedValue(apiError);

    await expect(fetchUserId('test@example.com', { fetch: vi.fn() })).rejects.toThrow('REDCap API error');
  });

  it('handles network errors from fetchRedcapJSON', async () => {
    const { fetchRedcapJSON } = await import('$lib/server/redcap');
    const mockFetchRedcapJSON = fetchRedcapJSON as unknown as ReturnType<typeof vi.fn>;

    const networkError = new Error('Network failure');
    mockFetchRedcapJSON.mockRejectedValue(networkError);

    await expect(fetchUserId('test@example.com', { fetch: vi.fn() })).rejects.toThrow('Network failure');
  });
});
