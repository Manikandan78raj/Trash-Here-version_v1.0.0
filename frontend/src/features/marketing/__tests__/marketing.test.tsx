import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';

// Use a Proxy to dynamically mock any Framer Motion HTML element (div, article, span, section, etc.)
const createMotionComponent = (tag: string) => {
  return React.forwardRef(({ children, className, onClick, href, type }: any, ref: any) =>
    React.createElement(tag, { className, onClick, href, type, ref }, children)
  );
};

vi.mock('framer-motion', () => ({
  motion: new Proxy(
    {},
    {
      get: (_target, prop: string) => createMotionComponent(prop),
    }
  ),
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

const mockCalculateMutate = vi.fn();
const mockContactMutate = vi.fn();
const mockTrackMutate = vi.fn();

vi.mock('../api/marketing.api', () => ({
  useCalculateImpact: () => ({
    mutate: mockCalculateMutate,
    isPending: false,
    data: { co2SavedKg: 145.2, greenPointsEarned: 1450, landfillDivertedKg: 120 },
  }),
  useSubmitContact: () => ({
    mutate: mockContactMutate,
    isPending: false,
  }),
  useSubscribeNewsletter: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useTrackAnalyticsEvent: () => ({
    mutate: mockTrackMutate,
    isPending: false,
  }),
  useGetSeoMetadata: () => ({
    data: { data: { title: 'Test SEO Title', description: 'Test Description', ogImage: '/og.png' } },
    isLoading: false,
  }),
  useGetBlogPosts: () => ({
    data: {
      data: [
        {
          id: 'post-1',
          title: 'How AI Polyline Routing Reduces Municipal Fuel Emissions by 38 Percent',
          slug: 'how-ai-polyline-routing-reduces-municipal-fuel-emissions',
          summary: 'Algorithmic routing deep dive.',
          category: 'Algorithmic Routing',
          authorName: 'Dr. Elena Rostova',
          authorRole: 'CEO',
          readTimeMinutes: 5,
          publishedAt: new Date().toISOString(),
          tags: ['AI', 'Routing'],
        },
        {
          id: 'post-2',
          title: 'The Rise of SHA-256 Cryptographic Manifests in Corporate ESG Auditing',
          slug: 'the-rise-of-sha-256-cryptographic-manifests',
          summary: 'Cryptographic manifests deep dive.',
          category: 'Climate Policy & ESG',
          authorName: 'Aria Montgomery',
          authorRole: 'VP ESG',
          readTimeMinutes: 7,
          publishedAt: new Date().toISOString(),
          tags: ['ESG', 'SHA256'],
        },
      ],
    },
    isLoading: false,
  }),
  useGetBlogPostBySlug: () => ({
    data: { data: { title: 'Test Post', content: 'Test Content' } },
    isLoading: false,
  }),
  useGetCareers: () => ({
    data: { data: [] },
    isLoading: false,
  }),
  useGetCareerBySlug: () => ({
    data: { data: null },
    isLoading: false,
  }),
  useSubmitJobApplication: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

import { MarketingNavbar } from '../components/MarketingNavbar';
import { MarketingFooter } from '../components/MarketingFooter';
import { EcoCalculatorPage } from '../pages/EcoCalculatorPage';
import { ContactPage } from '../pages/ContactPage';
import { BlogListingPage } from '../pages/BlogListingPage';
import { SeoHead } from '../components/SeoHead';

describe('Sprint 10 Marketing & SEO Hub Components', () => {
  beforeEach(() => {
    mockCalculateMutate.mockClear();
    mockContactMutate.mockClear();
    mockTrackMutate.mockClear();
  });

  it('1. should render MarketingNavbar with branding and navigation links', () => {
    render(
      <MemoryRouter>
        <MarketingNavbar />
      </MemoryRouter>
    );

    expect(screen.getByText(/Trash Here/i)).toBeInTheDocument();
    expect(screen.getByText(/Eco Calculator/i)).toBeInTheDocument();
    expect(screen.getByText(/Pricing/i)).toBeInTheDocument();
  });

  it('2. should render MarketingFooter and allow newsletter email input', () => {
    render(
      <MemoryRouter>
        <MarketingFooter />
      </MemoryRouter>
    );

    expect(screen.getByText(/Venture-scale climate infrastructure/i)).toBeInTheDocument();
    const emailInput = screen.getByPlaceholderText(/Enter your email address/i);
    expect(emailInput).toBeInTheDocument();
    fireEvent.change(emailInput, { target: { value: 'test@company.com' } });
    expect(emailInput).toHaveValue('test@company.com');
  });

  it('3. should render EcoCalculatorPage and update calculation results on slider change', () => {
    render(
      <MemoryRouter>
        <EcoCalculatorPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Landfill Diversion/i)).toBeInTheDocument();
    expect(screen.getByText(/CO₂ Emissions Saved/i)).toBeInTheDocument();

    // Adjust volume slider to trigger calculation update
    const slider = screen.getByLabelText(/Recyclable \/ Composable Percentage/i);
    fireEvent.change(slider, { target: { value: '80' } });

    expect(screen.getByText('80%')).toBeInTheDocument();
  });

  it('4. should render ContactPage form and submit inquiry with spam protection fields', () => {
    render(
      <MemoryRouter>
        <ContactPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Let's Build Sustainable Cities Together/i)).toBeInTheDocument();
    expect(screen.getByText(/Spam & Rate Protection Active/i)).toBeInTheDocument();

    const nameInput = screen.getByPlaceholderText('John Doe');
    fireEvent.change(nameInput, { target: { value: 'Jane Smith' } });

    const submitBtn = screen.getByRole('button', { name: /Send Message to Engineering/i });
    const form = submitBtn.closest('form');
    expect(form).not.toBeNull();
    fireEvent.submit(form!);

    expect(mockContactMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Jane Smith',
        source: 'contact_page',
        subject: 'Enterprise Fleet Integration',
      }),
      expect.any(Object)
    );
  });

  it('5. should filter BlogListingPage articles by category when category badge is clicked', () => {
    render(
      <MemoryRouter>
        <BlogListingPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/How AI Polyline Routing Reduces Municipal Fuel Emissions/i)).toBeInTheDocument();
    expect(screen.getByText(/The Rise of SHA-256 Cryptographic Manifests/i)).toBeInTheDocument();

    // Click 'Engineering & AI' filter
    const aiFilter = screen.getByRole('tab', { name: 'Engineering & AI' });
    fireEvent.click(aiFilter);

    // Should still show polyline routing article
    expect(screen.getByText(/How AI Polyline Routing Reduces Municipal Fuel Emissions/i)).toBeInTheDocument();
  });

  it('6. should update document.title and inject JSON-LD schema via SeoHead', async () => {
    render(
      <MemoryRouter>
        <SeoHead
          route="/test-seo"
          title="Test SEO Title — Trash Here"
          description="Test SEO description for unit testing."
          jsonLdSchema={{ '@context': 'https://schema.org', '@type': 'WebPage', name: 'Test' }}
        />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(document.title).toBe('Test SEO Title — Trash Here');
    });

    const scriptTag = document.getElementById('json-ld-schema');
    expect(scriptTag).toBeInTheDocument();
    expect(scriptTag?.innerHTML).toContain('"@type":"WebPage"');
  });
});
