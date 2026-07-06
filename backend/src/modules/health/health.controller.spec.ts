import { Test, TestingModule } from "@nestjs/testing";
import { HealthController } from "./health.controller";
import {
  HealthCheckService,
  PrismaHealthIndicator,
  MemoryHealthIndicator,
} from "@nestjs/terminus";
import { PrismaService } from "../../common/prisma/prisma.service";

describe("HealthController", () => {
  let controller: HealthController;

  const mockHealthCheckService = {
    check: jest.fn().mockImplementation((indicators) =>
      Promise.all(indicators.map((ind: () => any) => ind())).then(
        (results) => ({
          status: "ok",
          info: Object.assign({}, ...results),
          error: {},
          details: Object.assign({}, ...results),
        }),
      ),
    ),
  };

  const mockPrismaHealthIndicator = {
    pingCheck: jest.fn().mockResolvedValue({ database: { status: "up" } }),
  };

  const mockMemoryHealthIndicator = {
    checkHeap: jest.fn().mockResolvedValue({ memory_heap: { status: "up" } }),
    checkRSS: jest.fn().mockResolvedValue({ memory_rss: { status: "up" } }),
  };

  const mockPrismaService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: HealthCheckService, useValue: mockHealthCheckService },
        { provide: PrismaHealthIndicator, useValue: mockPrismaHealthIndicator },
        { provide: MemoryHealthIndicator, useValue: mockMemoryHealthIndicator },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("checkLiveness", () => {
    it("should return liveness status", async () => {
      const result = await controller.checkLiveness();
      expect(result.status).toBe("ok");
    });
  });

  describe("checkReadiness", () => {
    it("should return readiness status", async () => {
      const result = await controller.checkReadiness();
      expect(result.status).toBe("ok");
    });
  });
});
