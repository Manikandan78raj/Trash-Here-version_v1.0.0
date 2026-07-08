import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useGetSeoMetadata } from '../api/marketing.api';

interface SeoHeadProps {
  route?: string;
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  jsonLdSchema?: string | object;
  breadcrumbSchema?: object;
}

export const SeoHead: React.FC<SeoHeadProps> = ({
  route,
  title: customTitle,
  description: customDesc,
  canonicalUrl: customCanonical,
  ogImage: customOgImage,
  ogType: customOgType,
  twitterCard: customTwitterCard,
  jsonLdSchema: customJsonLd,
  breadcrumbSchema,
}) => {
  const location = useLocation();
  const currentRoute = route || location.pathname;

  const { data: seoResponse } = useGetSeoMetadata(currentRoute);
  const metadata = seoResponse?.data;

  useEffect(() => {
    // 1. Title
    const finalTitle =
      customTitle ||
      metadata?.title ||
      'Trash Here — Venture-Scale Smart Waste Logistics & Climate Infrastructure';
    document.title = finalTitle;

    // Helper to update or create meta tags
    const setMetaTag = (attrName: 'name' | 'property', attrValue: string, content: string) => {
      let element = document.head.querySelector(
        `meta[${attrName}="${attrValue}"]`,
      ) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Helper to update canonical link
    const setCanonicalLink = (url: string) => {
      let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', url);
    };

    // 2. Description
    const finalDesc =
      customDesc ||
      metadata?.description ||
      'AI-powered weighbridge telemetry, algorithmic polyline fleet routing, and SHA-256 ESG manifests for households, collectors, and enterprise recyclers.';
    setMetaTag('name', 'description', finalDesc);

    // 3. Canonical URL
    const finalCanonical =
      customCanonical || metadata?.canonicalUrl || `https://trashhere.com${currentRoute}`;
    setCanonicalLink(finalCanonical);

    // 4. OpenGraph
    const finalOgImage =
      customOgImage || metadata?.ogImage || 'https://trashhere.com/assets/og-default.jpg';
    const finalOgType = customOgType || metadata?.ogType || 'website';
    setMetaTag('property', 'og:title', finalTitle);
    setMetaTag('property', 'og:description', finalDesc);
    setMetaTag('property', 'og:image', finalOgImage);
    setMetaTag('property', 'og:type', finalOgType);
    setMetaTag('property', 'og:url', finalCanonical);
    setMetaTag('property', 'og:site_name', 'Trash Here');

    // 5. Twitter Cards
    const finalTwitterCard = customTwitterCard || metadata?.twitterCard || 'summary_large_image';
    setMetaTag('name', 'twitter:card', finalTwitterCard);
    setMetaTag('name', 'twitter:title', finalTitle);
    setMetaTag('name', 'twitter:description', finalDesc);
    setMetaTag('name', 'twitter:image', finalOgImage);
    setMetaTag('name', 'twitter:site', '@TrashHereHQ');

    // 6. JSON-LD Schema
    const finalJsonLd =
      customJsonLd || (metadata?.jsonLdSchema ? JSON.parse(metadata.jsonLdSchema) : null);
    if (finalJsonLd) {
      let script = document.getElementById('json-ld-schema') as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.id = 'json-ld-schema';
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent =
        typeof finalJsonLd === 'string' ? finalJsonLd : JSON.stringify(finalJsonLd);
    }

    // 7. Breadcrumb JSON-LD
    if (breadcrumbSchema) {
      let script = document.getElementById('json-ld-breadcrumb') as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.id = 'json-ld-breadcrumb';
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(breadcrumbSchema);
    }
  }, [
    currentRoute,
    customTitle,
    customDesc,
    customCanonical,
    customOgImage,
    customOgType,
    customTwitterCard,
    customJsonLd,
    breadcrumbSchema,
    metadata,
  ]);

  return null;
};
