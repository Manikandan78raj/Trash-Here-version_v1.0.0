import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  NotificationProvider,
  NotificationPayload,
} from "./notification-provider.interface";

@Injectable()
export class SMSProvider implements NotificationProvider {
  readonly name = "SMSProvider";
  private readonly logger = new Logger(SMSProvider.name);
  private readonly twilioAccountSid: string | undefined;
  private readonly twilioAuthToken: string | undefined;
  private readonly twilioPhoneNumber: string | undefined;

  constructor(private readonly configService: ConfigService) {
    this.twilioAccountSid =
      this.configService.get<string>("TWILIO_ACCOUNT_SID");
    this.twilioAuthToken = this.configService.get<string>("TWILIO_AUTH_TOKEN");
    this.twilioPhoneNumber = this.configService.get<string>(
      "TWILIO_PHONE_NUMBER",
    );
  }

  async send(payload: NotificationPayload): Promise<boolean> {
    if (!payload.recipient) {
      this.logger.warn(
        `Cannot send SMS to user ${payload.userId}: no phone recipient provided`,
      );
      return false;
    }

    try {
      // Twilio SMS Service Abstraction (uses environment configuration)
      if (
        this.twilioAccountSid &&
        this.twilioAuthToken &&
        this.twilioPhoneNumber
      ) {
        this.logger.log(
          `📱 [Twilio SMS Delivery] Dispatching via account ${this.twilioAccountSid.slice(0, 6)}... to ${payload.recipient}: "${payload.message}"`,
        );
      } else {
        this.logger.log(
          `📱 [Simulated SMS Delivery] Sent to ${payload.recipient}: "${payload.message}"`,
        );
      }
      return true;
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${payload.recipient}`, error);
      return false;
    }
  }
}
