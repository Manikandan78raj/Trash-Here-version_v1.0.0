import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Ip,
  Headers,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";
import { MarketingService } from "./services/marketing.service";
import {
  SubmitContactDto,
  SubscribeNewsletterDto,
  CreateBlogPostDto,
  CreateCareerJobDto,
  ApplyCareerDto,
  UpsertSeoMetadataDto,
  TrackAnalyticsEventDto,
} from "./dto/marketing.dto";

@ApiTags("Public & Marketing SEO Hub")
@Controller("api/v1/public")
export class MarketingController {
  constructor(private readonly marketingService: MarketingService) {}

  @Post("contact")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary:
      "Submit public contact inquiry with spam detection and rate limiting",
  })
  @ApiResponse({
    status: 201,
    description: "Inquiry received and routed to enterprise team",
  })
  @ApiResponse({
    status: 429,
    description: "Rate limit exceeded (max 5 per minute per IP)",
  })
  async submitContact(@Body() dto: SubmitContactDto, @Ip() ipAddress: string) {
    return this.marketingService.submitContact(dto, ipAddress || "127.0.0.1");
  }

  @Post("newsletter")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Subscribe email to marketing newsletter with deduplication",
  })
  @ApiResponse({
    status: 200,
    description: "Successfully subscribed or reactivated",
  })
  async subscribeNewsletter(@Body() dto: SubscribeNewsletterDto) {
    return this.marketingService.subscribeNewsletter(dto);
  }

  @Get("blog")
  @ApiOperation({
    summary: "Get published blog posts with optional category or tag filter",
  })
  @ApiQuery({ name: "category", required: false, example: "Engineering & AI" })
  @ApiQuery({ name: "tag", required: false, example: "Logistics" })
  async getBlogPosts(
    @Query("category") category?: string,
    @Query("tag") tag?: string,
  ) {
    return this.marketingService.getBlogPosts(category, tag);
  }

  @Get("blog/:slug")
  @ApiOperation({ summary: "Get published blog post details by URL slug" })
  @ApiResponse({ status: 200, description: "Blog post details returned" })
  @ApiResponse({ status: 404, description: "Blog post not found" })
  async getBlogPostBySlug(@Param("slug") slug: string) {
    return this.marketingService.getBlogPostBySlug(slug);
  }

  @Post("blog")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new blog post for programmatic SEO" })
  async createBlogPost(@Body() dto: CreateBlogPostDto) {
    return this.marketingService.createBlogPost(dto);
  }

  @Get("careers")
  @ApiOperation({
    summary: "Get active job openings with optional department filter",
  })
  @ApiQuery({ name: "department", required: false, example: "Engineering" })
  async getCareerJobs(@Query("department") department?: string) {
    return this.marketingService.getCareerJobs(department);
  }

  @Get("careers/:slug")
  @ApiOperation({ summary: "Get job opening details by URL slug" })
  @ApiResponse({ status: 200, description: "Job details returned" })
  @ApiResponse({ status: 404, description: "Job opening not found" })
  async getCareerJobBySlug(@Param("slug") slug: string) {
    return this.marketingService.getCareerJobBySlug(slug);
  }

  @Post("careers/jobs")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new career job posting" })
  async createCareerJob(@Body() dto: CreateCareerJobDto) {
    return this.marketingService.createCareerJob(dto);
  }

  @Post("careers/apply")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Submit job application and resume for an active posting",
  })
  @ApiResponse({
    status: 201,
    description: "Application submitted successfully",
  })
  @ApiResponse({ status: 400, description: "Duplicate application detected" })
  async applyForJob(@Body() dto: ApplyCareerDto) {
    return this.marketingService.applyForJob(dto);
  }

  @Get("seo/metadata")
  @ApiOperation({
    summary: "Get route-specific SEO metadata and JSON-LD schema",
  })
  @ApiQuery({ name: "route", required: true, example: "/eco-calculator" })
  async getSeoMetadata(@Query("route") route: string) {
    return this.marketingService.getSeoMetadata(route || "/");
  }

  @Post("seo/metadata")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Upsert SEO metadata overrides for a route" })
  async upsertSeoMetadata(@Body() dto: UpsertSeoMetadataDto) {
    return this.marketingService.upsertSeoMetadata(dto);
  }

  @Post("analytics/event")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Track public pageview or interaction telemetry event",
  })
  async trackAnalyticsEvent(
    @Body() dto: TrackAnalyticsEventDto,
    @Ip() ipAddress: string,
    @Headers("user-agent") userAgent?: string,
  ) {
    return this.marketingService.trackAnalyticsEvent(
      dto,
      ipAddress || "127.0.0.1",
      userAgent,
    );
  }
}
