import { Module } from "@nestjs/common";
import { PrismaModule } from "../../common/prisma/prisma.module";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { AdminRbacService } from "./services/admin-rbac.service";
import { AdminFleetService } from "./services/admin-fleet.service";
import { AdminFinanceService } from "./services/admin-finance.service";
import { AdminAuditService } from "./services/admin-audit.service";
import { AdminImpersonationService } from "./services/admin-impersonation.service";
import { AdminConfigService } from "./services/admin-config.service";

@Module({
  imports: [PrismaModule],
  controllers: [AdminController],
  providers: [
    AdminService,
    AdminRbacService,
    AdminFleetService,
    AdminFinanceService,
    AdminAuditService,
    AdminImpersonationService,
    AdminConfigService,
  ],
  exports: [
    AdminService,
    AdminRbacService,
    AdminFleetService,
    AdminFinanceService,
    AdminAuditService,
    AdminImpersonationService,
    AdminConfigService,
  ],
})
export class AdminModule {}
