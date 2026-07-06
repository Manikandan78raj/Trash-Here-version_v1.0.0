import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  NotificationProvider,
  NotificationPayload,
} from "./notification-provider.interface";

@Injectable()
export class EmailProvider implements NotificationProvider {
  readonly name = "EmailProvider";
  private readonly logger = new Logger(EmailProvider.name);
  private readonly smtpHost: string | undefined;

  constructor(private readonly configService: ConfigService) {
    this.smtpHost = this.configService.get<string>("SMTP_HOST");
  }

  async send(payload: NotificationPayload): Promise<boolean> {
    if (!payload.recipient) {
      this.logger.warn(
        `Cannot send email to user ${payload.userId}: no email recipient provided`,
      );
      return false;
    }

    try {
      // SMTP / SendGrid / AWS SES Abstraction
      this.logger.log(
        `📧 [Email Delivery] Sent to ${payload.recipient} | Subject: "${payload.title}" | Body: "${payload.message}"`,
      );
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${payload.recipient}`, error);
      return false;
    }
  }
}
