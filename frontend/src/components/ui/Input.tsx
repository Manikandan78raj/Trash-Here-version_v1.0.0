import React from 'react';
import { cn } from './Typography';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: boolean;
  errorText?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, leftIcon, rightIcon, error, errorText, helperText, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col space-y-1.5">
        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-4 flex items-center pointer-events-none text-muted-foreground">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              'flex h-12 w-full rounded-2xl border border-input bg-background px-4 py-2 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 shadow-sm',
              leftIcon && 'pl-11',
              rightIcon && 'pr-11',
              error && 'border-destructive focus-visible:ring-destructive',
              className,
            )}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-4 flex items-center text-muted-foreground cursor-pointer">
              {rightIcon}
            </div>
          )}
        </div>
        {errorText && <p className="text-xs font-medium text-destructive px-1">{errorText}</p>}
        {!errorText && helperText && (
          <p className="text-xs text-muted-foreground px-1">{helperText}</p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
