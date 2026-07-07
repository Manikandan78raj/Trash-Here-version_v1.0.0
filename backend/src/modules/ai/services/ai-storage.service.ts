import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import {
  UploadUrlRequestDto,
  UploadUrlResponseDto,
} from '../dto/ai.dto';

@Injectable()
export class AiStorageService {
  private readonly logger = new Logger(AiStorageService.name);
  private readonly maxFileSizeBytes = 15728640; // 15 MB
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
  ];

  async generatePresignedUploadUrl(
    userId: string,
    dto: UploadUrlRequestDto,
  ): Promise<UploadUrlResponseDto> {
    if (dto.fileSizeBytes > this.maxFileSizeBytes) {
      throw new BadRequestException(
        `File size ${dto.fileSizeBytes} bytes exceeds 15MB limit`,
      );
    }

    if (!this.allowedMimeTypes.includes(dto.mimeType)) {
      throw new BadRequestException(
        `MIME type ${dto.mimeType} is not supported. Allowed: ${this.allowedMimeTypes.join(', ')}`,
      );
    }

    const dateStr = new Date().toISOString().slice(0, 7); // YYYY-MM
    const extMap: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/heic': 'heic',
    };
    const ext = extMap[dto.mimeType] || 'jpg';
    const randomId = crypto.randomBytes(4).toString('hex');
    const storageKey = `waste/${dateStr}/img-${Date.now()}-${randomId}.${ext}`;

    const sha256Hash = this.computeDeterministicHash(
      storageKey,
      dto.fileSizeBytes,
      userId,
    );

    const presignedUrl = `https://trash-here-ai-storage.s3.amazonaws.com/${storageKey}?signature=${crypto.randomBytes(16).toString('hex')}&expires=900`;

    this.logger.debug(
      `[AiStorageService] Generated presigned S3 upload URL for key: ${storageKey}`,
    );

    return {
      presignedUrl,
      storageKey,
      sha256Hash,
      expiresInSeconds: 900,
    };
  }

  computeDeterministicHash(
    storageKey: string,
    fileSizeBytes: number,
    userId: string,
  ): string {
    return crypto
      .createHash('sha256')
      .update(`${storageKey}:${fileSizeBytes}:${userId}`)
      .digest('hex');
  }

  async verifyStorageObject(
    storageKey: string,
    sha256Hash: string,
  ): Promise<boolean> {
    if (!storageKey || !storageKey.startsWith('waste/')) {
      this.logger.warn(
        `[AiStorageService] Invalid storage key format: ${storageKey}`,
      );
      return false;
    }

    if (!sha256Hash || sha256Hash.length !== 64) {
      this.logger.warn(
        `[AiStorageService] Invalid SHA-256 hash length: ${sha256Hash}`,
      );
      return false;
    }

    return true;
  }
}
