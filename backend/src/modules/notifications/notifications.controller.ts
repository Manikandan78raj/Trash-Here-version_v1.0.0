import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { NotificationsService } from "./notifications.service";
import { CreateNotificationDto } from "./dto/create-notification.dto";
import { UpdateNotificationDto } from "./dto/update-notification.dto";
import { NotificationQueryDto } from "./dto/notification-query.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";

@ApiTags("Notifications")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @ApiOperation({
    summary: "Create and dispatch a real-time notification across channels",
  })
  @ApiResponse({
    status: 201,
    description: "Notification dispatched successfully",
  })
  async create(@Body() createNotificationDto: CreateNotificationDto) {
    const notification = await this.notificationsService.create(
      createNotificationDto,
    );
    return {
      message: "Notification created and dispatched successfully",
      data: notification,
    };
  }

  @Get()
  @ApiOperation({
    summary: "Get paginated notification history for authenticated user",
  })
  @ApiResponse({ status: 200, description: "Notification history retrieved" })
  async findAll(@Req() req: any, @Query() query: NotificationQueryDto) {
    const result = await this.notificationsService.findAll(req.user.id, query);
    return {
      message: "Notifications retrieved successfully",
      data: result,
    };
  }

  @Get("unread-count")
  @ApiOperation({ summary: "Get unread notification count badge" })
  @ApiResponse({ status: 200, description: "Unread count returned" })
  async getUnreadCount(@Req() req: any) {
    const result = await this.notificationsService.getUnreadCount(req.user.id);
    return {
      message: "Unread count retrieved successfully",
      data: result,
    };
  }

  @Patch("read-all")
  @ApiOperation({
    summary: "Mark all notifications as read for authenticated user",
  })
  @ApiResponse({ status: 200, description: "All notifications marked read" })
  async markAllAsRead(@Req() req: any) {
    const result = await this.notificationsService.markAllAsRead(req.user.id);
    return {
      message: "All notifications marked as read",
      data: result,
    };
  }

  @Patch(":id/read")
  @ApiOperation({ summary: "Mark a single notification as read or unread" })
  @ApiResponse({ status: 200, description: "Notification read status updated" })
  async markAsRead(
    @Req() req: any,
    @Param("id") id: string,
    @Body() updateDto: UpdateNotificationDto,
  ) {
    const result = await this.notificationsService.markAsRead(
      req.user.id,
      id,
      updateDto,
    );
    return {
      message: "Notification status updated successfully",
      data: result,
    };
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a notification from history" })
  @ApiResponse({ status: 200, description: "Notification deleted" })
  async remove(@Req() req: any, @Param("id") id: string) {
    const result = await this.notificationsService.remove(req.user.id, id);
    return {
      message: "Notification deleted successfully",
      data: result,
    };
  }
}
