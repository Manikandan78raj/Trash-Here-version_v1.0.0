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
import { Logger } from "@nestjs/common";
import { Server, Socket } from "socket.io";

@WebSocketGateway({
  cors: {
    origin: "*",
    credentials: true,
  },
  namespace: "/logistics",
})
export class CollectorLogisticsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(CollectorLogisticsGateway.name);

  afterInit(server: Server) {
    this.logger.log(
      "🚚 [CollectorLogisticsGateway] Initialized on namespace /logistics",
    );
  }

  handleConnection(client: Socket) {
    this.logger.log(`🚚 Logistics Client Connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`🚚 Logistics Client Disconnected: ${client.id}`);
  }

  @SubscribeMessage("join:pickup")
  handleJoinPickup(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { pickupId: string },
  ) {
    if (data?.pickupId) {
      client.join(`pickup:${data.pickupId}`);
      this.logger.log(
        `Client ${client.id} joined room pickup:${data.pickupId}`,
      );
    }
  }

  emitLocationUpdate(
    pickupId: string,
    lat: number,
    lng: number,
    collectorId: string,
  ) {
    if (this.server) {
      this.server.to(`pickup:${pickupId}`).emit("collector:location", {
        collectorId,
        lat,
        lng,
        timestamp: new Date().toISOString(),
      });
      this.server.emit("collector:location:broadcast", {
        collectorId,
        lat,
        lng,
      });
    }
  }

  emitJobStatusChange(pickupId: string, status: string, details?: any) {
    if (this.server) {
      this.server.to(`pickup:${pickupId}`).emit("pickup:status", {
        pickupId,
        status,
        details,
        timestamp: new Date().toISOString(),
      });
      this.server.emit("pickup:status:broadcast", {
        pickupId,
        status,
        details,
      });
    }
  }
}
