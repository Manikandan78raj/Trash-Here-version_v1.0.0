import { Injectable, NotFoundException, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import {
  SubmitContactDto,
  SubscribeNewsletterDto,
  CreateBlogPostDto,
  CreateCareerJobDto,
  ApplyCareerDto,
  UpsertSeoMetadataDto,
  TrackAnalyticsEventDto,
} from '../dto/marketing.dto';

@Injectable()
export class MarketingService {
  private readonly spamKeywords = [
    'viagra',
    'crypto casino',
    'buy bitcoin',
    'free money',
    'http://spam.ru',
    'prince of nigeria',
  ];

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 1. Submit Contact Inquiry with Rate Limiting & Spam Protection
   */
  async submitContact(dto: SubmitContactDto, ipAddress: string = '127.0.0.1') {
    // A. Rate Limiting Check: Max 5 submissions per IP in the last 60 seconds
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const recentCount = await this.prisma.contactSubmission.count({
      where: {
        ipAddress,
        createdAt: { gte: oneMinuteAgo },
      },
    });

    if (recentCount >= 5) {
      throw new HttpException(
        'Rate limit exceeded. Please wait 60 seconds before submitting another inquiry.',
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    // B. Spam Keyword Detection
    const combinedText = `${dto.subject} ${dto.message}`.toLowerCase();
    const isSpam = this.spamKeywords.some((kw) => combinedText.includes(kw));

    // C. Create Submission Record
    const submission = await this.prisma.contactSubmission.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        company: dto.company,
        subject: dto.subject,
        message: dto.message,
        ipAddress,
        status: isSpam ? 'SPAM' : 'PENDING',
      },
    });

    // D. Simulate Email Queueing for legitimate inquiries
    if (!isSpam) {
      // In production, this pushes to BullMQ or AWS SQS for SendGrid / Postmark processing
    }

    return {
      success: true,
      submissionId: submission.id,
      status: submission.status,
      message: isSpam
        ? 'Inquiry flagged for administrative review.'
        : 'Thank you! Your inquiry has been received and routed to our enterprise team.',
    };
  }

  /**
   * 2. Subscribe to Newsletter with Deduplication
   */
  async subscribeNewsletter(dto: SubscribeNewsletterDto) {
    const existing = await this.prisma.newsletterSubscriber.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      if (!existing.isActive) {
        const reactivated = await this.prisma.newsletterSubscriber.update({
          where: { id: existing.id },
          data: { isActive: true, source: dto.source || existing.source },
        });
        return {
          success: true,
          subscriberId: reactivated.id,
          message: 'Welcome back! Your subscription has been reactivated.',
        };
      }
      return {
        success: true,
        subscriberId: existing.id,
        message: 'You are already subscribed to the Trash Here newsletter.',
      };
    }

    const subscriber = await this.prisma.newsletterSubscriber.create({
      data: {
        email: dto.email,
        source: dto.source || 'landing_footer',
        isActive: true,
      },
    });

    return {
      success: true,
      subscriberId: subscriber.id,
      message: 'Successfully subscribed to Trash Here climate & tech insights!',
    };
  }

  /**
   * 3. Get Published Blog Posts with Optional Filtering
   */
  async getBlogPosts(category?: string, tag?: string) {
    const whereClause: any = { isPublished: true };
    if (category && category !== 'ALL') {
      whereClause.category = category;
    }
    if (tag) {
      whereClause.tags = { has: tag };
    }

    const posts = await this.prisma.blogPost.findMany({
      where: whereClause,
      orderBy: { publishedAt: 'desc' },
    });

    return {
      success: true,
      count: posts.length,
      data: posts,
    };
  }

  /**
   * 4. Get Blog Post by Slug
   */
  async getBlogPostBySlug(slug: string) {
    const post = await this.prisma.blogPost.findFirst({
      where: { slug, isPublished: true },
    });

    if (!post) {
      throw new NotFoundException(`Blog post with slug "${slug}" not found.`);
    }

    return {
      success: true,
      data: post,
    };
  }

  /**
   * 5. Create Blog Post (Admin / Editorial)
   */
  async createBlogPost(dto: CreateBlogPostDto) {
    const existing = await this.prisma.blogPost.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new BadRequestException(`A blog post with slug "${dto.slug}" already exists.`);
    }

    const post = await this.prisma.blogPost.create({
      data: {
        slug: dto.slug,
        title: dto.title,
        excerpt: dto.excerpt,
        content: dto.content,
        authorName: dto.authorName,
        authorRole: dto.authorRole,
        authorAvatar: dto.authorAvatar,
        category: dto.category,
        coverImage: dto.coverImage,
        readTimeMinutes: dto.readTimeMinutes || 5,
        tags: dto.tags || [],
        seoTitle: dto.seoTitle || `${dto.title} | Trash Here Blog`,
        seoDescription: dto.seoDescription || dto.excerpt,
        isPublished: true,
      },
    });

    return {
      success: true,
      data: post,
    };
  }

  /**
   * 6. Get Career Openings
   */
  async getCareerJobs(department?: string) {
    const whereClause: any = { isPublished: true };
    if (department && department !== 'ALL') {
      whereClause.department = department;
    }

    const jobs = await this.prisma.careerJob.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      count: jobs.length,
      data: jobs,
    };
  }

  /**
   * 7. Get Career Job by Slug
   */
  async getCareerJobBySlug(slug: string) {
    const job = await this.prisma.careerJob.findFirst({
      where: { slug, isPublished: true },
    });

    if (!job) {
      throw new NotFoundException(`Job opening with slug "${slug}" not found.`);
    }

    return {
      success: true,
      data: job,
    };
  }

  /**
   * 8. Create Career Job (HR Admin)
   */
  async createCareerJob(dto: CreateCareerJobDto) {
    const existing = await this.prisma.careerJob.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new BadRequestException(`A job opening with slug "${dto.slug}" already exists.`);
    }

    const job = await this.prisma.careerJob.create({
      data: {
        slug: dto.slug,
        title: dto.title,
        department: dto.department,
        location: dto.location,
        employmentType: dto.employmentType || 'Full-time',
        workplaceType: (dto.workplaceType as any) || 'REMOTE',
        salaryRange: dto.salaryRange,
        description: dto.description,
        requirements: dto.requirements,
        isPublished: true,
      },
    });

    return {
      success: true,
      data: job,
    };
  }

  /**
   * 9. Submit Job Application
   */
  async applyForJob(dto: ApplyCareerDto) {
    const job = await this.prisma.careerJob.findUnique({
      where: { id: dto.jobId },
    });

    if (!job || !job.isPublished) {
      throw new NotFoundException(`Job opening with ID "${dto.jobId}" is not active.`);
    }

    const existingApplication = await this.prisma.careerApplication.findFirst({
      where: {
        jobId: dto.jobId,
        email: dto.email,
      },
    });

    if (existingApplication) {
      throw new BadRequestException('You have already submitted an application for this position.');
    }

    const application = await this.prisma.careerApplication.create({
      data: {
        jobId: dto.jobId,
        fullName: dto.fullName,
        email: dto.email,
        phone: dto.phone,
        resumeUrl: dto.resumeUrl,
        coverLetter: dto.coverLetter,
        linkedinUrl: dto.linkedinUrl,
        portfolioUrl: dto.portfolioUrl,
        status: 'SUBMITTED',
      },
    });

    return {
      success: true,
      applicationId: application.id,
      message: 'Your application has been received by our Talent & Recruiting team!',
    };
  }

  /**
   * 10. Get SEO Metadata by Route
   */
  async getSeoMetadata(route: string) {
    const metadata = await this.prisma.seoMetadata.findUnique({
      where: { route },
    });

    if (!metadata) {
      return {
        success: true,
        data: {
          route,
          title: 'Trash Here — Venture-Scale Smart Waste Logistics & Climate Infrastructure',
          description: 'AI-powered weighbridge telemetry, algorithmic polyline fleet routing, and SHA-256 ESG manifests for households, collectors, and enterprise recyclers.',
          canonicalUrl: `https://trashhere.com${route === '/' ? '' : route}`,
          ogImage: 'https://trashhere.com/assets/og-default.jpg',
          ogType: 'website',
          twitterCard: 'summary_large_image',
          keywords: 'smart waste, climate tech, recycler portal, carbon offset, fleet routing',
          jsonLdSchema: null,
        },
      };
    }

    return {
      success: true,
      data: metadata,
    };
  }

  /**
   * 11. Upsert SEO Metadata (SEO Specialist Admin)
   */
  async upsertSeoMetadata(dto: UpsertSeoMetadataDto) {
    const metadata = await this.prisma.seoMetadata.upsert({
      where: { route: dto.route },
      update: {
        title: dto.title,
        description: dto.description,
        canonicalUrl: dto.canonicalUrl,
        ogImage: dto.ogImage,
        ogType: dto.ogType || 'website',
        twitterCard: dto.twitterCard || 'summary_large_image',
        keywords: dto.keywords,
        jsonLdSchema: dto.jsonLdSchema,
      },
      create: {
        route: dto.route,
        title: dto.title,
        description: dto.description,
        canonicalUrl: dto.canonicalUrl,
        ogImage: dto.ogImage,
        ogType: dto.ogType || 'website',
        twitterCard: dto.twitterCard || 'summary_large_image',
        keywords: dto.keywords,
        jsonLdSchema: dto.jsonLdSchema,
      },
    });

    return {
      success: true,
      data: metadata,
    };
  }

  /**
   * 12. Track Public Analytics Event
   */
  async trackAnalyticsEvent(dto: TrackAnalyticsEventDto, ipAddress: string = '127.0.0.1', userAgent?: string) {
    const event = await this.prisma.publicAnalyticsEvent.create({
      data: {
        eventName: dto.eventName,
        route: dto.route,
        visitorId: dto.visitorId,
        sessionId: dto.sessionId,
        referrer: dto.referrer,
        userAgent,
        ipAddress,
        metadata: dto.metadata,
      },
    });

    return {
      success: true,
      eventId: event.id,
    };
  }
}
