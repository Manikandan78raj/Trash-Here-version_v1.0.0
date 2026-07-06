import { Test, TestingModule } from "@nestjs/testing";
import { NotificationsGateway } from "./notifications.gateway";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../common/prisma/prisma.service";

describe("NotificationsGateway", () => {
  let gateway: NotificationsGateway;
  let jwtService: JwtService;
  let prisma: PrismaService;

  const mockJwt = {
    verify: jest.fn().mockReturnValue({ sub: "user-123", role: "USER" }),
  };
  const mockConfig = {
    get: jest.fn().mockReturnValue("secret"),
  };
  const mockPrisma = {
    notification: {
      count: jest.fn().mockResolvedValue(3),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
  };

  const mockSocket: any = {
    id: "socket-1",
    handshake: {
      headers: { authorization: "Bearer valid-token" },
    },
    join: jest.fn().mockResolvedValue(true),
    disconnect: jest.fn(),
  };

  const mockServer: any = {
    to: jest.fn().mockReturnThis(),
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsGateway,
        { provide: JwtService, useValue: mockJwt },
        { provide: ConfigService, useValue: mockConfig },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    gateway = module.get<NotificationsGateway>(NotificationsGateway);
    jwtService = module.get<JwtService>(JwtService);
    prisma = module.get<PrismaService>(PrismaService);
    gateway.server = mockServer;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(gateway).toBeDefined();
  });

  describe("handleConnection", () => {
    it("should authenticate client, join user room, and emit badge update", async () => {
      await gateway.handleConnection(mockSocket);
      expect(mockJwt.verify).toHaveBeenCalledWith(
        "valid-token",
        expect.any(Object),
      );
      expect(mockSocket.join).toHaveBeenCalledWith("room:user:user-123");
      expect(mockServer.to).toHaveBeenCalledWith("room:user:user-123");
      expect(mockServer.emit).toHaveBeenCalledWith("notification:badge", {
        unreadCount: 3,
      });
    });

    it("should disconnect client when token is missing", async () => {
      const invalidSocket: any = {
        id: "socket-2",
        handshake: { headers: {} },
        disconnect: jest.fn(),
      };
      await gateway.handleConnection(invalidSocket);
      expect(invalidSocket.disconnect).toHaveBeenCalledWith(true);
    });
  });

  describe("sendNotificationToUser", () => {
    it("should emit notification:new to user room", () => {
      gateway.sendNotificationToUser("user-123", { title: "Test" });
      expect(mockServer.to).toHaveBeenCalledWith("room:user:user-123");
      expect(mockServer.emit).toHaveBeenCalledWith("notification:new", {
        title: "Test",
      });
    });
  });

  describe("handleMarkRead", () => {
    it("should update DB read status and emit badge update", async () => {
      mockSocket.userId = "user-123";
      const result = await gateway.handleMarkRead(mockSocket, {
        notificationId: "notif-100",
      });
      expect(result).toEqual({ success: true, notificationId: "notif-100" });
      expect(prisma.notification.updateMany).toHaveBeenCalledWith({
        where: { id: "notif-100", userId: "user-123" },
        data: { isRead: true },
      });
      expect(mockServer.emit).toHaveBeenCalledWith("notification:badge", {
        unreadCount: 3,
      });
    });
  });
});
