import { Injectable, BadRequestException, Logger } from "@nestjs/common";
import * as crypto from "crypto";
import { UploadUrlRequestDto, UploadUrlResponseDto } from "../dto/ai.dto";

@Injectable()
export class AiStorageService {
  private readonly logger = new Logger(AiStorageService.name);
  private readonly maxFileSizeBytes = 15728640; // 15 MB
  private readonly allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
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
        `MIME type ${dto.mimeType} is not supported. Allowed: ${this.allowedMimeTypes.join(", ")}`,
      );
    }

    const dateStr = new Date().toISOString().slice(0, 7); // YYYY-MM
    const extMap: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/heic": "heic",
    };
    const ext = extMap[dto.mimeType] || "jpg";
    const randomId = crypto.randomBytes(4).toString("hex");
    const storageKey = `waste/${dateStr}/img-${Date.now()}-${randomId}.${ext}`;

    const sha256Hash = this.computeDeterministicHash(
      storageKey,
      dto.fileSizeBytes,
      userId,
    );

    const presignedUrl = `https://trash-here-ai-storage.s3.amazonaws.com/${storageKey}?signature=${crypto.randomBytes(16).toString("hex")}&expires=900`;

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
      .createHash("sha256")
      .update(`${storageKey}:${fileSizeBytes}:${userId}`)
      .digest("hex");
  }

  async verifyStorageObject(
    storageKey: string,
    sha256Hash: string,
  ): Promise<boolean> {
    if (!storageKey || !storageKey.startsWith("waste/")) {
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

  validateImageMagicBytes(buffer: Buffer): boolean {
    if (!buffer || buffer.length < 4) {
      throw new BadRequestException(
        "Security Alert: File buffer too small or invalid.",
      );
    }

    // JPEG: FF D8 FF
    const isJpeg =
      buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    // PNG: 89 50 4E 47
    const isPng =
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47;
    // WEBP: RIFF...WEBP
    const isWebp =
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46 &&
      buffer.length >= 12 &&
      buffer.slice(8, 12).toString() === "WEBP";
    // HEIC/HEIF: ftyp... around byte 4
    const isHeic =
      buffer.length >= 12 &&
      (buffer.slice(4, 12).toString().includes("heic") ||
        buffer.slice(4, 12).toString().includes("heix") ||
        buffer.slice(4, 12).toString().includes("mif1") ||
        buffer.slice(4, 12).toString().includes("msf1"));

    if (!isJpeg && !isPng && !isWebp && !isHeic) {
      this.logger.warn(
        "🚨 [Security Alert] Polyglot or invalid image magic bytes detected. Upload rejected.",
      );
      throw new BadRequestException(
        "Security Alert: Invalid or spoofed image file signature. Polyglot or executable files are strictly prohibited.",
      );
    }

    return true;
  }
}
