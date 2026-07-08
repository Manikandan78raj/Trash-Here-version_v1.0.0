import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Logger } from "@nestjs/common";
import { Server, Socket } from "socket.io";

@WebSocketGateway({ cors: true, namespace: "/ai" })
export class AiGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(AiGateway.name);

  afterInit(server: Server) {
    this.logger.log("AI WebSocket Gateway initialized on /ai namespace");
  }

  handleConnection(client: Socket) {
    this.logger.debug(`Client connected to AI Gateway: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Client disconnected from AI Gateway: ${client.id}`);
  }

  emitPredictionCompleted(
    userId: string,
    data: { jobId: string; predictionId: string },
  ): void {
    this.logger.log(
      `[AiGateway] Emitting ai:prediction:completed for user ${userId} (job ${data.jobId})`,
    );
    if (this.server) {
      this.server.emit("ai:prediction:completed", {
        userId,
        ...data,
        timestamp: new Date().toISOString(),
      });
    }
  }

  emitJobFailed(userId: string, jobId: string, errorMessage: string): void {
    this.logger.warn(
      `[AiGateway] Emitting ai:job:failed for user ${userId} (job ${jobId}): ${errorMessage}`,
    );
    if (this.server) {
      this.server.emit("ai:job:failed", {
        userId,
        jobId,
        errorMessage,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
