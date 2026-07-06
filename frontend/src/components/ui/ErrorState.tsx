import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { cn, Heading, Text } from './Typography';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'We encountered an unexpected error while loading this data. Please try again.',
  onRetry,
  className,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'flex flex-col items-center justify-center rounded-3xl border border-destructive/30 bg-destructive/5 p-8 md:p-10 text-center shadow-sm',
        className,
      )}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive shadow-inner">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <Heading level={4} className="mb-1 text-lg font-bold text-destructive">
        {title}
      </Heading>
      <Text variant="muted" className="mb-6 max-w-md text-sm text-muted-foreground">
        {message}
      </Text>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          leftIcon={<RefreshCw className="h-4 w-4" />}
          className="border-destructive/40 hover:bg-destructive/10 text-destructive rounded-2xl"
        >
          Try Again
        </Button>
      )}
    </motion.div>
  );
};
