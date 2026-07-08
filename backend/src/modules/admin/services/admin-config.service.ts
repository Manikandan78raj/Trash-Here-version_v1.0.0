import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../common/prisma/prisma.service";
import { AdminAuditService } from "./admin-audit.service";
import { UpdateSystemConfigDto } from "../dto/admin.dto";

@Injectable()
export class AdminConfigService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AdminAuditService,
  ) {}

  async getConfig(key: string, fallbackDefault: string): Promise<string> {
    const config = await this.prisma.systemConfig.findUnique({
      where: { key },
    });
    return config ? config.value : fallbackDefault;
  }

  async updateConfig(adminId: string, dto: UpdateSystemConfigDto) {
    const updated = await this.prisma.systemConfig.upsert({
      where: { key: dto.key },
      update: {
        value: dto.value,
        description: dto.description || undefined,
        updatedBy: adminId,
      },
      create: {
        key: dto.key,
        value: dto.value,
        description: dto.description || null,
        updatedBy: adminId,
      },
    });

    await this.auditService.recordAudit({
      userId: adminId,
      action: "CONFIG_UPDATE",
      entity: "SystemConfig",
      entityId: updated.id,
      details: `Updated ${dto.key} to ${dto.value}`,
    });

    return updated;
  }

  async getAllConfigs() {
    return this.prisma.systemConfig.findMany({
      orderBy: { key: "asc" },
    });
  }
}
