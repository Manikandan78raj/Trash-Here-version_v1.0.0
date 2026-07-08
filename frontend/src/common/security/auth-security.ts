/**
 * Strip sensitive token fields (refreshToken, refreshTokenHash, passwordHash) before saving
 * user profile or authentication payloads to localStorage or state.
 */
export function stripSensitiveTokenData<T>(data: T): T {
  if (!data || typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map((item) => stripSensitiveTokenData(item)) as unknown as T;
  }

  const cleaned: Record<string, any> = {};
  const sensitiveKeys = [
    'refreshtoken',
    'refreshtokenhash',
    'passwordhash',
    'secret',
    'clientsecret',
    'privatekey',
  ];

  for (const [key, value] of Object.entries(data)) {
    if (sensitiveKeys.includes(key.toLowerCase())) {
      continue; // Skip sensitive key
    }
    cleaned[key] =
      typeof value === 'object' && value !== null ? stripSensitiveTokenData(value) : value;
  }

  return cleaned as unknown as T;
}

/**
 * Extract XSRF-TOKEN or csrf_token from cookie string (or document.cookie) and return
 * standard CSRF mitigation headers for state-changing API requests.
 */
export function getCsrfHeaders(cookieString?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'X-Requested-With': 'XMLHttpRequest',
  };

  const cookies = cookieString ?? (typeof document !== 'undefined' ? document.cookie : '');
  if (!cookies) return headers;

  const match = cookies.match(/(?:^|;\s*)(?:XSRF-TOKEN|csrf_token)=([^;]+)/);
  if (match && match[1]) {
    headers['X-XSRF-TOKEN'] = decodeURIComponent(match[1]);
  }

  return headers;
}
