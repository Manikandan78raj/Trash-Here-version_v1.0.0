import React from 'react';
import { motion } from 'framer-motion';
import { Inbox } from 'lucide-react';
import { cn, Heading, Text } from './Typography';
import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 bg-card/50 p-12 text-center shadow-sm',
        className,
      )}
    >
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary shadow-inner glow-primary">
        {icon || <Inbox className="h-8 w-8" />}
      </div>
      <Heading level={3} className="mb-2 text-xl font-bold">
        {title}
      </Heading>
      <Text variant="muted" className="mb-6 max-w-sm text-sm">
        {description}
      </Text>
      {actionLabel && onAction && (
        <Button variant="primary" size="md" onClick={onAction} className="rounded-2xl">
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
};
