import { describe, expect, it } from 'vitest';

describe('online-check utility', () => {
  describe('getAppwriteHostname', () => {
    it('returns null or a valid hostname string', async () => {
      const { getAppwriteHostname } = await import('../../../../src/lib/server/net/online-check');
      const hostname = getAppwriteHostname();
      // Will return null if PUBLIC_APPWRITE_ENDPOINT is not set or invalid, or a hostname if valid
      expect(hostname === null || typeof hostname === 'string').toBe(true);
      if (hostname) {
        expect(hostname.length).toBeGreaterThan(0);
      }
    });
  });

  describe('getAllowedHosts', () => {
    it('always includes www.google.com and redcap.univ-lehavre.fr', async () => {
      const { getAllowedHosts } = await import('../../../../src/lib/server/net/online-check');
      const hosts = getAllowedHosts();
      expect(hosts).toContain('www.google.com');
      expect(hosts).toContain('redcap.univ-lehavre.fr');
      expect(hosts.length).toBeGreaterThanOrEqual(2);
    });

    it('includes Appwrite hostname when PUBLIC_APPWRITE_ENDPOINT is valid', async () => {
      const { getAllowedHosts, getAppwriteHostname } = await import('../../../../src/lib/server/net/online-check');
      const hosts = getAllowedHosts();
      const appwriteHost = getAppwriteHostname();
      
      if (appwriteHost) {
        // If we have an Appwrite hostname, it should be in the list
        expect(hosts).toContain(appwriteHost);
      } else {
        // If no Appwrite hostname, list should only have the 2 base hosts
        expect(hosts.length).toBe(2);
      }
    });
  });

  describe('isHostAllowed', () => {
    it('returns true for www.google.com', async () => {
      const { isHostAllowed } = await import('../../../../src/lib/server/net/online-check');
      expect(isHostAllowed('www.google.com')).toBe(true);
    });

    it('returns true for redcap.univ-lehavre.fr', async () => {
      const { isHostAllowed } = await import('../../../../src/lib/server/net/online-check');
      expect(isHostAllowed('redcap.univ-lehavre.fr')).toBe(true);
    });

    it('returns true for Appwrite hostname if configured', async () => {
      const { isHostAllowed, getAppwriteHostname } = await import('../../../../src/lib/server/net/online-check');
      const appwriteHost = getAppwriteHostname();
      
      if (appwriteHost) {
        expect(isHostAllowed(appwriteHost)).toBe(true);
      }
      // If no Appwrite hostname, this test just passes
    });

    it('returns false for non-allowlisted host', async () => {
      const { isHostAllowed } = await import('../../../../src/lib/server/net/online-check');
      expect(isHostAllowed('malicious.example.com')).toBe(false);
    });

    it('returns false for localhost (SSRF protection)', async () => {
      const { isHostAllowed } = await import('../../../../src/lib/server/net/online-check');
      expect(isHostAllowed('localhost')).toBe(false);
    });

    it('returns false for internal IP (SSRF protection)', async () => {
      const { isHostAllowed } = await import('../../../../src/lib/server/net/online-check');
      expect(isHostAllowed('192.168.1.1')).toBe(false);
    });

    it('returns false for 127.0.0.1 (SSRF protection)', async () => {
      const { isHostAllowed } = await import('../../../../src/lib/server/net/online-check');
      expect(isHostAllowed('127.0.0.1')).toBe(false);
    });
  });
});
