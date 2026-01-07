import { describe, expect, it, vi } from 'vitest';
import type { Fetch } from '$lib/types';

// Mock the redcap module
vi.mock('$lib/server/redcap', () => ({
  fetchRedcapJSON: vi.fn(),
  fetchRedcapText: vi.fn(),
}));

// Mock node-appwrite
vi.mock('node-appwrite', () => ({
  ID: { unique: vi.fn(() => 'mock-id') },
}));

describe('surveys service - fetchUserId', () => {
  it('should escape double quotes in email addresses', async () => {
    const { fetchUserId } = await import('$lib/server/services/surveys');
    const { fetchRedcapJSON } = await import('$lib/server/redcap');
    const mockFetchRedcapJSON = fetchRedcapJSON as unknown as ReturnType<typeof vi.fn>;

    mockFetchRedcapJSON.mockResolvedValue([{ userid: 'user123' }]);

    const mockFetch = vi.fn() as unknown as Fetch;
    await fetchUserId('test"quote@example.com', { fetch: mockFetch });

    // Verify that the filterLogic has escaped the double quote
    expect(mockFetchRedcapJSON).toHaveBeenCalledWith(
      expect.objectContaining({
        filterLogic: '[email] = "test\\"quote@example.com"',
      }),
      expect.any(Object)
    );
  });

  it('should escape backslashes in email addresses', async () => {
    const { fetchUserId } = await import('$lib/server/services/surveys');
    const { fetchRedcapJSON } = await import('$lib/server/redcap');
    const mockFetchRedcapJSON = fetchRedcapJSON as unknown as ReturnType<typeof vi.fn>;

    mockFetchRedcapJSON.mockResolvedValue([{ userid: 'user456' }]);

    const mockFetch = vi.fn() as unknown as Fetch;
    await fetchUserId('test\\backslash@example.com', { fetch: mockFetch });

    // Verify that the filterLogic has escaped the backslash
    expect(mockFetchRedcapJSON).toHaveBeenCalledWith(
      expect.objectContaining({
        filterLogic: '[email] = "test\\\\backslash@example.com"',
      }),
      expect.any(Object)
    );
  });

  it('should handle normal email addresses without special characters', async () => {
    const { fetchUserId } = await import('$lib/server/services/surveys');
    const { fetchRedcapJSON } = await import('$lib/server/redcap');
    const mockFetchRedcapJSON = fetchRedcapJSON as unknown as ReturnType<typeof vi.fn>;

    mockFetchRedcapJSON.mockResolvedValue([{ userid: 'user789' }]);

    const mockFetch = vi.fn() as unknown as Fetch;
    await fetchUserId('normal@example.com', { fetch: mockFetch });

    // Verify that the filterLogic is correctly formatted
    expect(mockFetchRedcapJSON).toHaveBeenCalledWith(
      expect.objectContaining({
        filterLogic: '[email] = "normal@example.com"',
      }),
      expect.any(Object)
    );
  });

  it('should handle email addresses with both backslashes and quotes', async () => {
    const { fetchUserId } = await import('$lib/server/services/surveys');
    const { fetchRedcapJSON } = await import('$lib/server/redcap');
    const mockFetchRedcapJSON = fetchRedcapJSON as unknown as ReturnType<typeof vi.fn>;

    mockFetchRedcapJSON.mockResolvedValue([{ userid: 'user101' }]);

    const mockFetch = vi.fn() as unknown as Fetch;
    await fetchUserId('test\\"mixed@example.com', { fetch: mockFetch });

    // Verify that both backslashes and quotes are properly escaped
    expect(mockFetchRedcapJSON).toHaveBeenCalledWith(
      expect.objectContaining({
        filterLogic: '[email] = "test\\\\\\"mixed@example.com"',
      }),
      expect.any(Object)
    );
  });
});

describe('surveys service - downloadSurvey', () => {
  it('should escape special characters in userid', async () => {
    const { downloadSurvey } = await import('$lib/server/services/surveys');
    const { fetchRedcapJSON } = await import('$lib/server/redcap');
    const mockFetchRedcapJSON = fetchRedcapJSON as unknown as ReturnType<typeof vi.fn>;

    mockFetchRedcapJSON.mockResolvedValue({});

    const mockFetch = vi.fn() as unknown as Fetch;
    await downloadSurvey('user"123', { fetch: mockFetch });

    // Verify that the filterLogic has escaped the double quote
    expect(mockFetchRedcapJSON).toHaveBeenCalledWith(
      expect.objectContaining({
        filterLogic: '[userid] = "user\\"123"',
      }),
      expect.any(Object)
    );
  });
});

describe('surveys service - listRequests', () => {
  it('should escape special characters in userid', async () => {
    const { listRequests } = await import('$lib/server/services/surveys');
    const { fetchRedcapJSON } = await import('$lib/server/redcap');
    const mockFetchRedcapJSON = fetchRedcapJSON as unknown as ReturnType<typeof vi.fn>;

    mockFetchRedcapJSON.mockResolvedValue([]);

    const mockFetch = vi.fn() as unknown as Fetch;
    await listRequests('user"456', { fetch: mockFetch });

    // Verify that the filterLogic has escaped the double quote
    expect(mockFetchRedcapJSON).toHaveBeenCalledWith(
      expect.objectContaining({
        filterLogic: '[userid] = "user\\"456"',
      }),
      expect.any(Object)
    );
  });
});
