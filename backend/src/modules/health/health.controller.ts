import { Controller, Get } from "@nestjs/common";
import {
  HealthCheckService,
  HealthCheck,
  PrismaHealthIndicator,
  MemoryHealthIndicator,
} from "@nestjs/terminus";
import { PrismaService } from "../../common/prisma/prisma.service";
import { ApiTags, ApiOperation } from "@nestjs/swagger";

@ApiTags("Health & Readiness")
@Controller("health")
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
    private memory: MemoryHealthIndicator,
    private prisma: PrismaService,
  ) {}

  @Get("liveness")
  @ApiOperation({
    summary: "Liveness probe for Kubernetes / Docker health checks",
  })
  @HealthCheck()
  checkLiveness() {
    return this.health.check([
      () => this.memory.checkHeap("memory_heap", 300 * 1024 * 1024),
      () => this.memory.checkRSS("memory_rss", 500 * 1024 * 1024),
    ]);
  }

  @Get("readiness")
  @ApiOperation({
    summary: "Readiness probe verifying PostgreSQL connectivity and memory",
  })
  @HealthCheck()
  checkReadiness() {
    return this.health.check([
      () => this.prismaHealth.pingCheck("database", this.prisma),
      () => this.memory.checkHeap("memory_heap", 300 * 1024 * 1024),
    ]);
  }
}
