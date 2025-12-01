import type { Log } from '$lib/types';
import { v7 } from 'uuid';

export {
  ApplicationError,
  SessionError,
  ParametersMissingError,
  InvalidJsonBodyError,
  InvalidContentTypeError,
  NotAnEmailError,
  NotPartOfAllianceError,
  AppwriteMagicURLError,
  taskDone,
  taskError,
};

class ApplicationError extends Error {
  readonly code: string;
  readonly httpStatus: number;
  readonly cause?: string;
  readonly details?: unknown;

  constructor(code: string, httpStatus: number, message: string, opts?: { cause?: string; details?: unknown }) {
    super(message);
    this.code = code;
    this.httpStatus = httpStatus;
    this.cause = opts?.cause;
    this.details = opts?.details;
    this.name = this.constructor.name;
  }
}

class SessionError extends ApplicationError {
  constructor(message = 'Session error', opts?: { cause?: string; details?: unknown }) {
    super('session_error', 401, message, opts);
  }
}

class ParametersMissingError extends ApplicationError {
  constructor(message = 'Missing parameters', opts?: { cause?: string; details?: unknown }) {
    super('parameters_missing', 400, message, opts);
  }
}

class InvalidJsonBodyError extends ApplicationError {
  constructor(message = 'Invalid JSON body', opts?: { cause?: string; details?: unknown }) {
    super('invalid_json', 400, message, opts);
  }
}

class InvalidContentTypeError extends ApplicationError {
  constructor(message = 'Content-Type must be application/json', opts?: { cause?: string; details?: unknown }) {
    super('invalid_content_type', 400, message, opts);
  }
}

class NotAnEmailError extends ApplicationError {
  constructor(message = 'Registration not possible', opts?: { cause?: string; details?: unknown }) {
    super('invalid_email', 400, message, opts);
  }
}

class NotPartOfAllianceError extends ApplicationError {
  constructor(message = 'Registration not possible', opts?: { cause?: string; details?: unknown }) {
    super('not_in_alliance', 400, message, opts);
  }
}

class AppwriteMagicURLError extends ApplicationError {
  constructor(message = 'Appwrite magic URL error', opts?: { cause?: string; details?: unknown }) {
    super('internal_error', 500, message, opts);
  }
}

interface Done {
  source: string;
  result?: unknown;
  context?: unknown;
}

interface Fail {
  source: string;
  error?: unknown;
  context?: unknown;
}

const taskMeta = (source: string): Log => {
  return { meta: { id: v7(), createdAt: new Date().toISOString(), source } };
};

const taskDone = (pars: Done): Log => {
  const signal = taskMeta(pars.source);
  signal.done = true;
  if (pars.result) signal.result = pars.result;
  const context = pars.context;
  console.log(JSON.stringify({ ...signal, context }, null, 2));
  return signal;
};

type Details =
  | { type: string; message: string | undefined; cause: string | undefined }
  | { message: string | undefined; type?: undefined; cause?: undefined };

const buildDetails = (error: unknown): Details => {
  const details =
    error instanceof ApplicationError
      ? {
          type: error.code,
          message: typeof error.message === 'string' ? error.message : undefined,
          cause: typeof error.cause === 'string' ? error.cause : undefined,
        }
      : error instanceof Error
        ? { message: typeof error.message === 'string' ? error.message : undefined }
        : { message: 'Unknown error' };
  return details;
};

const buildContext = (error: unknown, context: unknown) => {
  const result =
    error && context ? { ...context, error: error } : error ? { error: error } : context ? { ...context } : undefined;
  return result;
};

const taskError = (pars: Fail): Log => {
  const signal = taskMeta(pars.source);
  signal.error = true;
  signal.details = buildDetails(pars.error);
  const context = buildContext(pars.error, pars.context);
  console.error(JSON.stringify({ ...signal, context }, null, 2));
  return signal;
};
