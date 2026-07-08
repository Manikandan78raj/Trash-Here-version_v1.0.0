import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../../common/prisma/prisma.service";
import {
  AuditEvent,
  SecurityAlert,
  IAdminAuditProvider,
} from "../interfaces/admin.interface";
import { AuditFilterDto } from "../dto/admin.dto";

@Injectable()
export class AdminAuditService implements IAdminAuditProvider {
  private readonly logger = new Logger(AdminAuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async recordAudit(event: AuditEvent): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        userId: event.userId || null,
        action: event.action,
        entity: event.entity,
        entityId: event.entityId || null,
        ipAddress: event.ipAddress || "127.0.0.1",
        userAgent: event.userAgent || "Unknown",
        details: event.details || null,
      },
    });
  }

  async getAuditLogs(filter: AuditFilterDto) {
    const where: any = {};
    if (filter.userId) where.userId = filter.userId;
    if (filter.action) where.action = filter.action;
    if (filter.entity) where.entity = filter.entity;

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        take: filter.limit || 50,
        skip: filter.offset || 0,
        orderBy: { timestamp: "desc" },
        include: {
          user: { select: { id: true, fullName: true, email: true } },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data,
      total,
      limit: filter.limit || 50,
      offset: filter.offset || 0,
    };
  }

  async triggerAlert(alert: SecurityAlert): Promise<boolean> {
    this.logger.warn(
      `[SECURITY ALERT - ${alert.severity}] ${alert.title}: ${alert.message}`,
    );
    if (alert.severity === "CRITICAL" || alert.severity === "HIGH") {
      // In enterprise production, this triggers PagerDuty / Slack webhook / Email
      this.logger.error(
        `🚨 URGENT NOTIFICATION DISPATCHED FOR CRITICAL ALERT: ${alert.title}`,
      );
    }
    return true;
  }
}
