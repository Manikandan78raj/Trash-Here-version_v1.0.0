import { Module } from "@nestjs/common";
import { PrismaModule } from "../../common/prisma/prisma.module";
import { RecyclerController } from "./recycler.controller";
import { RecyclerIntakeService } from "./services/recycler-intake.service";
import { RecyclerInventoryService } from "./services/recycler-inventory.service";
import { RecyclerProcessingService } from "./services/recycler-processing.service";
import { RecyclerEsgService } from "./services/recycler-esg.service";
import { MockDigitalScaleProvider } from "./providers/mock-digital-scale.provider";
import { MockPdfGeneratorProvider } from "./providers/mock-pdf-generator.provider";
import { GhgProtocolEsgProvider } from "./providers/ghg-protocol-esg.provider";

@Module({
  imports: [PrismaModule],
  controllers: [RecyclerController],
  providers: [
    RecyclerIntakeService,
    RecyclerInventoryService,
    RecyclerProcessingService,
    RecyclerEsgService,
    MockDigitalScaleProvider,
    MockPdfGeneratorProvider,
    GhgProtocolEsgProvider,
  ],
  exports: [
    RecyclerIntakeService,
    RecyclerInventoryService,
    RecyclerProcessingService,
    RecyclerEsgService,
    MockDigitalScaleProvider,
    MockPdfGeneratorProvider,
    GhgProtocolEsgProvider,
  ],
})
export class RecyclerModule {}
