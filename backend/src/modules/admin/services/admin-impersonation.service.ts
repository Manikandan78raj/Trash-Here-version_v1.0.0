import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { AdminAuditService } from './admin-audit.service';
import { StartImpersonationDto } from '../dto/admin.dto';
import { RoleType } from '@prisma/client';

@Injectable()
export class AdminImpersonationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AdminAuditService
  ) {}

  async startImpersonation(adminId: string, dto: StartImpersonationDto, ipAddress?: string, userAgent?: string) {
    const targetUser = await this.prisma.user.findUnique({
      where: { id: dto.targetUserId },
      include: { role: true },
    });
    if (!targetUser) {
      throw new NotFoundException(`Target user ${dto.targetUserId} not found`);
    }

    if (targetUser.role?.name === RoleType.SUPER_ADMIN) {
      throw new ForbiddenException('Cannot impersonate a SUPER_ADMIN account');
    }

    const log = await this.prisma.adminImpersonationLog.create({
      data: {
        adminId,
        targetUserId: dto.targetUserId,
        reason: dto.reason,
        ipAddress: ipAddress || '127.0.0.1',
        userAgent: userAgent || 'Unknown',
      },
    });

    await this.auditService.recordAudit({
      userId: adminId,
      action: 'IMPERSONATION_START',
      entity: 'User',
      entityId: dto.targetUserId,
      ipAddress: ipAddress || '127.0.0.1',
      userAgent: userAgent || 'Unknown',
      details: `Impersonation log ID: ${log.id}. Reason: ${dto.reason}`,
    });

    // In production, sign a short-lived JWT with { sub: targetUserId, actor: adminId, logId: log.id }
    const token = `imp-jwt-token-for-${targetUser.id}-by-${adminId}`;

    return {
      token,
      impersonationLogId: log.id,
      targetUser: {
        id: targetUser.id,
        email: targetUser.email,
        fullName: targetUser.fullName,
      },
      expiresIn: 900, // 15 minutes
    };
  }

  async stopImpersonation(impersonationLogId: string) {
    const log = await this.prisma.adminImpersonationLog.findUnique({
      where: { id: impersonationLogId },
    });
    if (!log) {
      throw new NotFoundException(`Impersonation log ${impersonationLogId} not found`);
    }

    const updated = await this.prisma.adminImpersonationLog.update({
      where: { id: impersonationLogId },
      data: { endedAt: new Date() },
    });

    await this.auditService.recordAudit({
      userId: log.adminId,
      action: 'IMPERSONATION_END',
      entity: 'AdminImpersonationLog',
      entityId: log.id,
      details: `Session terminated for target ${log.targetUserId}`,
    });

    return updated;
  }
}
