import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { AssignRoleDto } from '../dto/admin.dto';
import { RoleType } from '@prisma/client';

@Injectable()
export class AdminRbacService {
  constructor(private readonly prisma: PrismaService) {}

  async assignRole(dto: AssignRoleDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${dto.userId} not found`);
    }

    let role = await this.prisma.role.findUnique({
      where: { name: dto.roleType },
    });

    if (!role) {
      role = await this.prisma.role.create({
        data: {
          name: dto.roleType,
          description: `Enterprise ${dto.roleType} role`,
          permissions: dto.permissions || [],
        },
      });
    }

    return this.prisma.user.update({
      where: { id: dto.userId },
      data: { roleId: role.id },
      include: { role: true },
    });
  }

  async checkPermission(userId: string, requiredScope: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user || !user.role) {
      return false;
    }

    if (user.role.name === RoleType.SUPER_ADMIN || user.role.permissions.includes('*')) {
      return true;
    }

    return user.role.permissions.includes(requiredScope);
  }

  async getUsersByRole(roleType: RoleType) {
    return this.prisma.user.findMany({
      where: { role: { name: roleType } },
      include: { role: true },
    });
  }
}
