import { Injectable, Logger } from "@nestjs/common";
import {
  IDigitalScaleProvider,
  ScaleReading,
} from "../interfaces/digital-scale.provider.interface";
import * as crypto from "crypto";

@Injectable()
export class MockDigitalScaleProvider implements IDigitalScaleProvider {
  private readonly logger = new Logger(MockDigitalScaleProvider.name);
  private readonly secretKey =
    process.env.JWT_SECRET || "trash-here-weighbridge-secret-key-2026";

  async getScaleReading(scaleId: string): Promise<ScaleReading> {
    this.logger.log(
      `Polling IoT weighbridge scale [${scaleId}] for stable weight reading...`,
    );
    // Simulate realistic truck weight between 4,000 kg (tare) and 25,000 kg (gross)
    const simulatedWeight =
      Math.floor(Math.random() * (25000 - 4000 + 1)) + 4000;
    return {
      weightKg: simulatedWeight,
      isStable: true,
      timestamp: new Date().toISOString(),
      scaleCalibrationDate: "2026-01-15T08:00:00.000Z",
    };
  }

  generateDigitalSeal(payload: string): string {
    const hmac = crypto.createHmac("sha256", this.secretKey);
    hmac.update(payload);
    return hmac.digest("hex");
  }

  verifyDigitalSeal(payload: string, signature: string): boolean {
    const expected = this.generateDigitalSeal(payload);
    return crypto.timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(signature, "hex"),
    );
  }
}
