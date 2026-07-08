import { describe, it, expect } from 'vitest';
import { verifyCspCompliance } from '../csp-compatibility';

describe('Content Security Policy (CSP) Compatibility Checker (TDD)', () => {
  it('should detect and flag unsafe-eval usage (eval, new Function, setTimeout with string)', () => {
    const unsafeCode1 = 'const x = eval("2 + 2");';
    const result1 = verifyCspCompliance(unsafeCode1);
    expect(result1.isCompliant).toBe(false);
    expect(result1.violations).toContain('unsafe-eval: eval() call detected');

    const unsafeCode2 = 'const fn = new Function("a", "b", "return a + b");';
    const result2 = verifyCspCompliance(unsafeCode2);
    expect(result2.isCompliant).toBe(false);
    expect(result2.violations).toContain('unsafe-eval: new Function() constructor detected');
  });

  it('should detect and flag inline script execution or javascript: URI handlers', () => {
    const inlineHtml = '<div onclick="alert(1)">Click</div>';
    const resultHtml = verifyCspCompliance(inlineHtml);
    expect(resultHtml.isCompliant).toBe(false);
    expect(resultHtml.violations).toContain('inline-script: inline event handler detected');

    const inlineScriptTag = '<script>window.MY_CONFIG = { id: 1 };</script>';
    const resultTag = verifyCspCompliance(inlineScriptTag);
    expect(resultTag.isCompliant).toBe(false);
    expect(resultTag.violations).toContain('inline-script: inline <script> block detected');
  });

  it('should pass clean, CSP-compatible code and DOM structures without violations', () => {
    const cleanCode = `
      import React from 'react';
      export const SafeComponent = () => {
        const handleClick = () => console.log('clicked');
        return <button onClick={handleClick}>Safe Button</button>;
      };
    `;
    const result = verifyCspCompliance(cleanCode);
    expect(result.isCompliant).toBe(true);
    expect(result.violations.length).toBe(0);
  });
});
