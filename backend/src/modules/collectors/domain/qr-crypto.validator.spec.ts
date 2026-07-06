import { QrCryptoValidator } from "./qr-crypto.validator";
import { BadRequestException } from "@nestjs/common";

describe("QrCryptoValidator", () => {
  it("should return true when submitted secret matches expected secret", () => {
    const secret = "550e8400-e29b-41d4-a716-446655440000";
    expect(QrCryptoValidator.verifyQrSecret(secret, secret)).toBe(true);
  });

  it("should throw BadRequestException when secrets do not match", () => {
    const submitted = "wrong-token-123";
    const expected = "valid-token-456";

    expect(() => {
      QrCryptoValidator.verifyQrSecret(submitted, expected);
    }).toThrow(BadRequestException);
  });

  it("should throw BadRequestException when submitted secret is empty or missing", () => {
    expect(() => {
      QrCryptoValidator.verifyQrSecret("", "valid-token");
    }).toThrow(BadRequestException);
  });
});
