const ALLOWED_STORAGE_KEYS = [
  'trash_here_token',
  'trash_here_user',
  'cookie_analytics',
  'cookie_marketing',
  'theme',
  'trash_here_theme',
];

const SENSITIVE_PARAM_NAMES = [
  'token',
  'refreshtoken',
  'refresh_token',
  'access_token',
  'code',
  'secret',
  'password',
  'apikey',
  'api_key',
  'jwt',
];

/**
 * Scan localStorage and sessionStorage, purging any unauthorized or sensitive keys
 * (such as leaked refresh tokens, passwords, or API keys).
 * Returns the number of purged storage keys.
 */
export function auditAndCleanSecureStorage(): number {
  let purgedCount = 0;

  const checkAndPurge = (storage: Storage) => {
    const keysToRemove: string[] = [];
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (!key) continue;

      if (!ALLOWED_STORAGE_KEYS.includes(key)) {
        // If key sounds sensitive or unapproved, purge it
        if (/refresh|password|secret|key|jwt/i.test(key)) {
          keysToRemove.push(key);
        }
      }
    }

    for (const key of keysToRemove) {
      storage.removeItem(key);
      purgedCount++;
    }
  };

  if (typeof localStorage !== 'undefined') checkAndPurge(localStorage);
  if (typeof sessionStorage !== 'undefined') checkAndPurge(sessionStorage);

  return purgedCount;
}

/**
 * Strip sensitive token or auth code parameters from a URL query string.
 * If no url string is provided, scrubs window.location without reloading the page.
 */
export function sanitizeUrlParameters(url?: string): string {
  if (url) {
    try {
      const parsed = new URL(url);
      for (const param of Array.from(parsed.searchParams.keys())) {
        if (SENSITIVE_PARAM_NAMES.includes(param.toLowerCase())) {
          parsed.searchParams.delete(param);
        }
      }
      return parsed.toString();
    } catch {
      return url;
    }
  }

  if (typeof window !== 'undefined' && window.history && window.location) {
    const parsed = new URL(window.location.href);
    let modified = false;
    for (const param of Array.from(parsed.searchParams.keys())) {
      if (SENSITIVE_PARAM_NAMES.includes(param.toLowerCase())) {
        parsed.searchParams.delete(param);
        modified = true;
      }
    }
    if (modified) {
      window.history.replaceState({}, document.title, parsed.toString());
    }
    return parsed.toString();
  }

  return '';
}
