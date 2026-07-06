import {
  Injectable,
  Logger,
  NotFoundException,
  Inject,
  forwardRef,
} from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { CreateNotificationDto } from "./dto/create-notification.dto";
import { UpdateNotificationDto } from "./dto/update-notification.dto";
import { NotificationQueryDto } from "./dto/notification-query.dto";
import { EmailProvider } from "../../common/providers/notification/email.provider";
import { SMSProvider } from "../../common/providers/notification/sms.provider";
import { PushProvider } from "../../common/providers/notification/push.provider";
import { InAppProvider } from "../../common/providers/notification/in-app.provider";
import { NotificationsGateway } from "./notifications.gateway";
import { NotificationPriority, NotificationCategory } from "@prisma/client";

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailProvider: EmailProvider,
    private readonly smsProvider: SMSProvider,
    private readonly pushProvider: PushProvider,
    private readonly inAppProvider: InAppProvider,
    @Inject(forwardRef(() => NotificationsGateway))
    private readonly gateway: NotificationsGateway,
  ) {}

  async create(dto: CreateNotificationDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
      include: { settings: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${dto.userId} not found`);
    }

    const notification = await this.prisma.notification.create({
      data: {
        userId: dto.userId,
        title: dto.title,
        message: dto.message,
        type: dto.type || "INFO",
        priority: dto.priority || NotificationPriority.NORMAL,
        category: dto.category || NotificationCategory.SYSTEM,
        actionUrl: dto.actionUrl || null,
        metadata: dto.metadata || {},
        expirationDate: dto.expirationDate
          ? new Date(dto.expirationDate)
          : null,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
      },
    });

    const settings = user.settings || {
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: true,
    };

    // Dispatch via InApp Provider & Gateway
    await this.inAppProvider.send({
      userId: dto.userId,
      title: dto.title,
      message: dto.message,
      priority: notification.priority,
      category: notification.category,
      actionUrl: notification.actionUrl || undefined,
      metadata: notification.metadata as Record<string, any>,
    });
    this.gateway.sendNotificationToUser(dto.userId, notification);

    // Dispatch via Email Provider if enabled
    if (settings.emailNotifications && user.email) {
      this.emailProvider
        .send({
          userId: dto.userId,
          recipient: user.email,
          title: dto.title,
          message: dto.message,
        })
        .catch((err) =>
          this.logger.error("Email dispatch failed in service", err),
        );
    }

    // Dispatch via SMS Provider if enabled
    if (settings.smsNotifications && user.phone) {
      this.smsProvider
        .send({
          userId: dto.userId,
          recipient: user.phone,
          title: dto.title,
          message: dto.message,
        })
        .catch((err) =>
          this.logger.error("SMS dispatch failed in service", err),
        );
    }

    // Dispatch via Push Provider if enabled
    if (
      settings.pushNotifications &&
      user.deviceTokens &&
      user.deviceTokens.length > 0
    ) {
      for (const token of user.deviceTokens) {
        this.pushProvider
          .send({
            userId: dto.userId,
            recipient: token,
            title: dto.title,
            message: dto.message,
          })
          .catch((err) =>
            this.logger.error("Push dispatch failed in service", err),
          );
      }
    }

    return notification;
  }

  async findAll(userId: string, query: NotificationQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (query.isRead !== undefined) {
      where.isRead = query.isRead === "true";
    }
    if (query.category) {
      where.category = query.category;
    }
    if (query.priority) {
      where.priority = query.priority;
    }

    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { unreadCount: count };
  }

  async markAsRead(
    userId: string,
    notificationId: string,
    dto?: UpdateNotificationDto,
  ) {
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException(
        `Notification with ID ${notificationId} not found`,
      );
    }

    const updated = await this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: dto?.isRead !== undefined ? dto.isRead : true },
    });

    this.gateway.emitBadgeUpdate(userId);
    return updated;
  }

  async markAllAsRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    this.gateway.emitBadgeUpdate(userId);
    return { updatedCount: result.count };
  }

  async remove(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException(
        `Notification with ID ${notificationId} not found`,
      );
    }

    await this.prisma.notification.delete({
      where: { id: notificationId },
    });

    this.gateway.emitBadgeUpdate(userId);
    return { deleted: true };
  }
}
