import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { v2 as cloudinary } from "cloudinary";
import {
  StorageProvider,
  UploadedFileResult,
} from "./storage-provider.interface";

@Injectable()
export class CloudinaryProvider implements StorageProvider {
  readonly name = "CloudinaryProvider";
  private readonly logger = new Logger(CloudinaryProvider.name);
  private isConfigured = false;

  constructor(private readonly configService: ConfigService) {
    const cloudName = this.configService.get<string>("CLOUDINARY_CLOUD_NAME");
    const apiKey = this.configService.get<string>("CLOUDINARY_API_KEY");
    const apiSecret = this.configService.get<string>("CLOUDINARY_API_SECRET");

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
      this.isConfigured = true;
    }
  }

  async upload(
    file: { buffer: Buffer; originalname: string; mimetype: string },
    folder = "avatars",
  ): Promise<UploadedFileResult> {
    if (!this.isConfigured) {
      this.logger.warn(
        "Cloudinary not configured. Falling back to simulated cloud URL.",
      );
      const simulatedKey = `${folder}/${Date.now()}-${file.originalname}`;
      return {
        url: `https://res.cloudinary.com/simulated-trash-here/image/upload/${simulatedKey}`,
        key: simulatedKey,
        provider: this.name,
      };
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder },
        (error, result) => {
          if (error || !result) {
            this.logger.error("Cloudinary upload failed", error);
            return reject(error || new Error("Upload failed"));
          }
          resolve({
            url: result.secure_url,
            key: result.public_id,
            provider: this.name,
          });
        },
      );
      uploadStream.end(file.buffer);
    });
  }

  async delete(key: string): Promise<boolean> {
    if (!this.isConfigured) return true;
    try {
      await cloudinary.uploader.destroy(key);
      return true;
    } catch (error) {
      this.logger.error(`Cloudinary delete failed for key ${key}`, error);
      return false;
    }
  }
}
