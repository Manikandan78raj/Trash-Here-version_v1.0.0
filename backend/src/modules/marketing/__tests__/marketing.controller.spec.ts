import { Test, TestingModule } from '@nestjs/testing';
import { MarketingController } from '../marketing.controller';
import { MarketingService } from '../services/marketing.service';

describe('MarketingController (TDD Suite)', () => {
  let controller: MarketingController;
  let service: MarketingService;

  const mockMarketingService = {
    submitContact: jest.fn(),
    subscribeNewsletter: jest.fn(),
    getBlogPosts: jest.fn(),
    getBlogPostBySlug: jest.fn(),
    createBlogPost: jest.fn(),
    getCareerJobs: jest.fn(),
    getCareerJobBySlug: jest.fn(),
    createCareerJob: jest.fn(),
    applyForJob: jest.fn(),
    getSeoMetadata: jest.fn(),
    upsertSeoMetadata: jest.fn(),
    trackAnalyticsEvent: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MarketingController],
      providers: [
        {
          provide: MarketingService,
          useValue: mockMarketingService,
        },
      ],
    }).compile();

    controller = module.get<MarketingController>(MarketingController);
    service = module.get<MarketingService>(MarketingService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call submitContact on service', async () => {
    mockMarketingService.submitContact.mockResolvedValue({ success: true, submissionId: 'sub-1' });
    const res = await controller.submitContact(
      { name: 'Test', email: 'test@co.com', subject: 'Sub', message: 'Msg' },
      '127.0.0.1'
    );
    expect(res.success).toBe(true);
    expect(mockMarketingService.submitContact).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'test@co.com' }),
      '127.0.0.1'
    );
  });

  it('should call subscribeNewsletter on service', async () => {
    mockMarketingService.subscribeNewsletter.mockResolvedValue({ success: true, subscriberId: 'sub-1' });
    const res = await controller.subscribeNewsletter({ email: 'test@co.com' });
    expect(res.success).toBe(true);
  });

  it('should call getBlogPosts on service', async () => {
    mockMarketingService.getBlogPosts.mockResolvedValue({ success: true, count: 2, data: [] });
    const res = await controller.getBlogPosts('AI', 'Routing');
    expect(res.count).toBe(2);
    expect(mockMarketingService.getBlogPosts).toHaveBeenCalledWith('AI', 'Routing');
  });

  it('should call getBlogPostBySlug on service', async () => {
    mockMarketingService.getBlogPostBySlug.mockResolvedValue({ success: true, data: { slug: 'test' } });
    const res = await controller.getBlogPostBySlug('test');
    expect(res.data.slug).toBe('test');
  });

  it('should call getCareerJobs on service', async () => {
    mockMarketingService.getCareerJobs.mockResolvedValue({ success: true, count: 1, data: [] });
    const res = await controller.getCareerJobs('Engineering');
    expect(res.count).toBe(1);
  });

  it('should call applyForJob on service', async () => {
    mockMarketingService.applyForJob.mockResolvedValue({ success: true, applicationId: 'app-1' });
    const res = await controller.applyForJob({
      jobId: 'job-1',
      fullName: 'Alex',
      email: 'alex@test.com',
      phone: '123456',
      resumeUrl: 'url',
    });
    expect(res.applicationId).toBe('app-1');
  });

  it('should call getSeoMetadata on service', async () => {
    mockMarketingService.getSeoMetadata.mockResolvedValue({ success: true, data: { title: 'SEO Title' } });
    const res = await controller.getSeoMetadata('/about');
    expect(res.data.title).toBe('SEO Title');
  });

  it('should call trackAnalyticsEvent on service', async () => {
    mockMarketingService.trackAnalyticsEvent.mockResolvedValue({ success: true, eventId: 'evt-1' });
    const res = await controller.trackAnalyticsEvent(
      { eventName: 'VIEW', route: '/' },
      '127.0.0.1',
      'Mozilla/5.0'
    );
    expect(res.eventId).toBe('evt-1');
  });
});
