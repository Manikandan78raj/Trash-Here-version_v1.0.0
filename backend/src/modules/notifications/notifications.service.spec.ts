import { Test, TestingModule } from "@nestjs/testing";
import { NotificationsService } from "./notifications.service";
import { PrismaService } from "../../common/prisma/prisma.service";
import { EmailProvider } from "../../common/providers/notification/email.provider";
import { SMSProvider } from "../../common/providers/notification/sms.provider";
import { PushProvider } from "../../common/providers/notification/push.provider";
import { InAppProvider } from "../../common/providers/notification/in-app.provider";
import { NotificationsGateway } from "./notifications.gateway";
import { NotificationPriority, NotificationCategory } from "@prisma/client";

describe("NotificationsService", () => {
  let service: NotificationsService;
  let prisma: PrismaService;
  let emailProvider: EmailProvider;
  let smsProvider: SMSProvider;
  let pushProvider: PushProvider;
  let inAppProvider: InAppProvider;
  let gateway: NotificationsGateway;

  const mockUser = {
    id: "user-123",
    email: "test@example.com",
    phone: "+15551234567",
    deviceTokens: ["token-1", "token-2"],
    settings: {
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: true,
    },
  };

  const mockNotification = {
    id: "notif-1",
    userId: "user-123",
    title: "Test Title",
    message: "Test Message",
    type: "INFO",
    priority: NotificationPriority.NORMAL,
    category: NotificationCategory.SYSTEM,
    isRead: false,
    createdAt: new Date(),
  };

  const mockPrisma = {
    user: {
      findUnique: jest.fn().mockResolvedValue(mockUser),
    },
    notification: {
      create: jest.fn().mockResolvedValue(mockNotification),
      findMany: jest.fn().mockResolvedValue([mockNotification]),
      findFirst: jest.fn().mockResolvedValue(mockNotification),
      count: jest.fn().mockResolvedValue(1),
      update: jest
        .fn()
        .mockResolvedValue({ ...mockNotification, isRead: true }),
      updateMany: jest.fn().mockResolvedValue({ count: 5 }),
      delete: jest.fn().mockResolvedValue(mockNotification),
    },
  };

  const mockEmail = { send: jest.fn().mockResolvedValue(true) };
  const mockSms = { send: jest.fn().mockResolvedValue(true) };
  const mockPush = { send: jest.fn().mockResolvedValue(true) };
  const mockInApp = { send: jest.fn().mockResolvedValue(true) };
  const mockGateway = {
    sendNotificationToUser: jest.fn(),
    emitBadgeUpdate: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EmailProvider, useValue: mockEmail },
        { provide: SMSProvider, useValue: mockSms },
        { provide: PushProvider, useValue: mockPush },
        { provide: InAppProvider, useValue: mockInApp },
        { provide: NotificationsGateway, useValue: mockGateway },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    prisma = module.get<PrismaService>(PrismaService);
    emailProvider = module.get<EmailProvider>(EmailProvider);
    smsProvider = module.get<SMSProvider>(SMSProvider);
    pushProvider = module.get<PushProvider>(PushProvider);
    inAppProvider = module.get<InAppProvider>(InAppProvider);
    gateway = module.get<NotificationsGateway>(NotificationsGateway);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create notification and dispatch across enabled providers", async () => {
      const dto = {
        userId: "user-123",
        title: "Test Title",
        message: "Test Message",
      };

      const result = await service.create(dto);
      expect(result).toEqual(mockNotification);
      expect(prisma.notification.create).toHaveBeenCalled();
      expect(inAppProvider.send).toHaveBeenCalled();
      expect(gateway.sendNotificationToUser).toHaveBeenCalledWith(
        "user-123",
        mockNotification,
      );
      expect(emailProvider.send).toHaveBeenCalledWith(
        expect.objectContaining({ recipient: "test@example.com" }),
      );
      expect(smsProvider.send).toHaveBeenCalledWith(
        expect.objectContaining({ recipient: "+15551234567" }),
      );
      expect(pushProvider.send).toHaveBeenCalledTimes(2); // 2 device tokens
    });
  });

  describe("findAll", () => {
    it("should return paginated notification list", async () => {
      const result = await service.findAll("user-123", { page: 1, limit: 10 });
      expect(result.items).toEqual([mockNotification]);
      expect(result.meta.total).toBe(1);
    });
  });

  describe("getUnreadCount", () => {
    it("should return unread badge count", async () => {
      const result = await service.getUnreadCount("user-123");
      expect(result.unreadCount).toBe(1);
    });
  });

  describe("markAsRead", () => {
    it("should mark notification read and emit badge update", async () => {
      const result = await service.markAsRead("user-123", "notif-1");
      expect(result.isRead).toBe(true);
      expect(gateway.emitBadgeUpdate).toHaveBeenCalledWith("user-123");
    });
  });

  describe("markAllAsRead", () => {
    it("should mark all notifications read and emit badge update", async () => {
      const result = await service.markAllAsRead("user-123");
      expect(result.updatedCount).toBe(5);
      expect(gateway.emitBadgeUpdate).toHaveBeenCalledWith("user-123");
    });
  });
});
