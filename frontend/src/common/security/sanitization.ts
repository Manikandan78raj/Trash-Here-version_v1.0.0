import DOMPurify from 'dompurify';

/**
 * Sanitize HTML string using DOMPurify to strip script tags, event handlers (onerror, onload),
 * and dangerous URIs (javascript:, vbscript:) while preserving formatting tags.
 */
export function sanitizeHtml(input: string | null | undefined): string {
  if (!input || typeof input !== 'string') return '';
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [
      'b',
      'i',
      'em',
      'strong',
      'a',
      'p',
      'br',
      'ul',
      'ol',
      'li',
      'span',
      'div',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'blockquote',
      'code',
      'pre',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style', 'title', 'alt', 'src'],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'style'],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Strip all HTML tags and return safe plain text.
 */
export function sanitizeText(input: string | null | undefined): string {
  if (!input || typeof input !== 'string') return typeof input === 'number' ? String(input) : '';
  const cleaned = DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
  // Unescape common HTML entities if needed or return clean text
  return cleaned.trim();
}

/**
 * Recursively sanitize all string values within an object or array (useful for AI metadata, CMS, notes).
 */
export function sanitizeObject<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') {
    return sanitizeHtml(obj) as unknown as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item)) as unknown as T;
  }

  if (typeof obj === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      cleaned[key] = sanitizeObject(value);
    }
    return cleaned as unknown as T;
  }

  return obj;
}
