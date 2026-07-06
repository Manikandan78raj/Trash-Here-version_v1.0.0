import { IsString, IsEmail, IsOptional, IsArray, IsEnum, IsNumber, IsBoolean, Min, Max, IsUUID, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum JobWorkplaceTypeDto {
  REMOTE = 'REMOTE',
  HYBRID = 'HYBRID',
  ONSITE = 'ONSITE',
}

export class SubmitContactDto {
  @ApiProperty({ example: 'Jane Doe', description: 'Full name of the inquirer' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'jane@enterprise.com', description: 'Business or personal email address' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: '+1 (555) 019-2831', description: 'Phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'Acme Sustainability Corp', description: 'Company or organization name' })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiProperty({ example: 'B2B Recycler Integration Inquiry', description: 'Subject of inquiry' })
  @IsString()
  subject: string;

  @ApiProperty({ example: 'We would like to integrate our 50-ton weighbridge with the Trash Here SHA-256 manifest engine.', description: 'Detailed inquiry message' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ example: '192.168.1.1', description: 'Client IP address for rate limiting and spam check' })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiPropertyOptional({ example: 'landing_contact_modal', description: 'UI source triggering inquiry' })
  @IsOptional()
  @IsString()
  source?: string;
}

export class SubscribeNewsletterDto {
  @ApiProperty({ example: 'newsletter@eco-citizen.org', description: 'Subscriber email address' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: 'footer_signup', description: 'Source of subscription' })
  @IsOptional()
  @IsString()
  source?: string;
}

export class CreateBlogPostDto {
  @ApiProperty({ example: 'how-smart-routing-cuts-carbon', description: 'Unique URL slug' })
  @IsString()
  slug: string;

  @ApiProperty({ example: 'How Algorithmic Polyline Routing Cuts Fleet CO2 Emissions by 38%', description: 'Article title' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'A technical deep dive into Euclidean ETA scoring and dynamic geofenced pickup consolidation.', description: 'Short summary excerpt' })
  @IsString()
  excerpt: string;

  @ApiProperty({ example: '# The Mathematics of Waste Logistics\n\nTraditional waste collection...', description: 'Full markdown or HTML content' })
  @IsString()
  content: string;

  @ApiProperty({ example: 'Dr. Elena Rostova', description: 'Author name' })
  @IsString()
  authorName: string;

  @ApiProperty({ example: 'Chief Logistics Scientist', description: 'Author job title' })
  @IsString()
  authorRole: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-123.jpg', description: 'Author avatar URL' })
  @IsOptional()
  @IsString()
  authorAvatar?: string;

  @ApiProperty({ example: 'Engineering & AI', description: 'Blog category' })
  @IsString()
  category: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-456.jpg', description: 'Cover image URL' })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({ example: 6, description: 'Estimated read time in minutes' })
  @IsOptional()
  @IsNumber()
  readTimeMinutes?: number;

  @ApiPropertyOptional({ example: ['AI', 'Logistics', 'Carbon Offset', 'Route Optimization'], description: 'Tag array' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ example: 'Smart Waste Fleet Polyline Routing AI | Trash Here', description: 'Custom SEO title' })
  @IsOptional()
  @IsString()
  seoTitle?: string;

  @ApiPropertyOptional({ example: 'Learn how Trash Here uses AI polyline routing to reduce municipal waste collection CO2 emissions.', description: 'Custom SEO description' })
  @IsOptional()
  @IsString()
  seoDescription?: string;
}

export class CreateCareerJobDto {
  @ApiProperty({ example: 'senior-rust-systems-engineer', description: 'Unique job URL slug' })
  @IsString()
  slug: string;

  @ApiProperty({ example: 'Senior Rust & Systems Engineer', description: 'Job title' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Core Platform & Infrastructure', description: 'Department' })
  @IsString()
  department: string;

  @ApiProperty({ example: 'San Francisco, CA / Remote', description: 'Location' })
  @IsString()
  location: string;

  @ApiPropertyOptional({ example: 'Full-time', description: 'Employment type' })
  @IsOptional()
  @IsString()
  employmentType?: string;

  @ApiPropertyOptional({ enum: JobWorkplaceTypeDto, default: JobWorkplaceTypeDto.REMOTE })
  @IsOptional()
  @IsEnum(JobWorkplaceTypeDto)
  workplaceType?: JobWorkplaceTypeDto;

  @ApiPropertyOptional({ example: '$160,000 - $210,000 USD + Equity', description: 'Compensation range' })
  @IsOptional()
  @IsString()
  salaryRange?: string;

  @ApiProperty({ example: 'We are seeking an exceptional systems engineer to optimize our high-throughput dispatch engine...', description: 'Full job description' })
  @IsString()
  description: string;

  @ApiProperty({ example: ['5+ years Rust or C++', 'Experience with distributed consensus', 'Passion for climate tech'], description: 'Requirements array' })
  @IsArray()
  @IsString({ each: true })
  requirements: string[];
}

export class ApplyCareerDto {
  @ApiProperty({ example: 'job-uuid-101', description: 'Target job ID' })
  @IsString()
  jobId: string;

  @ApiProperty({ example: 'Alex Mercer', description: 'Applicant full name' })
  @IsString()
  fullName: string;

  @ApiProperty({ example: 'alex.mercer@dev.io', description: 'Applicant email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+1 (415) 890-1234', description: 'Applicant phone number' })
  @IsString()
  phone: string;

  @ApiProperty({ example: 'https://storage.trashhere.com/resumes/mercer_2026.pdf', description: 'Resume PDF URL' })
  @IsString()
  resumeUrl: string;

  @ApiPropertyOptional({ example: 'I have spent the last 4 years optimizing routing algorithms at Uber...', description: 'Cover letter text' })
  @IsOptional()
  @IsString()
  coverLetter?: string;

  @ApiPropertyOptional({ example: 'https://linkedin.com/in/alexmercer', description: 'LinkedIn URL' })
  @IsOptional()
  @IsString()
  linkedinUrl?: string;

  @ApiPropertyOptional({ example: 'https://github.com/alexmercer', description: 'Portfolio or GitHub URL' })
  @IsOptional()
  @IsString()
  portfolioUrl?: string;
}

export class UpsertSeoMetadataDto {
  @ApiProperty({ example: '/eco-calculator', description: 'Route path' })
  @IsString()
  route: string;

  @ApiProperty({ example: 'Eco Impact & Carbon Offset Calculator — Trash Here', description: 'SEO title tag' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Calculate your household or enterprise carbon offset, landfill diversion pounds, and equivalent trees planted in real time.', description: 'Meta description' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ example: 'https://trashhere.com/eco-calculator', description: 'Canonical URL' })
  @IsOptional()
  @IsString()
  canonicalUrl?: string;

  @ApiPropertyOptional({ example: 'https://trashhere.com/assets/og-calculator.jpg', description: 'OpenGraph image banner' })
  @IsOptional()
  @IsString()
  ogImage?: string;

  @ApiPropertyOptional({ example: 'website', description: 'OpenGraph type' })
  @IsOptional()
  @IsString()
  ogType?: string;

  @ApiPropertyOptional({ example: 'summary_large_image', description: 'Twitter card type' })
  @IsOptional()
  @IsString()
  twitterCard?: string;

  @ApiPropertyOptional({ example: 'carbon calculator, waste offset, climate tech, trash here', description: 'Comma separated keywords' })
  @IsOptional()
  @IsString()
  keywords?: string;

  @ApiPropertyOptional({ example: '{"@context":"https://schema.org","@type":"WebApplication","name":"Eco Calculator"}', description: 'Stringified JSON-LD schema' })
  @IsOptional()
  @IsString()
  jsonLdSchema?: string;
}

export class TrackAnalyticsEventDto {
  @ApiProperty({ example: 'CALCULATOR_ENGAGEMENT', description: 'Event name' })
  @IsString()
  eventName: string;

  @ApiProperty({ example: '/eco-calculator', description: 'Page route' })
  @IsString()
  route: string;

  @ApiPropertyOptional({ example: 'usr-visitor-8821', description: 'Anonymous or authenticated visitor ID' })
  @IsOptional()
  @IsString()
  visitorId?: string;

  @ApiPropertyOptional({ example: 'sess-99120', description: 'Session ID' })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiPropertyOptional({ example: 'https://google.com', description: 'Referrer URL' })
  @IsOptional()
  @IsString()
  referrer?: string;

  @ApiPropertyOptional({ example: '{"carbonSavedKg":45.2,"wasteDivertedLbs":120}', description: 'Stringified JSON metadata' })
  @IsOptional()
  @IsString()
  metadata?: string;
}
