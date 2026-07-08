import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { apiClient, TOKEN_KEY, USER_KEY } from '@/common/api/client';
import { stripSensitiveTokenData, getCsrfHeaders } from '../auth-security';

describe('Frontend Auth Security, Cookie Rotation & CSRF Hardening (TDD)', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('HttpOnly Cookie Configuration & Token Persistence Rules', () => {
    it('should configure apiClient with withCredentials=true by default for HttpOnly cookie transmission', () => {
      expect(apiClient.defaults.withCredentials).toBe(true);
    });

    it('should strip refreshToken and sensitive secrets before saving user profile or login data to storage', () => {
      const apiResponseUser = {
        id: 'user-123',
        email: 'collector@trashhere.com',
        fullName: 'Alex Eco',
        role: { name: 'COLLECTOR' as const },
        refreshToken: 'super_secret_refresh_token_that_must_not_be_in_storage',
        refreshTokenHash: 'hash_123',
        passwordHash: '$2b$10$secret_bcrypt',
      };

      const safeProfile = stripSensitiveTokenData(apiResponseUser);

      expect(safeProfile.id).toBe('user-123');
      expect(safeProfile.email).toBe('collector@trashhere.com');
      expect(safeProfile.role.name).toBe('COLLECTOR');
      expect((safeProfile as any).refreshToken).toBeUndefined();
      expect((safeProfile as any).refreshTokenHash).toBeUndefined();
      expect((safeProfile as any).passwordHash).toBeUndefined();
    });

    it('should never store refreshToken in localStorage or sessionStorage', () => {
      const loginPayload = {
        accessToken: 'access_token_jwt_15m',
        refreshToken: 'refresh_token_cookie_only',
        user: { id: 'u1', email: 'test@test.com', role: { name: 'USER' } },
      };

      const safeUser = stripSensitiveTokenData(loginPayload.user);
      localStorage.setItem(TOKEN_KEY, loginPayload.accessToken);
      localStorage.setItem(USER_KEY, JSON.stringify(safeUser));

      expect(localStorage.getItem(TOKEN_KEY)).toBe('access_token_jwt_15m');
      expect(localStorage.getItem(USER_KEY)).not.toContain('refresh_token');
      expect(localStorage.getItem('refreshToken')).toBeNull();
      expect(sessionStorage.length).toBe(0);
    });
  });

  describe('CSRF Defense & XMLHttpRequest Headers', () => {
    it('should attach X-Requested-With: XMLHttpRequest to default request headers', () => {
      expect(apiClient.defaults.headers.common['X-Requested-With']).toBe('XMLHttpRequest');
    });

    it('should extract XSRF-TOKEN cookie and generate CSRF header for state-changing requests', () => {
      // Mock document.cookie
      const mockCookie = 'theme=dark; XSRF-TOKEN=csrf_token_value_98765; user=active';
      const headers = getCsrfHeaders(mockCookie);

      expect(headers['X-XSRF-TOKEN']).toBe('csrf_token_value_98765');
      expect(headers['X-Requested-With']).toBe('XMLHttpRequest');
    });
  });
});
