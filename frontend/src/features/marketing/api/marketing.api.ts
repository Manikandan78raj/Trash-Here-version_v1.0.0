import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/common/api/client';
import { toast } from '@/common/notifications/toast';

export interface SubmitContactRequest {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
  ipAddress?: string;
  source?: string;
}

export interface SubscribeNewsletterRequest {
  email: string;
  source?: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  category: string;
  coverImage?: string;
  readTimeMinutes: number;
  isPublished: boolean;
  publishedAt: string;
  seoTitle?: string;
  seoDescription?: string;
  tags: string[];
}

export interface CareerJob {
  id: string;
  slug: string;
  title: string;
  department: string;
  location: string;
  employmentType: string;
  workplaceType: string;
  salaryRange?: string;
  description: string;
  requirements: string[];
  isPublished: boolean;
}

export interface ApplyCareerRequest {
  jobId: string;
  fullName: string;
  email: string;
  phone: string;
  resumeUrl: string;
  coverLetter?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
}

export interface SeoMetadata {
  id?: string;
  route: string;
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  keywords?: string;
  jsonLdSchema?: string;
}

export interface TrackAnalyticsRequest {
  eventName: string;
  route: string;
  visitorId?: string;
  sessionId?: string;
  referrer?: string;
  metadata?: string;
}

// 1. Submit Contact Inquiry
export const useSubmitContact = () => {
  return useMutation({
    mutationFn: async (data: SubmitContactRequest) => {
      const response = await apiClient.post('/api/v1/public/contact', data);
      return response.data;
    },
    onSuccess: (data: any) => {
      if (data.status === 'SPAM') {
        toast.info('Inquiry flagged for administrative review.');
      } else {
        toast.success(data.message || 'Thank you! Your message has been sent to our enterprise team.');
      }
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to submit contact inquiry.';
      toast.error(msg);
    },
  });
};

// 2. Subscribe Newsletter
export const useSubscribeNewsletter = () => {
  return useMutation({
    mutationFn: async (data: SubscribeNewsletterRequest) => {
      const response = await apiClient.post('/api/v1/public/newsletter', data);
      return response.data;
    },
    onSuccess: (data: any) => {
      toast.success(data.message || 'Successfully subscribed to Trash Here newsletter.');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to subscribe.';
      toast.error(msg);
    },
  });
};

// 3. Get Published Blog Posts
export const useGetBlogPosts = (category?: string, tag?: string) => {
  return useQuery({
    queryKey: ['public-blog-posts', category, tag],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category && category !== 'ALL') params.append('category', category);
      if (tag) params.append('tag', tag);
      const response = await apiClient.get(`/api/v1/public/blog?${params.toString()}`);
      return response.data as { success: boolean; count: number; data: BlogPost[] };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// 4. Get Blog Post by Slug
export const useGetBlogPostBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['public-blog-post', slug],
    queryFn: async () => {
      const response = await apiClient.get(`/api/v1/public/blog/${slug}`);
      return response.data as { success: boolean; data: BlogPost };
    },
    enabled: Boolean(slug),
    staleTime: 1000 * 60 * 10,
  });
};

// 5. Get Career Openings
export const useGetCareerJobs = (department?: string) => {
  return useQuery({
    queryKey: ['public-careers', department],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (department && department !== 'ALL') params.append('department', department);
      const response = await apiClient.get(`/api/v1/public/careers?${params.toString()}`);
      return response.data as { success: boolean; count: number; data: CareerJob[] };
    },
    staleTime: 1000 * 60 * 5,
  });
};

// 6. Get Career Job by Slug
export const useGetCareerJobBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['public-career-job', slug],
    queryFn: async () => {
      const response = await apiClient.get(`/api/v1/public/careers/${slug}`);
      return response.data as { success: boolean; data: CareerJob };
    },
    enabled: Boolean(slug),
    staleTime: 1000 * 60 * 10,
  });
};

// 7. Submit Job Application
export const useApplyJob = () => {
  return useMutation({
    mutationFn: async (data: ApplyCareerRequest) => {
      const response = await apiClient.post('/api/v1/public/careers/apply', data);
      return response.data;
    },
    onSuccess: (data: any) => {
      toast.success(data.message || 'Application submitted successfully!');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to submit application.';
      toast.error(msg);
    },
  });
};

// 8. Get SEO Metadata by Route
export const useGetSeoMetadata = (route: string) => {
  return useQuery({
    queryKey: ['public-seo-metadata', route],
    queryFn: async () => {
      const response = await apiClient.get(`/api/v1/public/seo/metadata?route=${encodeURIComponent(route)}`);
      return response.data as { success: boolean; data: SeoMetadata };
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
};

// 9. Track Analytics Event
export const useTrackAnalyticsEvent = () => {
  return useMutation({
    mutationFn: async (data: TrackAnalyticsRequest) => {
      const response = await apiClient.post('/api/v1/public/analytics/event', data);
      return response.data;
    },
  });
};
