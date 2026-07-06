import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from './Typography';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const baseClasses =
      'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-2xl select-none';

    const variantClasses = {
      primary:
        'bg-primary text-primary-foreground hover:bg-primary-500 shadow-md hover:shadow-lg hover:glow-primary font-semibold',
      secondary:
        'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/50',
      outline:
        'border-2 border-border bg-transparent hover:bg-muted text-foreground hover:border-primary/50',
      ghost: 'bg-transparent hover:bg-muted text-foreground',
      danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md',
      glass:
        'bg-background/60 backdrop-blur-md border border-border/60 text-foreground hover:bg-background/80 shadow-sm',
    };

    const sizeClasses = {
      sm: 'h-9 px-4 text-xs gap-1.5',
      md: 'h-11 px-6 text-sm gap-2',
      lg: 'h-14 px-8 text-base gap-2.5 rounded-3xl font-bold',
      icon: 'h-11 w-11 p-0',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={disabled || isLoading ? undefined : { scale: 1.02 }}
        whileTap={disabled || isLoading ? undefined : { scale: 0.98 }}
        className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {!isLoading && leftIcon && <span className="inline-flex">{leftIcon}</span>}
        {children && <span>{children}</span>}
        {!isLoading && rightIcon && <span className="inline-flex">{rightIcon}</span>}
      </motion.button>
    );
  },
);

Button.displayName = 'Button';
