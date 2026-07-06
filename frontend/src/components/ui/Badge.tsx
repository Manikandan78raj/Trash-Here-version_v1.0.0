import React from 'react';
import { cn } from './Typography';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'sm' | 'md';
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const baseClasses =
      'inline-flex items-center justify-center font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-full uppercase tracking-wider select-none';

    const variantClasses = {
      default: 'bg-primary text-primary-foreground border border-primary/50 shadow-sm',
      secondary: 'bg-secondary text-secondary-foreground border border-border/50',
      outline: 'text-foreground border border-border bg-transparent',
      success: 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20',
      warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
      error: 'bg-destructive/10 text-destructive border border-destructive/20',
      info: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
      neutral: 'bg-muted text-muted-foreground border border-border/40',
    };

    const sizeClasses = {
      sm: 'text-[10px] px-2 py-0.5',
      md: 'text-xs px-3 py-1',
    };

    return (
      <div
        ref={ref}
        className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
        {...props}
      />
    );
  },
);
Badge.displayName = 'Badge';
