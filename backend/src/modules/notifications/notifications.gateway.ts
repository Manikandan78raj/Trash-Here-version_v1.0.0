import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from "@nestjs/websockets";
import { Logger, Inject, forwardRef } from "@nestjs/common";
import { Server, Socket } from "socket.io";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../common/prisma/prisma.service";

/**
 * Enterprise Real-Time Notification Gateway
 * Designed for horizontal scaling with Redis Pub/Sub adapter readiness.
 */
@WebSocketGateway({
  cors: {
    origin: "*",
    credentials: true,
  },
  namespace: "/notifications",
})
export class NotificationsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  afterInit(server: Server) {
    this.logger.log(
      "🌐 [NotificationsGateway] Initialized on namespace /notifications",
    );
    // Redis Pub/Sub Adapter Readiness hook:
    // If REDIS_URL is present, an external IoAdapter (e.g. RedisIoAdapter) is bound at bootstrap.
    // All server.to(room).emit() calls automatically propagate across cluster nodes.
  }

  async handleConnection(client: Socket) {
    try {
      const token = this.extractTokenFromSocket(client);
      if (!token) {
        this.logger.warn(`Client ${client.id} disconnected: Missing JWT token`);
        client.disconnect(true);
        return;
      }

      const secret =
        this.configService.get<string>("JWT_SECRET") ||
        "super-secret-trash-here-enterprise-jwt-key-2026";
      const payload = this.jwtService.verify(token, { secret });

      if (!payload || !payload.sub) {
        this.logger.warn(
          `Client ${client.id} disconnected: Invalid JWT payload`,
        );
        client.disconnect(true);
        return;
      }

      // Attach user metadata to socket
      (client as any).userId = payload.sub;
      (client as any).role = payload.role;

      // Join user-specific cluster-wide room
      const userRoom = `room:user:${payload.sub}`;
      await client.join(userRoom);

      this.logger.log(
        `⚡ [WebSocket Connected] Client ${client.id} joined ${userRoom}`,
      );

      // Push initial badge count
      await this.emitBadgeUpdate(payload.sub);
    } catch (error) {
      this.logger.error(`Handshake auth error for client ${client.id}`, error);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = (client as any).userId;
    this.logger.log(
      `🔴 [WebSocket Disconnected] Client ${client.id} (User: ${userId || "Anonymous"})`,
    );
  }

  private extractTokenFromSocket(client: Socket): string | null {
    const authHeader = client.handshake.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authHeader.split(" ")[1];
    }
    const tokenParam =
      client.handshake.auth?.token || client.handshake.query?.token;
    if (typeof tokenParam === "string") {
      return tokenParam;
    }
    return null;
  }

  /**
   * Dispatches a notification payload to all connected sockets of a user across the cluster.
   */
  sendNotificationToUser(userId: string, notification: any) {
    const room = `room:user:${userId}`;
    this.server.to(room).emit("notification:new", notification);
    this.logger.log(`📢 Emitted notification:new to ${room}`);
  }

  /**
   * Emits updated unread notification count to the user's room.
   */
  async emitBadgeUpdate(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });
    const room = `room:user:${userId}`;
    this.server.to(room).emit("notification:badge", { unreadCount: count });
  }

  @SubscribeMessage("notification:mark_read")
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { notificationId: string },
  ) {
    const userId = (client as any).userId;
    if (!userId || !data?.notificationId) return { success: false };

    try {
      await this.prisma.notification.updateMany({
        where: { id: data.notificationId, userId },
        data: { isRead: true },
      });
      await this.emitBadgeUpdate(userId);
      return { success: true, notificationId: data.notificationId };
    } catch (err) {
      this.logger.error("Error handling notification:mark_read event", err);
      return { success: false };
    }
  }
}
