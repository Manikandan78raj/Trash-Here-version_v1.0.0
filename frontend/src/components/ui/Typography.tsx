import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
}

export const Heading: React.FC<HeadingProps> = ({ level = 2, className, children, ...props }) => {
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  const sizeClasses = {
    1: 'text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight',
    2: 'text-3xl md:text-4xl font-bold tracking-tight',
    3: 'text-2xl md:text-3xl font-semibold tracking-tight',
    4: 'text-xl md:text-2xl font-semibold',
    5: 'text-lg md:text-xl font-medium',
    6: 'text-base md:text-lg font-medium text-muted-foreground',
  };

  return (
    <Tag className={cn('font-heading text-foreground', sizeClasses[level], className)} {...props}>
      {children}
    </Tag>
  );
};

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: 'default' | 'lead' | 'muted' | 'small';
  children: React.ReactNode;
}

export const Text: React.FC<TextProps> = ({
  variant = 'default',
  className,
  children,
  ...props
}) => {
  const variantClasses = {
    default: 'text-base leading-relaxed text-foreground',
    lead: 'text-lg md:text-xl font-normal leading-relaxed text-muted-foreground',
    muted: 'text-sm text-muted-foreground leading-normal',
    small: 'text-xs font-medium leading-none text-muted-foreground',
  };

  return (
    <p className={cn('font-sans', variantClasses[variant], className)} {...props}>
      {children}
    </p>
  );
};

export const Caption: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <span
      className={cn('text-xs text-muted-foreground font-medium tracking-wide uppercase', className)}
      {...props}
    >
      {children}
    </span>
  );
};

export const Code: React.FC<React.HTMLAttributes<HTMLElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <code
      className={cn(
        'relative rounded-lg bg-muted px-[0.4rem] py-[0.2rem] font-mono text-sm font-semibold text-foreground border border-border/50',
        className,
      )}
      {...props}
    >
      {children}
    </code>
  );
};
