import { Injectable, Logger } from "@nestjs/common";
import {
  NotificationProvider,
  NotificationPayload,
} from "./notification-provider.interface";

@Injectable()
export class InAppProvider implements NotificationProvider {
  readonly name = "InAppProvider";
  private readonly logger = new Logger(InAppProvider.name);

  async send(payload: NotificationPayload): Promise<boolean> {
    try {
      this.logger.log(
        `🔔 [In-App Notification] Queued for user ${payload.userId} | Title: "${payload.title}"`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to deliver in-app notification for user ${payload.userId}`,
        error,
      );
      return false;
    }
  }
}
