import { Injectable, Logger } from "@nestjs/common";
import {
  StorageProvider,
  UploadedFileResult,
} from "./storage-provider.interface";

@Injectable()
export class LocalStorageProvider implements StorageProvider {
  readonly name = "LocalStorageProvider";
  private readonly logger = new Logger(LocalStorageProvider.name);

  async upload(
    file: { buffer: Buffer; originalname: string; mimetype: string },
    folder = "avatars",
  ): Promise<UploadedFileResult> {
    const key = `${folder}/${Date.now()}-${file.originalname}`;
    this.logger.log(
      `💾 [Local Storage Dev] Stored file ${file.originalname} (${file.buffer.length} bytes) to key: ${key}`,
    );
    return {
      url: `http://localhost:3000/uploads/${key}`,
      key,
      provider: this.name,
    };
  }

  async delete(key: string): Promise<boolean> {
    this.logger.log(`💾 [Local Storage Dev] Deleted key: ${key}`);
    return true;
  }
}
