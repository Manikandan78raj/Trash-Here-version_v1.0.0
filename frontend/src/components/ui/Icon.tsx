import React from 'react';
import * as LucideIcons from 'lucide-react';
import { cn } from './Typography';

export type IconName = keyof typeof LucideIcons;

export interface IconProps extends React.SVGAttributes<SVGElement> {
  name: IconName;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'primary' | 'muted' | 'destructive' | 'success' | 'warning';
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 'md',
  variant = 'default',
  className,
  ...props
}) => {
  const IconComponent = (LucideIcons[name] || LucideIcons.HelpCircle) as React.FC<
    React.SVGAttributes<SVGElement>
  >;

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-8 w-8',
  };

  const variantClasses = {
    default: 'text-foreground',
    primary: 'text-primary glow-primary',
    muted: 'text-muted-foreground',
    destructive: 'text-destructive',
    success: 'text-green-500',
    warning: 'text-amber-500',
  };

  return (
    <IconComponent
      className={cn(sizeClasses[size], variantClasses[variant], className)}
      {...props}
    />
  );
};
