import { Test, TestingModule } from "@nestjs/testing";
import { MarketingService } from "../services/marketing.service";
import { PrismaService } from "../../../common/prisma/prisma.service";
import {
  NotFoundException,
  BadRequestException,
  HttpException,
  HttpStatus,
} from "@nestjs/common";

describe("MarketingService (TDD Suite)", () => {
  let service: MarketingService;
  let prisma: PrismaService;

  const mockPrismaService = {
    contactSubmission: {
      count: jest.fn(),
      create: jest.fn(),
    },
    newsletterSubscriber: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    blogPost: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    careerJob: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    careerApplication: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    seoMetadata: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    publicAnalyticsEvent: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarketingService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<MarketingService>(MarketingService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe("submitContact", () => {
    const contactDto = {
      name: "Jane Doe",
      email: "jane@enterprise.com",
      subject: "Inquiry",
      message: "Hello, we want to integrate with Trash Here.",
    };

    it("should successfully create a contact submission when under rate limit", async () => {
      mockPrismaService.contactSubmission.count.mockResolvedValue(2);
      mockPrismaService.contactSubmission.create.mockResolvedValue({
        id: "sub-101",
        ...contactDto,
        status: "PENDING",
      });

      const res = await service.submitContact(contactDto, "192.168.1.100");
      expect(res.success).toBe(true);
      expect(res.status).toBe("PENDING");
      expect(mockPrismaService.contactSubmission.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: "PENDING",
          ipAddress: "192.168.1.100",
        }),
      });
    });

    it("should flag submission as SPAM when containing spam keywords", async () => {
      mockPrismaService.contactSubmission.count.mockResolvedValue(0);
      mockPrismaService.contactSubmission.create.mockResolvedValue({
        id: "sub-spam-1",
        ...contactDto,
        message: "Buy bitcoin and viagra here!",
        status: "SPAM",
      });

      const spamDto = {
        ...contactDto,
        message: "Buy bitcoin and viagra here!",
      };
      const res = await service.submitContact(spamDto, "192.168.1.101");
      expect(res.success).toBe(true);
      expect(res.status).toBe("SPAM");
      expect(mockPrismaService.contactSubmission.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ status: "SPAM" }),
      });
    });

    it("should throw 429 Too Many Requests when IP exceeded 5 submissions in last minute", async () => {
      mockPrismaService.contactSubmission.count.mockResolvedValue(5);
      await expect(
        service.submitContact(contactDto, "192.168.1.100"),
      ).rejects.toThrow(HttpException);
    });
  });

  describe("subscribeNewsletter", () => {
    it("should create new subscriber when email does not exist", async () => {
      mockPrismaService.newsletterSubscriber.findUnique.mockResolvedValue(null);
      mockPrismaService.newsletterSubscriber.create.mockResolvedValue({
        id: "sub-001",
        email: "test@eco.org",
        isActive: true,
      });

      const res = await service.subscribeNewsletter({ email: "test@eco.org" });
      expect(res.success).toBe(true);
      expect(res.message).toContain("Successfully subscribed");
    });

    it("should return already subscribed message when email exists and is active", async () => {
      mockPrismaService.newsletterSubscriber.findUnique.mockResolvedValue({
        id: "sub-001",
        email: "test@eco.org",
        isActive: true,
      });

      const res = await service.subscribeNewsletter({ email: "test@eco.org" });
      expect(res.success).toBe(true);
      expect(res.message).toContain("already subscribed");
    });

    it("should reactivate subscription when email exists and is inactive", async () => {
      mockPrismaService.newsletterSubscriber.findUnique.mockResolvedValue({
        id: "sub-001",
        email: "test@eco.org",
        isActive: false,
      });
      mockPrismaService.newsletterSubscriber.update.mockResolvedValue({
        id: "sub-001",
        email: "test@eco.org",
        isActive: true,
      });

      const res = await service.subscribeNewsletter({ email: "test@eco.org" });
      expect(res.success).toBe(true);
      expect(res.message).toContain("reactivated");
    });
  });

  describe("getBlogPosts & getBlogPostBySlug", () => {
    it("should return blog posts filtered by category", async () => {
      mockPrismaService.blogPost.findMany.mockResolvedValue([
        { id: "post-1", title: "AI Routing" },
      ]);
      const res = await service.getBlogPosts("Engineering");
      expect(res.success).toBe(true);
      expect(res.count).toBe(1);
      expect(mockPrismaService.blogPost.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isPublished: true, category: "Engineering" },
        }),
      );
    });

    it("should return post by slug", async () => {
      mockPrismaService.blogPost.findFirst.mockResolvedValue({
        id: "post-1",
        slug: "ai-routing",
      });
      const res = await service.getBlogPostBySlug("ai-routing");
      expect(res.success).toBe(true);
      expect(res.data.slug).toBe("ai-routing");
    });

    it("should throw NotFoundException if slug not found", async () => {
      mockPrismaService.blogPost.findFirst.mockResolvedValue(null);
      await expect(service.getBlogPostBySlug("non-existent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("createBlogPost", () => {
    it("should create blog post successfully", async () => {
      mockPrismaService.blogPost.findUnique.mockResolvedValue(null);
      mockPrismaService.blogPost.create.mockResolvedValue({
        id: "post-1",
        slug: "new-post",
      });

      const res = await service.createBlogPost({
        slug: "new-post",
        title: "New Post",
        excerpt: "Excerpt",
        content: "Content",
        authorName: "Author",
        authorRole: "Role",
        category: "Tech",
      });
      expect(res.success).toBe(true);
    });

    it("should throw BadRequestException if slug exists", async () => {
      mockPrismaService.blogPost.findUnique.mockResolvedValue({ id: "post-1" });
      await expect(
        service.createBlogPost({
          slug: "existing-slug",
          title: "Title",
          excerpt: "Excerpt",
          content: "Content",
          authorName: "Author",
          authorRole: "Role",
          category: "Tech",
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("Careers & Applications", () => {
    it("should return career jobs", async () => {
      mockPrismaService.careerJob.findMany.mockResolvedValue([
        { id: "job-1", title: "Rust Engineer" },
      ]);
      const res = await service.getCareerJobs();
      expect(res.success).toBe(true);
      expect(res.count).toBe(1);
    });

    it("should submit job application successfully", async () => {
      mockPrismaService.careerJob.findUnique.mockResolvedValue({
        id: "job-1",
        isPublished: true,
      });
      mockPrismaService.careerApplication.findFirst.mockResolvedValue(null);
      mockPrismaService.careerApplication.create.mockResolvedValue({
        id: "app-101",
      });

      const res = await service.applyForJob({
        jobId: "job-1",
        fullName: "Alex",
        email: "alex@test.com",
        phone: "1234567890",
        resumeUrl: "https://resume.pdf",
      });

      expect(res.success).toBe(true);
      expect(res.applicationId).toBe("app-101");
    });

    it("should throw BadRequestException if duplicate application exists", async () => {
      mockPrismaService.careerJob.findUnique.mockResolvedValue({
        id: "job-1",
        isPublished: true,
      });
      mockPrismaService.careerApplication.findFirst.mockResolvedValue({
        id: "app-existing",
      });

      await expect(
        service.applyForJob({
          jobId: "job-1",
          fullName: "Alex",
          email: "alex@test.com",
          phone: "1234567890",
          resumeUrl: "https://resume.pdf",
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("SEO Metadata & Analytics", () => {
    it("should return SEO metadata or fallback if not found", async () => {
      mockPrismaService.seoMetadata.findUnique.mockResolvedValue(null);
      const res = await service.getSeoMetadata("/custom-route");
      expect(res.success).toBe(true);
      expect(res.data.canonicalUrl).toContain("/custom-route");
    });

    it("should track analytics event", async () => {
      mockPrismaService.publicAnalyticsEvent.create.mockResolvedValue({
        id: "evt-1",
      });
      const res = await service.trackAnalyticsEvent(
        { eventName: "VIEW", route: "/" },
        "127.0.0.1",
      );
      expect(res.success).toBe(true);
      expect(res.eventId).toBe("evt-1");
    });
  });
});
