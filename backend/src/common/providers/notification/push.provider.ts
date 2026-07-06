import { Injectable, Logger } from "@nestjs/common";
import {
  NotificationProvider,
  NotificationPayload,
} from "./notification-provider.interface";

@Injectable()
export class PushProvider implements NotificationProvider {
  readonly name = "PushProvider";
  private readonly logger = new Logger(PushProvider.name);

  async send(payload: NotificationPayload): Promise<boolean> {
    if (!payload.recipient) {
      this.logger.warn(
        `Cannot send push notification to user ${payload.userId}: no device token provided`,
      );
      return false;
    }

    try {
      // APNs / FCM Abstraction
      this.logger.log(
        `📲 [Push Notification] Delivered to device token ${payload.recipient.slice(0, 15)}... | Title: "${payload.title}"`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send push notification to ${payload.recipient}`,
        error,
      );
      return false;
    }
  }
}
