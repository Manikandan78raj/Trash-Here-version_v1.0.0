import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { UpdateProfileDto, CreateAddressDto } from "./dto/users.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@ApiTags("Users & Profile")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth("access-token")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("profile")
  @ApiOperation({ summary: "Get current user profile, addresses, and wallet" })
  async getProfile(@CurrentUser() user: any) {
    return this.usersService.getProfile(user.id);
  }

  @Put("profile")
  @ApiOperation({ summary: "Update user profile information" })
  async updateProfile(@CurrentUser() user: any, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Get("addresses")
  @ApiOperation({ summary: "Get all saved addresses for current user" })
  async getAddresses(@CurrentUser() user: any) {
    return this.usersService.getAddresses(user.id);
  }

  @Post("addresses")
  @ApiOperation({ summary: "Add a new pickup address" })
  async createAddress(@CurrentUser() user: any, @Body() dto: CreateAddressDto) {
    return this.usersService.createAddress(user.id, dto);
  }

  @Delete("addresses/:id")
  @ApiOperation({ summary: "Delete a saved address" })
  async deleteAddress(
    @CurrentUser() user: any,
    @Param("id") addressId: string,
  ) {
    return this.usersService.deleteAddress(user.id, addressId);
  }

  @Get("eco-score")
  @ApiOperation({ summary: "Get live Eco Score and carbon offset metrics" })
  async getEcoScore(@CurrentUser() user: any) {
    return this.usersService.getEcoScore(user.id);
  }

  @Get("notifications")
  @ApiOperation({ summary: "Get all notifications for current user" })
  async getNotifications(@CurrentUser() user: any) {
    return this.usersService.getNotifications(user.id);
  }

  @Put("notifications/:id/read")
  @ApiOperation({ summary: "Mark a notification as read" })
  async markNotificationRead(
    @CurrentUser() user: any,
    @Param("id") notificationId: string,
  ) {
    return this.usersService.markNotificationRead(user.id, notificationId);
  }
}
