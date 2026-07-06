import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../../common/prisma/prisma.service";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { UpdateEmailDto } from "./dto/update-email.dto";
import { CloudinaryProvider } from "../../common/providers/storage/cloudinary.provider";

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryProvider: CloudinaryProvider,
  ) {}

  async logAudit(
    userId: string,
    action: string,
    entity = "User",
    entityId?: string,
    req?: any,
    details?: string,
  ) {
    try {
      const ipAddress =
        req?.ip ||
        req?.headers?.["x-forwarded-for"] ||
        req?.connection?.remoteAddress ||
        "127.0.0.1";
      const userAgent = req?.headers?.["user-agent"] || "Unknown";

      await this.prisma.auditLog.create({
        data: {
          userId,
          action,
          entity,
          entityId: entityId || userId,
          ipAddress: typeof ipAddress === "string" ? ipAddress : ipAddress[0],
          userAgent,
          details: details || `Performed action: ${action}`,
        },
      });
      this.logger.log(
        `🛡️ [Audit Log] User ${userId} | Action: "${action}" | IP: ${ipAddress}`,
      );
    } catch (err) {
      this.logger.error("Failed to write audit log", err);
    }
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        wallet: true,
        settings: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const { passwordHash, ...result } = user;
    return result;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto, req?: any) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    let fullName = user.fullName;
    if (dto.firstName || dto.lastName) {
      const names = fullName.split(" ");
      const first =
        dto.firstName !== undefined ? dto.firstName : names[0] || "";
      const last =
        dto.lastName !== undefined
          ? dto.lastName
          : names.slice(1).join(" ") || "";
      fullName = `${first} ${last}`.trim();
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        fullName,
        phone: dto.phone !== undefined ? dto.phone : user.phone,
        bio: dto.bio !== undefined ? dto.bio : user.bio,
      },
    });

    await this.logAudit(userId, "profile updated", "User", userId, req);

    const { passwordHash, ...result } = updated;
    return result;
  }

  async changePassword(userId: string, dto: ChangePasswordDto, req?: any) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.passwordHash) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const isMatch = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );
    if (!isMatch) {
      throw new UnauthorizedException("Current password is incorrect");
    }

    const newHash = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    await this.logAudit(userId, "password changed", "User", userId, req);
    return { success: true, message: "Password updated successfully" };
  }

  async updateEmail(userId: string, dto: UpdateEmailDto, req?: any) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.passwordHash) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException("Password verification failed");
    }

    const existing = await this.prisma.user.findUnique({
      where: { email: dto.newEmail },
    });
    if (existing && existing.id !== userId) {
      throw new ConflictException("Email is already in use by another account");
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { email: dto.newEmail, isVerified: false },
    });

    await this.logAudit(
      userId,
      "email changed",
      "User",
      userId,
      req,
      `New email: ${dto.newEmail}`,
    );

    const { passwordHash, ...result } = updated;
    return result;
  }

  async uploadAvatar(userId: string, file: any, req?: any) {
    if (!file) {
      throw new BadRequestException("No file uploaded");
    }

    // MIME Validation
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        "Invalid image format. Allowed formats: JPEG, PNG, WEBP",
      );
    }

    // File Size Validation (Max 5MB)
    const maxSizeBytes = 5 * 1024 * 1024;
    if (
      file.size > maxSizeBytes ||
      (file.buffer && file.buffer.length > maxSizeBytes)
    ) {
      throw new BadRequestException("File size exceeds 5MB limit");
    }

    const uploadResult = await this.cloudinaryProvider.upload(
      {
        buffer: file.buffer,
        originalname: file.originalname || "avatar.png",
        mimetype: file.mimetype,
      },
      "avatars",
    );

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: uploadResult.url },
    });

    await this.logAudit(
      userId,
      "profile updated (avatar)",
      "User",
      userId,
      req,
    );

    return {
      avatarUrl: uploadResult.url,
      provider: uploadResult.provider,
    };
  }

  async requestGdprExport(userId: string, req?: any) {
    await this.logAudit(
      userId,
      "GDPR export requested",
      "GdprExport",
      userId,
      req,
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

    const exportRecord = await this.prisma.gdprExport.create({
      data: {
        userId,
        status: "PROCESSING",
        expiresAt,
      },
    });

    // Trigger async background export worker
    this.processGdprExportAsync(userId, exportRecord.id).catch((err) =>
      this.logger.error(
        `GDPR Export async processing failed for export ${exportRecord.id}`,
        err,
      ),
    );

    return {
      exportId: exportRecord.id,
      status: "PROCESSING",
      message:
        "GDPR data export requested. You will receive an email once your archive is ready.",
    };
  }

  private async processGdprExportAsync(userId: string, exportId: string) {
    this.logger.log(
      `⏳ [GDPR Export Worker] Starting data compilation for User ${userId}`,
    );
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          role: true,
          wallet: true,
          settings: true,
          pickupRequests: true,
          userRewards: true,
          notifications: true,
          transactions: true,
        },
      });

      if (!user) return;

      const { passwordHash, ...cleanData } = user;
      const jsonContent = JSON.stringify(cleanData, null, 2);

      // Simulate cloud archive storage
      const fileUrl = `http://localhost:3000/exports/${exportId}-${Date.now()}.json`;

      await this.prisma.gdprExport.update({
        where: { id: exportId },
        data: {
          status: "COMPLETED",
          fileUrl,
        },
      });

      this.logger.log(
        `✅ [GDPR Export Worker] Compiled ${jsonContent.length} bytes for User ${userId}. Archive ready at: ${fileUrl}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ [GDPR Export Worker] Error generating archive for ${exportId}`,
        error,
      );
      await this.prisma.gdprExport.update({
        where: { id: exportId },
        data: { status: "FAILED" },
      });
    }
  }
}
