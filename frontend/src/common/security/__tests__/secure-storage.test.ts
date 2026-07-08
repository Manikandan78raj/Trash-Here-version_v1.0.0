import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { auditAndCleanSecureStorage, sanitizeUrlParameters } from '../secure-storage';

describe('Secure Storage & URL Parameter Audit (TDD)', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('auditAndCleanSecureStorage', () => {
    it('should purge any unapproved or sensitive keys (refreshToken, password, secrets) from localStorage and sessionStorage', () => {
      localStorage.setItem('trash_here_token', 'valid_access_token_15m');
      localStorage.setItem('refreshToken', 'secret_refresh_token_that_should_not_be_here');
      localStorage.setItem('user_password', 'plaintext_password_leak');
      sessionStorage.setItem('jwt_secret', 'leaked_key');
      sessionStorage.setItem('trash_here_user', '{"id":"1"}');

      const purgedCount = auditAndCleanSecureStorage();

      expect(localStorage.getItem('trash_here_token')).toBe('valid_access_token_15m');
      expect(localStorage.getItem('refreshToken')).toBeNull();
      expect(localStorage.getItem('user_password')).toBeNull();
      expect(sessionStorage.getItem('jwt_secret')).toBeNull();
      expect(sessionStorage.getItem('trash_here_user')).toBe('{"id":"1"}');
      expect(purgedCount).toBe(3);
    });
  });

  describe('sanitizeUrlParameters', () => {
    it('should strip sensitive token and code parameters from URL query strings without page reload', () => {
      const dirtyUrl =
        'https://app.trashhere.com/dashboard?token=access_jwt_123&refreshToken=refresh_cookie_value&source=email';
      const cleanUrl = sanitizeUrlParameters(dirtyUrl);

      expect(cleanUrl).not.toContain('token=');
      expect(cleanUrl).not.toContain('refreshToken=');
      expect(cleanUrl).toContain('source=email');
      expect(cleanUrl).toBe('https://app.trashhere.com/dashboard?source=email');
    });
  });
});
