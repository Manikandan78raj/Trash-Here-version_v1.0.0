import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { cn, Heading, Text } from './Typography';
import { Button } from './Button';

export interface SuccessStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const SuccessState: React.FC<SuccessStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
      className={cn(
        'flex flex-col items-center justify-center rounded-3xl border border-primary/40 bg-card p-10 text-center shadow-lg glow-primary/20',
        className,
      )}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
        className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md glow-primary"
      >
        <CheckCircle2 className="h-9 w-9 stroke-[2.5]" />
      </motion.div>
      <Heading level={3} className="mb-2 text-2xl font-bold text-foreground">
        {title}
      </Heading>
      <Text variant="muted" className="mb-8 max-w-sm text-sm text-muted-foreground leading-relaxed">
        {description}
      </Text>
      {actionLabel && onAction && (
        <Button
          variant="primary"
          size="lg"
          onClick={onAction}
          className="w-full max-w-xs rounded-2xl"
        >
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
};
