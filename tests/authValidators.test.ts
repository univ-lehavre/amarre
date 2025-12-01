import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ApplicationError } from '$lib/errors';

type ErrorClass = new (...args: unknown[]) => ApplicationError;

let InvalidContentTypeError: ErrorClass;
let InvalidJsonBodyError: ErrorClass;
let NotAnEmailError: ErrorClass;
let NotPartOfAllianceError: ErrorClass;
let SessionError: ErrorClass;
let MagicUrlLoginValidationError: ErrorClass;
let UserIdValidationError: ErrorClass;

const importValidators = () => import('../src/lib/validators/server/auth');

const setupModuleMocks = () => {
  const isEmail = vi.fn();
  const isAlliance = vi.fn();
  const isHexadecimal = vi.fn();

  vi.doMock('$lib/validators', () => ({ isEmail }));

  vi.doMock('$lib/validators/server', () => ({ isAlliance, isHexadecimal }));

  return { isEmail, isAlliance, isHexadecimal };
};

describe('auth validators', () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    const errs = await import('$lib/errors');
    const authErrs = await import('$lib/errors/auth');
    InvalidContentTypeError = errs.InvalidContentTypeError as unknown as ErrorClass;
    InvalidJsonBodyError = errs.InvalidJsonBodyError as unknown as ErrorClass;
    NotAnEmailError = errs.NotAnEmailError as unknown as ErrorClass;
    NotPartOfAllianceError = errs.NotPartOfAllianceError as unknown as ErrorClass;
    SessionError = errs.SessionError as unknown as ErrorClass;
    MagicUrlLoginValidationError = authErrs.MagicUrlLoginValidationError as unknown as ErrorClass;
    UserIdValidationError = authErrs.UserIdValidationError as unknown as ErrorClass;
  });

  describe('validateSignupEmail', () => {
    it('returns sanitized email when all checks pass', async () => {
      const mocks = setupModuleMocks();
      mocks.isEmail.mockReturnValue(true);
      mocks.isAlliance.mockResolvedValue(true);
      const { validateSignupEmail } = await importValidators();

      const result = await validateSignupEmail('user@example.com');

      expect(result).toBe('user@example.com');
      expect(mocks.isEmail).toHaveBeenCalledWith('user@example.com');
      expect(mocks.isAlliance).toHaveBeenCalledWith('user@example.com');
    });

    it('throws when email is missing', async () => {
      setupModuleMocks();
      const { validateSignupEmail } = await importValidators();
      try {
        await validateSignupEmail(undefined);
        throw new Error('Expected NotAnEmailError');
      } catch (err) {
        expect(err).toBeInstanceOf(NotAnEmailError);
      }
    });

    it('throws when email is not a string', async () => {
      setupModuleMocks();
      const { validateSignupEmail } = await importValidators();
      try {
        await validateSignupEmail(42);
        throw new Error('Expected NotAnEmailError');
      } catch (err) {
        expect(err).toBeInstanceOf(NotAnEmailError);
      }
    });

    it('throws when email format is invalid', async () => {
      const mocks = setupModuleMocks();
      mocks.isEmail.mockReturnValue(false);
      const { validateSignupEmail } = await importValidators();
      try {
        await validateSignupEmail('invalid-email');
        throw new Error('Expected NotAnEmailError');
      } catch (err) {
        expect(err).toBeInstanceOf(NotAnEmailError);
      }
    });

    it('throws when email is not part of alliance', async () => {
      const mocks = setupModuleMocks();
      mocks.isEmail.mockReturnValue(true);
      mocks.isAlliance.mockResolvedValue(false);
      const { validateSignupEmail } = await importValidators();
      await expect(validateSignupEmail('user@example.com')).rejects.toBeInstanceOf(NotPartOfAllianceError);
    });
  });

  describe('validateMagicUrlLogin', () => {
    it('returns validated payload when inputs are valid hexadecimal strings', async () => {
      const mocks = setupModuleMocks();
      mocks.isHexadecimal.mockReturnValue(true);
      const { validateMagicUrlLogin } = await importValidators();

      const result = validateMagicUrlLogin('abc123', 'def456');

      expect(result).toEqual({ userId: 'abc123', secret: 'def456' });
      expect(mocks.isHexadecimal).toHaveBeenCalledTimes(2);
    });

    it('throws when userId or secret is missing', async () => {
      setupModuleMocks();
      const { validateMagicUrlLogin } = await importValidators();
      try {
        validateMagicUrlLogin(undefined, 'secret');
        throw new Error('Expected MagicUrlLoginValidationError');
      } catch (err) {
        expect(err).toBeInstanceOf(MagicUrlLoginValidationError);
      }
      try {
        validateMagicUrlLogin('user', undefined);
        throw new Error('Expected MagicUrlLoginValidationError');
      } catch (err) {
        expect(err).toBeInstanceOf(MagicUrlLoginValidationError);
      }
    });

    it('throws when userId or secret is not a string', async () => {
      setupModuleMocks();
      const { validateMagicUrlLogin } = await importValidators();
      try {
        validateMagicUrlLogin('user', 123 as unknown as string);
        throw new Error('Expected MagicUrlLoginValidationError');
      } catch (err) {
        expect(err).toBeInstanceOf(MagicUrlLoginValidationError);
      }
    });

    it('throws when identifiers are not hexadecimal', async () => {
      const mocks = setupModuleMocks();
      mocks.isHexadecimal.mockReturnValue(false);
      const { validateMagicUrlLogin } = await importValidators();
      try {
        validateMagicUrlLogin('xyz', 'abc');
        throw new Error('Expected MagicUrlLoginValidationError');
      } catch (err) {
        expect(err).toBeInstanceOf(MagicUrlLoginValidationError);
      }
    });
  });

  describe('validateUserId', () => {
    it('returns userId when it is a hexadecimal string', async () => {
      const mocks = setupModuleMocks();
      mocks.isHexadecimal.mockReturnValue(true);
      const { validateUserId } = await importValidators();
      expect(validateUserId('abc123')).toBe('abc123');
    });

    it('throws SessionError when userId is missing', async () => {
      setupModuleMocks();
      const { validateUserId } = await importValidators();
      try {
        validateUserId(undefined);
        throw new Error('Expected SessionError');
      } catch (err) {
        expect(err).toBeInstanceOf(SessionError);
      }
    });

    it('throws UserIdValidationError when userId is not a string', async () => {
      setupModuleMocks();
      const { validateUserId } = await importValidators();
      try {
        validateUserId(42);
        throw new Error('Expected UserIdValidationError');
      } catch (err) {
        expect(err).toBeInstanceOf(UserIdValidationError);
      }
    });

    it('throws UserIdValidationError when userId is not hexadecimal', async () => {
      const mocks = setupModuleMocks();
      mocks.isHexadecimal.mockReturnValue(false);
      const { validateUserId } = await importValidators();
      try {
        validateUserId('xyz');
        throw new Error('Expected UserIdValidationError');
      } catch (err) {
        expect(err).toBeInstanceOf(UserIdValidationError);
      }
    });
  });

  describe('ensureJsonContentType', () => {
    it('allows requests with application/json content type', async () => {
      setupModuleMocks();
      const { ensureJsonContentType } = await importValidators();
      const request = {
        headers: new Headers({ 'Content-Type': 'application/json; charset=utf-8' }),
      } as unknown as Request;
      expect(() => ensureJsonContentType(request)).not.toThrow();
    });

    it('throws when Content-Type is missing or not JSON', async () => {
      setupModuleMocks();
      const { ensureJsonContentType } = await importValidators();
      const request = { headers: new Headers() } as unknown as Request;
      try {
        ensureJsonContentType(request);
        throw new Error('Expected InvalidContentTypeError');
      } catch (err) {
        expect(err).toBeInstanceOf(InvalidContentTypeError);
      }
    });
  });

  describe('parseJsonBody', () => {
    it('returns parsed body when payload is a JSON object', async () => {
      setupModuleMocks();
      const { parseJsonBody } = await importValidators();
      const request = { json: vi.fn(async () => ({ userId: '123' })) } as unknown as Request;
      await expect(parseJsonBody(request)).resolves.toEqual({ userId: '123' });
    });

    it('throws when payload is not a JSON object', async () => {
      setupModuleMocks();
      const { parseJsonBody } = await importValidators();
      const request = { json: vi.fn(async () => ['not-object']) } as unknown as Request;
      try {
        await parseJsonBody(request);
        throw new Error('Expected InvalidJsonBodyError');
      } catch (err) {
        expect(err).toBeInstanceOf(InvalidJsonBodyError);
      }
    });

    it('throws InvalidJsonBodyError when parsing fails', async () => {
      setupModuleMocks();
      const { parseJsonBody } = await importValidators();
      const request = {
        json: vi.fn(async () => {
          throw new Error('invalid json');
        }),
      } as unknown as Request;
      try {
        await parseJsonBody(request);
        throw new Error('Expected InvalidJsonBodyError');
      } catch (err) {
        expect(err).toBeInstanceOf(InvalidJsonBodyError);
      }
    });
  });
});
