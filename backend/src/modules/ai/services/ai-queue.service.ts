import { Injectable, Logger } from '@nestjs/common';
import { AiJobStatus } from '@prisma/client';
import {
  IAiQueueProvider,
  AiQueueJobPayload,
  AiQueueJobOptions,
} from '../interfaces/ai.interface';

interface StoredJob {
  id: string;
  name: string;
  data: AiQueueJobPayload;
  options: AiQueueJobOptions;
  status: AiJobStatus;
  attemptsMade: number;
}

@Injectable()
export class AiQueueService implements IAiQueueProvider {
  private readonly logger = new Logger(AiQueueService.name);
  private readonly jobs = new Map<string, StoredJob>();
  private consumerHandler?: (job: {
    id: string;
    data: AiQueueJobPayload;
  }) => Promise<void>;

  private metrics = {
    waiting: 0,
    active: 0,
    completed: 0,
    failed: 0,
    dlqCount: 0,
  };

  async addJob(
    jobName: string,
    payload: AiQueueJobPayload,
    options: AiQueueJobOptions = { attempts: 3 },
  ): Promise<string> {
    const jobId = payload.jobId || `job-bullmq-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    
    const storedJob: StoredJob = {
      id: jobId,
      name: jobName,
      data: { ...payload, jobId },
      options,
      status: AiJobStatus.QUEUED,
      attemptsMade: 0,
    };

    this.jobs.set(jobId, storedJob);
    this.metrics.waiting++;

    this.logger.debug(`[AiQueueService] Enqueued job ${jobId} (${jobName})`);

    // Asynchronously trigger processing if a handler is already listening
    if (this.consumerHandler) {
      setTimeout(() => this.executeJob(jobId), 10);
    }

    return jobId;
  }

  processJobs(
    handler: (job: { id: string; data: AiQueueJobPayload }) => Promise<void>,
  ): void {
    this.logger.log(`[AiQueueService] Registered BullMQ worker consumer handler.`);
    this.consumerHandler = handler;

    // Process any jobs currently waiting in queue
    for (const [jobId, job] of this.jobs.entries()) {
      if (job.status === AiJobStatus.QUEUED) {
        setTimeout(() => this.executeJob(jobId), 10);
      }
    }
  }

  private async executeJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job || !this.consumerHandler) return;

    if (job.status === AiJobStatus.QUEUED) {
      this.metrics.waiting = Math.max(0, this.metrics.waiting - 1);
    }

    job.status = AiJobStatus.PROCESSING;
    this.metrics.active++;
    job.attemptsMade++;

    try {
      await this.consumerHandler({ id: job.id, data: job.data });
      job.status = AiJobStatus.COMPLETED;
      this.metrics.active = Math.max(0, this.metrics.active - 1);
      this.metrics.completed++;
    } catch (error: any) {
      this.logger.error(`[AiQueueService] Job ${jobId} failed attempt ${job.attemptsMade}: ${error?.message}`);
      
      const maxAttempts = job.options.attempts || 1;
      if (job.attemptsMade < maxAttempts) {
        // Schedule retry with backoff
        job.status = AiJobStatus.QUEUED;
        this.metrics.active = Math.max(0, this.metrics.active - 1);
        this.metrics.waiting++;
        const delay = job.options.backoff?.delay || 50;
        setTimeout(() => this.executeJob(jobId), delay);
      } else {
        job.status = AiJobStatus.FAILED;
        this.metrics.active = Math.max(0, this.metrics.active - 1);
        this.metrics.failed++;
        this.metrics.dlqCount++; // Moved to Dead Letter Queue
        this.logger.warn(`[AiQueueService] Job ${jobId} exhausted all ${maxAttempts} attempts. Moved to DLQ.`);
      }
    }
  }

  async getJobStatus(jobId: string): Promise<AiJobStatus> {
    const job = this.jobs.get(jobId);
    return job ? job.status : AiJobStatus.QUEUED;
  }

  async getQueueMetrics(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    dlqCount: number;
  }> {
    return { ...this.metrics };
  }
}
