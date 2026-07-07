import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { PrismaModule } from "./common/prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { WasteCategoriesModule } from "./modules/waste-categories/waste-categories.module";
import { PickupsModule } from "./modules/pickups/pickups.module";
import { CollectorsModule } from "./modules/collectors/collectors.module";
import { WalletModule } from "./modules/wallet/wallet.module";
import { AdminModule } from "./modules/admin/admin.module";
import { HealthModule } from "./modules/health/health.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { ProfileModule } from "./modules/profile/profile.module";
import { SettingsModule } from "./modules/settings/settings.module";
import { RecyclerModule } from "./modules/recycler/recycler.module";
import { MarketingModule } from "./modules/marketing/marketing.module";
import { AiModule } from "./modules/ai/ai.module";
import { RedisCacheModule } from "./common/cache/redis-cache.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ["../.env", ".env"],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    RedisCacheModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    WasteCategoriesModule,
    PickupsModule,
    CollectorsModule,
    WalletModule,
    AdminModule,
    HealthModule,
    NotificationsModule,
    ProfileModule,
    SettingsModule,
    RecyclerModule,
    MarketingModule,
    AiModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
