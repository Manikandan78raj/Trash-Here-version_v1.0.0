export interface CspComplianceResult {
  isCompliant: boolean;
  violations: string[];
}

/**
 * Verify Content Security Policy (CSP) compliance of code snippets or DOM strings.
 * Detects unsafe-eval (eval, new Function, string timers) and inline scripts/handlers.
 */
export function verifyCspCompliance(codeOrHtml: string): CspComplianceResult {
  const violations: string[] = [];
  if (!codeOrHtml || typeof codeOrHtml !== 'string') {
    return { isCompliant: true, violations };
  }

  // Check for unsafe-eval
  if (/\beval\s*\(/.test(codeOrHtml)) {
    violations.push('unsafe-eval: eval() call detected');
  }
  if (/new\s+Function\s*\(/.test(codeOrHtml)) {
    violations.push('unsafe-eval: new Function() constructor detected');
  }
  if (/(?:setTimeout|setInterval)\s*\(\s*['"][^'"]+['"]/.test(codeOrHtml)) {
    violations.push('unsafe-eval: setTimeout/setInterval with string argument detected');
  }

  // Check for inline scripts or event handlers (assigned to strings in HTML quotes)
  if (/\b(?:onclick|onload|onerror|onmouseover|onfocus|onblur)\s*=\s*['"]/i.test(codeOrHtml)) {
    violations.push('inline-script: inline event handler detected');
  }
  if (/<script\b[^>]*>[\s\S]*?<\/script>/i.test(codeOrHtml)) {
    // Check if script tag has src attribute; if not or if it has inline content, flag it
    const scriptMatches = codeOrHtml.match(/<script\b[^>]*>([\s\S]*?)<\/script>/gi);
    if (scriptMatches) {
      for (const match of scriptMatches) {
        const content = match.replace(/<script\b[^>]*>|<\/script>/gi, '').trim();
        if (content.length > 0) {
          violations.push('inline-script: inline <script> block detected');
          break;
        }
      }
    }
  }
  if (/javascript:/i.test(codeOrHtml)) {
    violations.push('inline-script: javascript: URI handler detected');
  }

  return {
    isCompliant: violations.length === 0,
    violations,
  };
}
