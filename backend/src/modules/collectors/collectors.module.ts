import { Module } from "@nestjs/common";
import { CollectorsController } from "./collectors.controller";
import { CollectorsService } from "./collectors.service";
import { CollectorLogisticsService } from "./services/collector-logistics.service";
import { CollectorPayoutsService } from "./services/collector-payouts.service";
import { GoogleMapsPolylineProvider } from "./providers/google-maps-polyline.provider";
import { StripeConnectProvider } from "./providers/stripe-connect.provider";
import { CollectorLogisticsGateway } from "./gateways/collector-logistics.gateway";
import { WalletModule } from "../wallet/wallet.module";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [WalletModule, NotificationsModule],
  controllers: [CollectorsController],
  providers: [
    CollectorsService,
    CollectorLogisticsService,
    CollectorPayoutsService,
    GoogleMapsPolylineProvider,
    StripeConnectProvider,
    CollectorLogisticsGateway,
  ],
  exports: [
    CollectorsService,
    CollectorLogisticsService,
    CollectorPayoutsService,
  ],
})
export class CollectorsModule {}
