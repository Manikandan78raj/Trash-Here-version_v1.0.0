export interface UploadValidationOptions {
  maxSizeBytes?: number;
  allowedMimeTypes?: string[];
}

export interface UploadValidationResult {
  isValid: boolean;
  error?: string;
}

export interface SafePreviewResult {
  url: string | null;
  error?: string;
}

const DEFAULT_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'application/pdf',
];

const DEFAULT_MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * Validate file upload by checking size, allowed MIME types, and client-side magic bytes (file signature).
 * Protects against MIME spoofing and executable upload attacks.
 */
export async function validateFileUpload(
  file: File,
  options: UploadValidationOptions = {},
): Promise<UploadValidationResult> {
  const maxSizeBytes = options.maxSizeBytes ?? DEFAULT_MAX_SIZE_BYTES;
  const allowedMimeTypes = options.allowedMimeTypes ?? DEFAULT_ALLOWED_MIME_TYPES;

  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds maximum allowed size of ${(maxSizeBytes / (1024 * 1024)).toFixed(2)} MB.`,
    };
  }

  if (!allowedMimeTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type not allowed: ${file.type || 'unknown'}. Allowed types: ${allowedMimeTypes.join(', ')}`,
    };
  }

  // Inspect magic bytes
  try {
    const buffer = await file.slice(0, 16).arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // Check for dangerous executable headers or scripts
    // DOS/Windows EXE (MZ = 0x4D 0x5A)
    if (bytes[0] === 0x4d && bytes[1] === 0x5a) {
      return {
        isValid: false,
        error: 'Security alert: file signature mismatch (executable file detected).',
      };
    }
    // ELF executable (0x7F 'E' 'L' 'F')
    if (bytes[0] === 0x7f && bytes[1] === 0x45 && bytes[2] === 0x4c && bytes[3] === 0x46) {
      return {
        isValid: false,
        error: 'Security alert: file signature mismatch (ELF executable detected).',
      };
    }
    // PHP or HTML or script tag (<script = 0x3C 0x73 0x63, <?ph = 0x3C 0x3F 0x70 0x68, <htm = 0x3C 0x68 0x74 0x6D)
    if (bytes[0] === 0x3c) {
      return {
        isValid: false,
        error:
          'Security alert: file signature mismatch (script or HTML tags detected in binary header).',
      };
    }

    // Verify magic bytes match declared MIME type
    if (file.type === 'image/jpeg') {
      if (!(bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)) {
        return {
          isValid: false,
          error: 'Security alert: file signature mismatch (not a valid JPEG).',
        };
      }
    } else if (file.type === 'image/png') {
      if (!(bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47)) {
        return {
          isValid: false,
          error: 'Security alert: file signature mismatch (not a valid PNG).',
        };
      }
    } else if (file.type === 'image/webp') {
      // RIFF header (0x52 0x49 0x46 0x46)
      if (!(bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46)) {
        return {
          isValid: false,
          error: 'Security alert: file signature mismatch (not a valid WEBP).',
        };
      }
    } else if (file.type === 'application/pdf') {
      // %PDF (0x25 0x50 0x44 0x46)
      if (!(bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46)) {
        return {
          isValid: false,
          error: 'Security alert: file signature mismatch (not a valid PDF).',
        };
      }
    }

    return { isValid: true };
  } catch (err: any) {
    return {
      isValid: false,
      error: `Failed to read file signature for validation: ${err?.message || 'unknown error'}`,
    };
  }
}

/**
 * Safely generate an Object URL for image preview after rigorous client-side validation.
 */
export async function createSafePreviewUrl(
  file: File,
  options?: UploadValidationOptions,
): Promise<SafePreviewResult> {
  const validation = await validateFileUpload(file, options);
  if (!validation.isValid) {
    return { url: null, error: validation.error };
  }

  try {
    const url = URL.createObjectURL(file);
    return { url };
  } catch (err: any) {
    return { url: null, error: 'Failed to create preview URL.' };
  }
}
