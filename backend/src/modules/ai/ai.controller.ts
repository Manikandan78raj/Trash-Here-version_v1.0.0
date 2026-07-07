import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AiEngineService } from './services/ai-engine.service';
import {
  UploadUrlRequestDto,
  UploadUrlResponseDto,
  AnalyzeWasteDto,
  AiJobStatusDto,
  AiPredictionResponseDto,
  ModelHealthDto,
} from './dto/ai.dto';

@ApiTags('AI Waste Detection & Contamination Engine')
@Controller('ai')
export class AiController {
  constructor(private readonly aiEngineService: AiEngineService) {}

  @ApiOperation({
    summary: 'Request presigned S3/R2 upload URL for direct image upload',
  })
  @ApiResponse({ status: 200, type: UploadUrlResponseDto })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Post('upload-url')
  @HttpCode(HttpStatus.OK)
  async requestUploadUrl(
    @Req() req: any,
    @Body() dto: UploadUrlRequestDto,
  ): Promise<UploadUrlResponseDto> {
    const userId = req.user?.userId || req.user?.id || 'anonymous';
    return this.aiEngineService.createUploadUrl(userId, dto);
  }

  @ApiOperation({
    summary: 'Submit uploaded waste image for asynchronous computer vision analysis',
  })
  @ApiResponse({ status: 202, description: 'Job accepted into BullMQ queue' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Post('analyze')
  @HttpCode(HttpStatus.ACCEPTED)
  async analyzeWaste(@Req() req: any, @Body() dto: AnalyzeWasteDto) {
    const userId = req.user?.userId || req.user?.id || 'anonymous';
    return this.aiEngineService.submitForAnalysis(userId, dto);
  }

  @ApiOperation({ summary: 'Get status and telemetry of an asynchronous AI job' })
  @ApiResponse({ status: 200, type: AiJobStatusDto })
  @Get('jobs/:jobId')
  async getJobStatus(@Param('jobId') jobId: string): Promise<AiJobStatusDto> {
    return this.aiEngineService.getJobStatus(jobId);
  }

  @ApiOperation({
    summary: 'Retrieve completed AI prediction with bounding boxes and carbon savings',
  })
  @ApiResponse({ status: 200, type: AiPredictionResponseDto })
  @Get('predictions/:jobId')
  async getPrediction(
    @Param('jobId') jobId: string,
  ): Promise<AiPredictionResponseDto> {
    return this.aiEngineService.getPredictionByJobId(jobId);
  }

  @ApiOperation({ summary: 'Get health and latency metrics across all vision models' })
  @ApiResponse({ status: 200, type: [ModelHealthDto] })
  @Get('models/health')
  async getModelsHealth(): Promise<ModelHealthDto[]> {
    return this.aiEngineService.getModelHealth();
  }
}
