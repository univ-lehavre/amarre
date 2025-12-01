import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import { spawn } from 'child_process';
import type { ChildProcessWithoutNullStreams } from 'child_process';
import fs from 'fs/promises';

const PRISM_PORT = 4011;
const PRISM_URL = `http://localhost:${PRISM_PORT}`;
let prismProcess: ChildProcessWithoutNullStreams | null = null;
let openapiDoc: unknown = null;
let OpenAPIResponseValidator: unknown = null;

// Local lightweight OpenAPI typings for runtime validation usage
type OpenAPIDoc = {
  servers?: Array<{ url?: string }>;
  paths?: Record<string, unknown>;
  components?: Record<string, unknown>;
};

type ValidatorCtor = new (opts: { responses: unknown; components?: unknown }) => {
  validateResponse: (status: string, body: unknown) => { errors?: Array<unknown> };
};

function waitForPrism(timeout = 10000) {
  const start = Date.now();
  return new Promise<void>((resolve, reject) => {
    const check = async () => {
      try {
        const res = await fetch(PRISM_URL + '/');
        if (res) return resolve();
      } catch {
        // ignore and retry
      }
      if (Date.now() - start >= timeout) return reject(new Error('Prism did not start within timeout'));
      setTimeout(check, 200);
    };
    void check();
  });
}

beforeAll(async () => {
  // start Prism mock server using npx so local devDependency is used
  // Prefer Prism programmatic API if available, fall back to CLI
  let usedApi = false;
  try {
    const prismMod = await import('@stoplight/prism-http').catch(() => null);
    if (prismMod) {
      const createServer = (prismMod as unknown as { createServer?: unknown }).createServer;
      if (typeof createServer === 'function') {
        // createServer may accept a document path or object
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const server = await (createServer as any)({
          document: './static/api/openapi.json',
          config: { mock: { dynamic: true } },
        });
        if (server && typeof (server as { listen?: unknown }).listen === 'function') {
          await new Promise<void>((resolve, reject) => {
            (
              (server as { listen?: (p: number, cb: (err?: Error) => void) => void }).listen as (
                p: number,
                cb: (err?: Error) => void,
              ) => void
            )(PRISM_PORT, (err?: Error) => (err ? reject(err) : resolve()));
          });
        }
        // we don't rely on an internal server handle for shutdown here
        usedApi = true;
        console.log('[prism] started via @stoplight/prism-http API');
      }
    }
  } catch {
    // API not available or failed, we'll fallback to CLI
  }

  if (!usedApi) {
    // start Prism mock server using the CLI
    prismProcess = spawn(
      'npx',
      ['@stoplight/prism-cli', 'mock', './static/api/openapi.json', '-p', String(PRISM_PORT)],
      { cwd: process.cwd(), env: process.env, stdio: ['ignore', 'pipe', 'pipe'] },
    ) as unknown as ChildProcessWithoutNullStreams;

    prismProcess.stdout.on('data', d => {
      console.log('[prism]', d.toString().trim());
    });
    prismProcess.stderr.on('data', d => {
      console.error('[prism]', d.toString().trim());
    });
  }

  await waitForPrism(15000);

  // load OpenAPI spec and validator
  const raw = await fs.readFile('./static/api/openapi.json', 'utf8');
  openapiDoc = JSON.parse(raw) as unknown;
  const mod = await import('openapi-response-validator').catch(() => null);
  // module may export constructor as default or as the module itself depending on ESM/CJS interop
  OpenAPIResponseValidator = (mod && ((mod as unknown as { default?: unknown }).default ?? mod)) ?? null;
});

afterAll(() => {
  if (prismProcess && !prismProcess.killed) {
    prismProcess.kill();
  }
});

