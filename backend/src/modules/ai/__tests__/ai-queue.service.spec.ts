import { Test, TestingModule } from '@nestjs/testing';
import { AiJobStatus, AiModelType } from '@prisma/client';
import { AiQueueService } from '../services/ai-queue.service';
import { AiQueueJobPayload } from '../interfaces/ai.interface';

describe('AiQueueService (TDD)', () => {
  let service: AiQueueService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AiQueueService],
    }).compile();

    service = module.get<AiQueueService>(AiQueueService);
  });

  describe('Job Enqueueing & Metrics', () => {
    it('should enqueue a job and return a unique job ID', async () => {
      const payload: AiQueueJobPayload = {
        jobId: 'job-test-1',
        imageId: 'img-1',
        storageKey: 'waste/test.jpg',
        sha256Hash:
          'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        modelType: AiModelType.YOLO_V8,
        userId: 'user-1',
      };

      const jobId = await service.addJob('analyze-waste', payload);
      expect(jobId).toBeDefined();
      expect(typeof jobId).toBe('string');

      const status = await service.getJobStatus(jobId);
      expect(status).toBe(AiJobStatus.QUEUED);
    });

    it('should return queue metrics', async () => {
      const metrics = await service.getQueueMetrics();
      expect(metrics).toHaveProperty('waiting');
      expect(metrics).toHaveProperty('active');
      expect(metrics).toHaveProperty('completed');
      expect(metrics).toHaveProperty('failed');
      expect(metrics).toHaveProperty('dlqCount');
    });
  });

  describe('Worker Processing & Dead-Letter Queue (DLQ)', () => {
    it('should process queued jobs when a consumer handler is registered', async () => {
      let processedId: string | null = null;

      service.processJobs(async (job) => {
        processedId = job.id;
      });

      const payload: AiQueueJobPayload = {
        jobId: 'job-test-exec',
        imageId: 'img-2',
        storageKey: 'waste/test-exec.jpg',
        sha256Hash:
          'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        modelType: AiModelType.MOCK_VISION,
      };

      const jobId = await service.addJob('analyze-waste', payload);
      await new Promise((resolve) => setTimeout(resolve, 50)); // Allow async event loop to process

      expect(processedId).toBe(jobId);
      const status = await service.getJobStatus(jobId);
      expect(status).toBe(AiJobStatus.COMPLETED);
    });

    it('should retry failed jobs and move to DLQ after 3 failed attempts', async () => {
      let attemptCount = 0;

      service.processJobs(async () => {
        attemptCount++;
        throw new Error('Simulated inference server crash');
      });

      const payload: AiQueueJobPayload = {
        jobId: 'job-test-dlq',
        imageId: 'img-3',
        storageKey: 'waste/test-dlq.jpg',
        sha256Hash:
          'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        modelType: AiModelType.YOLO_V8,
      };

      const jobId = await service.addJob('analyze-waste', payload, {
        attempts: 3,
        backoff: { type: 'fixed', delay: 10 },
      });

      await new Promise((resolve) => setTimeout(resolve, 150)); // Allow retries

      expect(attemptCount).toBeGreaterThanOrEqual(3);
      const status = await service.getJobStatus(jobId);
      expect(status).toBe(AiJobStatus.FAILED);

      const metrics = await service.getQueueMetrics();
      expect(metrics.dlqCount).toBeGreaterThan(0);
    });
  });
});
