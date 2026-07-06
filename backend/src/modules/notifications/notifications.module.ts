import { Module } from "@nestjs/common";
import { NotificationsController } from "./notifications.controller";
import { NotificationsService } from "./notifications.service";
import { NotificationsGateway } from "./notifications.gateway";
import { EmailProvider } from "../../common/providers/notification/email.provider";
import { SMSProvider } from "../../common/providers/notification/sms.provider";
import { PushProvider } from "../../common/providers/notification/push.provider";
import { InAppProvider } from "../../common/providers/notification/in-app.provider";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationsGateway,
    EmailProvider,
    SMSProvider,
    PushProvider,
    InAppProvider,
  ],
  exports: [NotificationsService, NotificationsGateway],
})
export class NotificationsModule {}
