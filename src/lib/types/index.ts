// Application

interface Fetch {
  (input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
  (input: string | URL | globalThis.Request, init?: RequestInit): Promise<Response>;
}

interface Log {
  meta: { id: string; createdAt: string; source: string };
  context?: unknown;
  done?: boolean;
  result?: unknown;
  error?: boolean;
  details?: unknown;
}

// REDCap

interface EAV {
  record: string;
  redcap_repeat_instrument: string;
  redcap_repeat_instance: string | number;
  field_name: string;
  value: string;
}

export type { Log, EAV, Fetch };
