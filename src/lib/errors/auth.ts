import { ApplicationError } from '$lib/errors';

export class LoginError extends ApplicationError {
  constructor(message = 'Login error', opts?: { cause?: string; details?: unknown }) {
    super('unauthorized', 401, message, opts);
  }
}

export class MagicUrlLoginValidationError extends ApplicationError {
  constructor(message = 'Invalid magic link parameters', opts?: { cause?: string; details?: unknown }) {
    super('validation_error', 400, message, opts);
  }
}

export class UserIdValidationError extends ApplicationError {
  constructor(message = 'Invalid user id', opts?: { cause?: string; details?: unknown }) {
    super('validation_error', 400, message, opts);
  }
}

export class InvalidCredentialsError extends ApplicationError {
  constructor(message = 'Invalid credentials', opts?: { cause?: string; details?: unknown }) {
    super('unauthorized', 401, message, opts);
  }
}
