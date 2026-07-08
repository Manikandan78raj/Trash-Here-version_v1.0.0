import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException } from "@nestjs/common";
import { AiStorageService } from "../services/ai-storage.service";
import { UploadUrlRequestDto } from "../dto/ai.dto";

describe("AiStorageService (TDD)", () => {
  let service: AiStorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AiStorageService],
    }).compile();

    service = module.get<AiStorageService>(AiStorageService);
  });

  describe("generatePresignedUploadUrl()", () => {
    it("should successfully generate a presigned URL and storage key for valid image upload", async () => {
      const dto: UploadUrlRequestDto = {
        mimeType: "image/jpeg",
        fileSizeBytes: 524288, // 512 KB
      };

      const result = await service.generatePresignedUploadUrl(
        "user-uuid-123",
        dto,
      );

      expect(result.presignedUrl).toContain(
        "https://trash-here-ai-storage.s3.amazonaws.com/waste/",
      );
      expect(result.storageKey).toMatch(/^waste\/202[0-9]-[0-9]{2}\/img-/);
      expect(result.storageKey).toMatch(/\.jpg$/);
      expect(result.sha256Hash).toHaveLength(64); // 64 char hex hash
      expect(result.expiresInSeconds).toBe(900); // 15 mins
    });

    it("should throw BadRequestException if file size exceeds 15 MB limit", async () => {
      const dto: UploadUrlRequestDto = {
        mimeType: "image/png",
        fileSizeBytes: 20000000, // ~20 MB
      };

      await expect(
        service.generatePresignedUploadUrl("user-uuid-123", dto),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException if MIME type is not supported", async () => {
      const dto: any = {
        mimeType: "application/pdf",
        fileSizeBytes: 524288,
      };

      await expect(
        service.generatePresignedUploadUrl("user-uuid-123", dto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("computeDeterministicHash()", () => {
    it("should return consistent SHA-256 hash for identical storage keys and sizes", () => {
      const hash1 = service.computeDeterministicHash(
        "waste/test.jpg",
        1024,
        "user-1",
      );
      const hash2 = service.computeDeterministicHash(
        "waste/test.jpg",
        1024,
        "user-1",
      );
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64);
    });

    it("should return different hash when file size or user changes", () => {
      const hash1 = service.computeDeterministicHash(
        "waste/test.jpg",
        1024,
        "user-1",
      );
      const hash2 = service.computeDeterministicHash(
        "waste/test.jpg",
        2048,
        "user-1",
      );
      expect(hash1).not.toBe(hash2);
    });
  });

  describe("verifyStorageObject()", () => {
    it("should verify storage object existence and hash matching", async () => {
      const isValid = await service.verifyStorageObject(
        "waste/2026-07/img-123.jpg",
        "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      );
      expect(isValid).toBe(true);
    });
  });

  describe("validateImageMagicBytes()", () => {
    it("should pass magic-byte verification for valid JPEG buffer", () => {
      const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
      expect(() => service.validateImageMagicBytes(jpegBuffer)).not.toThrow();
    });

    it("should pass magic-byte verification for valid PNG buffer", () => {
      const pngBuffer = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
      ]);
      expect(() => service.validateImageMagicBytes(pngBuffer)).not.toThrow();
    });

    it("should pass magic-byte verification for valid WEBP buffer", () => {
      const webpBuffer = Buffer.from([
        0x52,
        0x49,
        0x46,
        0x46, // RIFF
        0x00,
        0x00,
        0x00,
        0x00, // file size
        0x57,
        0x45,
        0x42,
        0x50, // WEBP
      ]);
      expect(() => service.validateImageMagicBytes(webpBuffer)).not.toThrow();
    });

    it("should throw BadRequestException for spoofed/polyglot executable file buffer", () => {
      const scriptBuffer = Buffer.from('#!/bin/sh\necho "malware"');
      expect(() => service.validateImageMagicBytes(scriptBuffer)).toThrow(
        BadRequestException,
      );
    });

    it("should throw BadRequestException for Windows exe/dll MZ header", () => {
      const exeBuffer = Buffer.from([0x4d, 0x5a, 0x90, 0x00]);
      expect(() => service.validateImageMagicBytes(exeBuffer)).toThrow(
        BadRequestException,
      );
    });
  });
});
