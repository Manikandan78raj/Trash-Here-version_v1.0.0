import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { UpdateProfileDto, CreateAddressDto } from "./dto/users.dto";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        addresses: true,
        wallet: true,
        collectorProfile: {
          include: { vehicles: true },
        },
      },
    });

    if (!user) throw new NotFoundException("User profile not found");
    const { passwordHash, ...result } = user;
    return result;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
      include: { role: true, wallet: true },
    });

    const { passwordHash, ...result } = updatedUser;
    return result;
  }

  async getAddresses(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: { isDefault: "desc" },
    });
  }

  async createAddress(userId: string, dto: CreateAddressDto) {
    if (dto.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return this.prisma.address.create({
      data: {
        ...dto,
        userId,
      },
    });
  }

  async deleteAddress(userId: string, addressId: string) {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });
    if (!address) throw new NotFoundException("Address not found");

    await this.prisma.address.delete({
      where: { id: addressId },
    });

    return { message: "Address deleted successfully" };
  }

  async getEcoScore(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        ecoScore: true,
        carbonSavedKg: true,
        _count: {
          select: { pickupRequests: { where: { status: "COMPLETED" } } },
        },
      },
    });

    if (!user) throw new NotFoundException("User not found");

    return {
      ecoScore: user.ecoScore,
      carbonSavedKg: user.carbonSavedKg,
      completedPickups: user._count.pickupRequests,
      tierLevel:
        user.ecoScore >= 900
          ? "Green Champion"
          : user.ecoScore >= 700
            ? "Eco Warrior"
            : "Sustainability Starter",
    };
  }

  async getNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
  }

  async markNotificationRead(userId: string, notificationId: string) {
    const notif = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });
    if (!notif) throw new NotFoundException("Notification not found");

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }
}
