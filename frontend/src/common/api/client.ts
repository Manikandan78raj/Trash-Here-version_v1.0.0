import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { envConfig } from '@/config/env.config';
import { getCsrfHeaders } from '@/common/security/auth-security';

export const TOKEN_KEY = 'trash_here_token';
export const USER_KEY = 'trash_here_user';

export const apiClient = axios.create({
  baseURL: envConfig.apiBaseUrl,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

apiClient.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Request Interceptor: Inject JWT Token & CSRF Mitigation Headers
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (config.headers) {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      const csrfHeaders = getCsrfHeaders();
      for (const [k, v] of Object.entries(csrfHeaders)) {
        config.headers[k] = v;
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// Response Interceptor: Handle 401 Unauthorized & Automatic Refresh Token Rotation
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalConfig = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (
      error.response?.status === 401 &&
      originalConfig &&
      !originalConfig._retry &&
      !originalConfig.url?.includes('/auth/refresh') &&
      !originalConfig.url?.includes('/auth/logout')
    ) {
      originalConfig._retry = true;

      try {
        const refreshResponse = await axios.post(
          '/auth/refresh',
          {},
          {
            baseURL: envConfig.apiBaseUrl,
            withCredentials: true,
            headers: { 'X-Requested-With': 'XMLHttpRequest' },
          },
        );

        const tokenData = refreshResponse.data?.data || refreshResponse.data;
        const newAccessToken = tokenData?.accessToken;
        if (newAccessToken) {
          localStorage.setItem(TOKEN_KEY, newAccessToken);
          if (originalConfig.headers) {
            originalConfig.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('auth:token-refreshed', { detail: newAccessToken }),
            );
          }
          return apiClient(originalConfig);
        }
      } catch (refreshError) {
        // Refresh token failed or expired -> clear session and log out cleanly
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('auth:unauthorized'));
        }
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }

    return Promise.reject(error);
  },
);