describe('Contract tests against Prism mock', () => {
  async function fetchWithFallback(paths: string[]) {
    for (const p of paths) {
      try {
        const res = await fetch(`${PRISM_URL}${p}`);
        const text = await res.text();
        let body: unknown = null;
        try {
          body = text ? JSON.parse(text) : null;
        } catch {
          body = text;
        }
        // If Prism returns NO_PATH_MATCHED it will still be a 4xx; treat as missing
        if (res.status >= 400 && typeof body === 'object' && body) {
          const b = body as Record<string, unknown>;
          const isNoPath =
            (typeof b['code'] === 'string' && String(b['code']) === 'NO_PATH_MATCHED_ERROR') ||
            (typeof b['type'] === 'string' && String(b['type']).includes('NO_PATH_MATCHED')) ||
            (typeof b['title'] === 'string' && String(b['title']).includes('Route not resolved'));
          if (isNoPath) continue;
        }
        return { res, body };
      } catch {
        // try next
      }
    }
    throw new Error('No path resolved by Prism mock');
  }

  function findSpecPath(requestPath: string) {
    if (!openapiDoc) return null;
    const spec = openapiDoc as OpenAPIDoc;
    const servers: string[] = (spec.servers || []).map(s => (s && s.url) || '');
    // Try stripping server prefixes
    for (const s of servers) {
      if (s && requestPath.startsWith(s)) {
        const candidate = requestPath.slice(s.length) || '/';
        if (spec.paths && Object.prototype.hasOwnProperty.call(spec.paths, candidate)) return candidate;
      }
    }
    // direct match
    if (spec.paths && Object.prototype.hasOwnProperty.call(spec.paths, requestPath)) return requestPath;
    // try with leading slash
    const withSlash = requestPath.startsWith('/') ? requestPath : '/' + requestPath;
    if (spec.paths && Object.prototype.hasOwnProperty.call(spec.paths, withSlash)) return withSlash;
    return null;
  }

  function validateAgainstSpec(requestPath: string, method: string, status: number, body: unknown) {
    const specPath = findSpecPath(requestPath);
    if (!specPath) throw new Error(`No matching path in OpenAPI for ${requestPath}`);
    const spec = openapiDoc as OpenAPIDoc;
    const operation = (spec.paths as Record<string, unknown>)[specPath] as Record<string, unknown> | undefined;
    if (!operation) throw new Error(`No operation ${method} for path ${specPath}`);
    const operationObj = operation as Record<string, unknown>;
    const opMethod = (operationObj[method.toLowerCase()] as Record<string, unknown> | undefined) ?? operationObj;
    const responses = opMethod['responses'] as unknown;
    const Validator = OpenAPIResponseValidator as unknown as ValidatorCtor;
    const validator = new Validator({ responses, components: spec.components });
    const statusCandidates = [String(status), '200', 'default'];
    const errorsCollected: Array<unknown> = [];
    for (const s of statusCandidates) {
      try {
        const result = validator.validateResponse(s, body);
        if (!result || !result.errors || (result.errors && result.errors.length === 0)) {
          return; // validated
        }
        errorsCollected.push({ status: s, errors: result.errors });
      } catch (err) {
        errorsCollected.push({ status: s, error: String(err) });
      }
    }
    // dump body for debugging to help identify unexpected extra properties
    console.error('[contract] validation failures:', JSON.stringify(errorsCollected, null, 2));
    console.error(
      '[contract] response body sample:',
      (() => {
        try {
          return JSON.stringify(body, null, 2).slice(0, 10000);
        } catch {
          return String(body);
        }
      })(),
    );
    throw new Error('Response does not match OpenAPI schema: ' + JSON.stringify(errorsCollected, null, 2));
  }

  it('returns a mocked users list', async () => {
    const paths = ['/api/v1/users', '/users'];
    const { res, body } = await fetchWithFallback(paths);
    expect(res.status).toBeGreaterThanOrEqual(200);
    expect(res.status).toBeLessThan(600);
    expect(body).not.toBeNull();

    // Validate against OpenAPI for any of the candidate paths
    let validated = false;
    let lastError: Error | null = null;
    for (const p of paths) {
      try {
        validateAgainstSpec(p, 'get', res.status, body);
        validated = true;
        break;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
      }
    }
    if (!validated) throw lastError || new Error('Response did not validate against OpenAPI');

    // Additional structural assertions
    const data = (body as unknown as Record<string, unknown>)['data'];
    if (data === null) {
      // allowed by schema (nullable)
      expect(data).toBeNull();
    } else if (Array.isArray(data)) {
      for (const item of data) {
        expect(item).toHaveProperty('id');
        const idVal = (item as Record<string, unknown>)['id'];
        expect(typeof idVal).toBe('string');
      }
    } else {
      console.error('[contract] unexpected users response body:', JSON.stringify(body, null, 2));
      expect(Array.isArray(data)).toBe(true);
    }
  });

  it('returns a mocked me response', async () => {
    const paths = ['/api/v1/me', '/me'];
    const { res, body } = await fetchWithFallback(paths);
    expect(res.status).toBeGreaterThanOrEqual(200);
    expect(res.status).toBeLessThan(600);
    expect(body).not.toBeNull();

    let validated = false;
    let lastError: Error | null = null;
    for (const p of paths) {
      try {
        validateAgainstSpec(p, 'get', res.status, body);
        validated = true;
        break;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
      }
    }
    if (!validated) throw lastError || new Error('Response did not validate against OpenAPI');

    const data = (body as unknown as Record<string, unknown>)['data'];
    if (data !== null && typeof data === 'object') {
      const idVal = (data as Record<string, unknown>)['id'];
      expect(typeof idVal).toBe('string');
    }
  });
});
