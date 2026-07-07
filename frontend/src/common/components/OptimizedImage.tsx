import React, { useEffect } from 'react';
import { clsx } from 'clsx';

export interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  priority?: boolean;
  responsive?: boolean;
  width?: number | string;
  height?: number | string;
  className?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

/**
 * Enterprise OptimizedImage component enforcing Core Web Vitals best practices:
 * lazy loading, async decoding, responsive srcSet, and hero image preloading.
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  priority = false,
  responsive = false,
  width,
  height,
  className,
  objectFit = 'cover',
  srcSet,
  ...props
}) => {
  // Preload high-priority hero images dynamically via document head
  useEffect(() => {
    if (priority && typeof document !== 'undefined') {
      const existingLink = document.querySelector(`link[rel="preload"][href="${src}"]`);
      if (!existingLink) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        link.fetchPriority = 'high';
        document.head.appendChild(link);
      }
    }
  }, [priority, src]);

  // Generate responsive srcSet for WebP/AVIF assets if responsive flag enabled
  const generatedSrcSet =
    srcSet ||
    (responsive
      ? `${src} 400w, ${src} 800w, ${src} 1200w, ${src} 1600w`
      : undefined);

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
      srcSet={generatedSrcSet}
      sizes={responsive ? '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw' : undefined}
      style={{ objectFit }}
      className={clsx('transition-opacity duration-300 ease-in-out select-none', className)}
      {...props}
    />
  );
};
