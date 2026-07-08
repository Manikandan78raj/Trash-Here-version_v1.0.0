import { describe, it, expect } from 'vitest';
import { validateFileUpload, createSafePreviewUrl } from '../upload-validator';

describe('Secure File Upload Validator & Magic Byte Checker (TDD)', () => {
  const createMockFile = (name: string, type: string, sizeBytes: number, magicBytes: number[]) => {
    const buffer = new Uint8Array(sizeBytes);
    for (let i = 0; i < magicBytes.length && i < sizeBytes; i++) {
      buffer[i] = magicBytes[i];
    }
    return new File([buffer], name, { type });
  };

  describe('validateFileUpload', () => {
    it('should accept valid JPEG image with correct magic bytes (FF D8 FF)', async () => {
      // JPEG magic bytes: 0xFF, 0xD8, 0xFF
      const jpegFile = createMockFile(
        'waste-sample.jpg',
        'image/jpeg',
        1024 * 500,
        [0xff, 0xd8, 0xff, 0xe0],
      );
      const result = await validateFileUpload(jpegFile);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept valid PNG image with correct magic bytes (89 50 4E 47)', async () => {
      // PNG magic bytes: 0x89, 0x50, 0x4E, 0x47
      const pngFile = createMockFile(
        'recycler-receipt.png',
        'image/png',
        1024 * 1024,
        [0x89, 0x50, 0x4e, 0x47],
      );
      const result = await validateFileUpload(pngFile);
      expect(result.isValid).toBe(true);
    });

    it('should accept valid WEBP image with correct magic bytes (RIFF ... WEBP)', async () => {
      // WEBP starts with RIFF (0x52, 0x49, 0x46, 0x46)
      const webpFile = createMockFile(
        'ai-scan.webp',
        'image/webp',
        1024 * 300,
        [0x52, 0x49, 0x46, 0x46],
      );
      const result = await validateFileUpload(webpFile);
      expect(result.isValid).toBe(true);
    });

    it('should reject file when size exceeds maximum limit (e.g., 10MB)', async () => {
      // 15MB JPEG file
      const hugeFile = createMockFile(
        'huge-photo.jpg',
        'image/jpeg',
        15 * 1024 * 1024,
        [0xff, 0xd8, 0xff],
      );
      const result = await validateFileUpload(hugeFile, { maxSizeBytes: 10 * 1024 * 1024 });
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('exceeds maximum allowed size');
    });

    it('should reject file with unapproved MIME type or executable extension', async () => {
      const exeFile = createMockFile('malware.exe', 'application/x-msdownload', 2048, [0x4d, 0x5a]);
      const result = await validateFileUpload(exeFile);
      expect(result.isValid).toBe(false);
      expect(result.error?.toLowerCase()).toContain('file type not allowed');

      const htmlScript = createMockFile(
        'exploit.html',
        'text/html',
        1024,
        [0x3c, 0x68, 0x74, 0x6d],
      );
      const resultHtml = await validateFileUpload(htmlScript);
      expect(resultHtml.isValid).toBe(false);
      expect(resultHtml.error?.toLowerCase()).toContain('file type not allowed');
    });

    it('should detect and block MIME/extension spoofing (e.g., EXE file renamed to .jpg)', async () => {
      // File has .jpg name and image/jpeg type, but magic bytes are MZ (Windows DOS/EXE executable 0x4D 0x5A)
      const spoofedExe = createMockFile(
        'disguised-malware.jpg',
        'image/jpeg',
        1024 * 100,
        [0x4d, 0x5a, 0x90, 0x00],
      );
      const result = await validateFileUpload(spoofedExe);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('file signature mismatch');
    });

    it('should detect and block polyglot script payloads disguised as image headers', async () => {
      // PHP script disguised as image: <?php or <script
      const spoofedPhp = createMockFile('shell.jpg', 'image/jpeg', 1024, [0x3c, 0x3f, 0x70, 0x68]); // <?ph
      const result = await validateFileUpload(spoofedPhp);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('file signature mismatch');
    });
  });

  describe('createSafePreviewUrl', () => {
    it('should generate Object URL only when validation passes', async () => {
      const validJpeg = createMockFile('preview.jpg', 'image/jpeg', 1024 * 100, [0xff, 0xd8, 0xff]);
      const preview = await createSafePreviewUrl(validJpeg);
      expect(preview.url).toBeDefined();
      expect(preview.url).toContain('blob:');
      expect(preview.error).toBeUndefined();
    });

    it('should return null URL and error message when file is spoofed or malicious', async () => {
      const malicious = createMockFile('hack.jpg', 'image/jpeg', 1024, [0x4d, 0x5a, 0x00]);
      const preview = await createSafePreviewUrl(malicious);
      expect(preview.url).toBeNull();
      expect(preview.error).toContain('file signature mismatch');
    });
  });
});
