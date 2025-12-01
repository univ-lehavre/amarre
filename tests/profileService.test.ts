import { beforeEach, describe, expect, it, vi } from 'vitest';

const getByIdMock = vi.fn();
const AppwriteUserRepositoryStub = vi.fn().mockImplementation(function AppwriteUserRepository() {
  return { getById: getByIdMock };
});

vi.mock('$lib/appwrite/server/userRepository', () => ({ AppwriteUserRepository: AppwriteUserRepositoryStub }));

describe('profileService.getProfile', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('returns the profile fetched from the repository', async () => {
    const expectedProfile = { id: 'user-123', email: 'user@test', labels: ['tester'] };
    getByIdMock.mockResolvedValueOnce(expectedProfile);

    const { getProfile } = await import('../src/lib/server/services/profileService');
    const profile = await getProfile('user-123');

    expect(AppwriteUserRepositoryStub).toHaveBeenCalledTimes(1);
    expect(getByIdMock).toHaveBeenCalledWith('user-123');
    expect(profile).toEqual(expectedProfile);
  });

  it('propagates repository errors', async () => {
    const failure = new Error('appwrite outage');
    getByIdMock.mockRejectedValueOnce(failure);

    const { getProfile } = await import('../src/lib/server/services/profileService');

    await expect(getProfile('user-999')).rejects.toThrow(failure);
  });
});
