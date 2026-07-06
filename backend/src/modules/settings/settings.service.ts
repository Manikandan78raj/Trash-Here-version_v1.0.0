import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { UpdateSettingsDto } from "./dto/update-settings.dto";

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getSettings(userId: string) {
    let settings = await this.prisma.userSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      settings = await this.prisma.userSettings.create({
        data: { userId },
      });
    }

    return settings;
  }

  async updateSettings(userId: string, dto: UpdateSettingsDto, req?: any) {
    const current = await this.getSettings(userId);

    // Check if any notification preference changed
    const notifFields = [
      "emailNotifications",
      "smsNotifications",
      "pushNotifications",
      "pickupAlerts",
      "rewardAlerts",
      "securityAlerts",
      "marketingAlerts",
    ];

    let notifPreferenceChanged = false;
    for (const field of notifFields) {
      if (
        dto[field as keyof UpdateSettingsDto] !== undefined &&
        dto[field as keyof UpdateSettingsDto] !==
          current[field as keyof typeof current]
      ) {
        notifPreferenceChanged = true;
        break;
      }
    }

    const updated = await this.prisma.userSettings.upsert({
      where: { userId },
      update: { ...dto },
      create: { userId, ...dto },
    });

    if (notifPreferenceChanged) {
      await this.logAudit(
        userId,
        "notification preference changed",
        "UserSettings",
        updated.id,
        req,
      );
    }

    return updated;
  }

  private async logAudit(
    userId: string,
    action: string,
    entity: string,
    entityId: string,
    req?: any,
  ) {
    try {
      const ipAddress =
        req?.ip ||
        req?.headers?.["x-forwarded-for"] ||
        req?.connection?.remoteAddress ||
        "127.0.0.1";
      const userAgent = req?.headers?.["user-agent"] || "Unknown";

      await this.prisma.auditLog.create({
        data: {
          userId,
          action,
          entity,
          entityId,
          ipAddress: typeof ipAddress === "string" ? ipAddress : ipAddress[0],
          userAgent,
          details: `Updated setting triggering audit action: ${action}`,
        },
      });
      this.logger.log(`🛡️ [Audit Log] User ${userId} | Action: "${action}"`);
    } catch (err) {
      this.logger.error("Failed to write audit log in settings service", err);
    }
  }
}
