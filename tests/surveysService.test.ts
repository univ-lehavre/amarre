import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as surveysService from '../src/lib/server/services/surveysService';

describe('surveysService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('getSurveyUrl should POST and return text', async () => {
    globalThis.fetch = vi.fn(async () => ({ text: async () => 'https://survey' }) as unknown as Response);
    const url = await surveysService.getSurveyUrl('tok', 'https://r', 'instr', 'rec');
    expect(url).toEqual('https://survey');
  });

  it('deleteSurveyRecord should POST and return text', async () => {
    globalThis.fetch = vi.fn(async () => ({ text: async () => 'deleted' }) as unknown as Response);
    const res = await surveysService.deleteSurveyRecord('tok', 'https://r', 'rec');
    expect(res).toEqual('deleted');
  });

  it('downloadSurvey should POST and return json', async () => {
    const payload = [{ a: 1 }];
    globalThis.fetch = vi.fn(async () => ({ json: async () => payload }) as unknown as Response);
    const res = await surveysService.downloadSurvey('tok', 'https://r', 'rec');
    expect(res).toEqual(payload);
  });

  it('throws when fetch rejects', async () => {
    globalThis.fetch = vi.fn(async () => {
      throw new Error('network');
    });
    await expect(surveysService.getSurveyUrl('tok', 'https://r', 'i', 'r')).rejects.toThrow('network');
  });
});
