import * as net from 'node:net';
import * as tls from 'node:tls';
import { PUBLIC_APPWRITE_ENDPOINT } from '$env/static/public';

/**
 * Result of a TCP connection check
 */
export interface TcpCheckResult {
  ok: boolean;
  latencyMs?: number;
  error?: string;
}

/**
 * Certificate information from TLS check
 */
export interface CertInfo {
  subjectCN: string;
  issuerCN: string;
  validFrom: string;
  validTo: string;
  fingerprint256: string;
}

/**
 * Result of a TLS/HTTPS check
 */
export interface TlsCheckResult {
  ok: boolean;
  latencyMs?: number;
  authorized: boolean;
  protocol?: string;
  alpnProtocol?: string;
  cert?: CertInfo;
  error?: string;
}

/**
 * Complete online check result
 */
export interface OnlineCheckResult {
  online: boolean;
  host: string;
  port: number;
  timeoutMs: number;
  tcp: TcpCheckResult;
  tls: TlsCheckResult;
}

/**
 * Extract hostname from Appwrite endpoint URL
 */
export function getAppwriteHostname(): string | null {
  if (!PUBLIC_APPWRITE_ENDPOINT) return null;
  try {
    const url = new URL(PUBLIC_APPWRITE_ENDPOINT);
    return url.hostname;
  } catch {
    return null;
  }
}

/**
 * Get the list of allowed hosts for health checks (anti-SSRF)
 */
export function getAllowedHosts(): string[] {
  const hosts = ['www.google.com', 'redcap.univ-lehavre.fr'];
  const appwriteHost = getAppwriteHostname();
  if (appwriteHost) {
    hosts.push(appwriteHost);
  }
  return hosts;
}

/**
 * Validate that a host is in the allowlist
 */
export function isHostAllowed(host: string): boolean {
  const allowedHosts = getAllowedHosts();
  return allowedHosts.includes(host);
}

/**
 * Perform a TCP connection check
 */
export async function checkTcpConnection(host: string, port: number, timeoutMs: number): Promise<TcpCheckResult> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const socket = new net.Socket();

    const cleanup = () => {
      socket.removeAllListeners();
      socket.destroy();
    };

    const timer = setTimeout(() => {
      cleanup();
      resolve({ ok: false, error: 'TCP connection timeout' });
    }, timeoutMs);

    socket.on('connect', () => {
      clearTimeout(timer);
      const latencyMs = Date.now() - startTime;
      cleanup();
      resolve({ ok: true, latencyMs });
    });

    socket.on('error', (err) => {
      clearTimeout(timer);
      cleanup();
      resolve({ ok: false, error: err.message });
    });

    socket.connect(port, host);
  });
}

/**
 * Perform a TLS/HTTPS check with strict certificate validation
 */
export async function checkTlsConnection(host: string, port: number, timeoutMs: number): Promise<TlsCheckResult> {
  return new Promise((resolve) => {
    const startTime = Date.now();

    const options: tls.ConnectionOptions = {
      host,
      port,
      servername: host, // SNI
      rejectUnauthorized: true, // Strict certificate validation
      checkServerIdentity: tls.checkServerIdentity, // Hostname validation
    };

    const socket = tls.connect(options);

    const cleanup = () => {
      socket.removeAllListeners();
      socket.destroy();
    };

    const timer = setTimeout(() => {
      cleanup();
      resolve({ ok: false, authorized: false, error: 'TLS connection timeout' });
    }, timeoutMs);

    socket.on('secureConnect', () => {
      clearTimeout(timer);
      const latencyMs = Date.now() - startTime;
      const authorized = socket.authorized;
      const protocolValue = socket.getProtocol();
      const alpnProtocolValue = socket.alpnProtocol;

      let cert: CertInfo | undefined;
      if (authorized) {
        const peerCert = socket.getPeerCertificate();
        if (peerCert && Object.keys(peerCert).length > 0) {
          cert = {
            subjectCN: peerCert.subject?.CN || '',
            issuerCN: peerCert.issuer?.CN || '',
            validFrom: peerCert.valid_from || '',
            validTo: peerCert.valid_to || '',
            fingerprint256: peerCert.fingerprint256 || '',
          };
        }
      }

      cleanup();
      const result: TlsCheckResult = {
        ok: true,
        latencyMs,
        authorized,
      };
      
      if (protocolValue) {
        result.protocol = protocolValue;
      }
      
      if (alpnProtocolValue && typeof alpnProtocolValue === 'string') {
        result.alpnProtocol = alpnProtocolValue;
      }
      
      if (cert) {
        result.cert = cert;
      }
      
      resolve(result);
    });

    socket.on('error', (err) => {
      clearTimeout(timer);
      cleanup();
      resolve({
        ok: false,
        authorized: false,
        error: err.message,
      });
    });
  });
}

/**
 * Perform a complete online check (TCP + TLS)
 */
export async function checkOnline(host: string, port: number, timeoutMs: number): Promise<OnlineCheckResult> {
  const tcp = await checkTcpConnection(host, port, timeoutMs);
  const tls = await checkTlsConnection(host, port, timeoutMs);

  const online = tcp.ok && tls.ok && tls.authorized === true;

  return {
    online,
    host,
    port,
    timeoutMs,
    tcp,
    tls,
  };
}
