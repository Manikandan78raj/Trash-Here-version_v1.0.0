import { BadRequestException } from "@nestjs/common";

export class QrCryptoValidator {
  /**
   * Verifies that the submitted QR code secret matches the pickup job's expected secret.
   * Throws BadRequestException if mismatch or empty.
   */
  public static verifyQrSecret(
    submittedSecret: string,
    expectedSecret: string,
  ): boolean {
    if (!submittedSecret || !expectedSecret) {
      throw new BadRequestException(
        "QR code token or pickup job secret is missing.",
      );
    }

    // In a production environment, this could also verify JWT/HMAC cryptographic signatures
    if (submittedSecret.trim() !== expectedSecret.trim()) {
      throw new BadRequestException(
        "Invalid QR code token scanned. This QR code does not belong to the selected household pickup request.",
      );
    }

    return true;
  }
}
