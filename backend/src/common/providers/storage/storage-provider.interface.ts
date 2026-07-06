export interface UploadedFileResult {
  url: string;
  key: string;
  provider: string;
}

export interface StorageProvider {
  readonly name: string;
  upload(
    file: { buffer: Buffer; originalname: string; mimetype: string },
    folder?: string,
  ): Promise<UploadedFileResult>;
  delete(key: string): Promise<boolean>;
}
