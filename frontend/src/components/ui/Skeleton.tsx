import React from 'react';
import { cn } from './Typography';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rectangular' | 'circular' | 'text' | 'card';
  height?: string | number;
  width?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  height,
  width,
  ...props
}) => {
  const variantClasses = {
    rectangular: 'rounded-2xl',
    circular: 'rounded-full',
    text: 'rounded-md h-4 w-3/4',
    card: 'rounded-3xl h-48 w-full',
  };

  return (
    <div
      className={cn(
        'animate-pulse bg-muted/80 border border-border/40',
        variantClasses[variant],
        className,
      )}
      style={{ height, width }}
      {...props}
    />
  );
};
