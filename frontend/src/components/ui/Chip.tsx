import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from './Typography';

export interface ChipProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  selected?: boolean;
  onRemove?: () => void;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Chip = React.forwardRef<HTMLDivElement, ChipProps>(
  ({ className, selected = false, onRemove, icon, children, onClick, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onClick}
        className={cn(
          'inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition-all duration-200 cursor-pointer select-none border',
          selected
            ? 'bg-primary text-primary-foreground border-primary shadow-sm glow-primary'
            : 'bg-card text-foreground border-border/60 hover:border-primary/50 hover:bg-muted/50',
          className,
        )}
        {...props}
      >
        {icon && <span className="inline-flex text-current">{icon}</span>}
        <span>{children}</span>
        {onRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="ml-1 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors focus:outline-none"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </motion.div>
    );
  },
);
Chip.displayName = 'Chip';
