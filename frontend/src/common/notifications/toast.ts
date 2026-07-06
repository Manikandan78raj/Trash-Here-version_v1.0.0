import { toast as sonnerToast, type ExternalToast } from 'sonner';

export const toast = {
  success: (message: string, description?: string, options?: ExternalToast) => {
    return sonnerToast.success(message, {
      description,
      className: 'border-primary/50 bg-background text-foreground shadow-lg rounded-2xl',
      ...options,
    });
  },
  error: (message: string, description?: string, options?: ExternalToast) => {
    return sonnerToast.error(message, {
      description,
      className: 'border-destructive/50 bg-background text-destructive shadow-lg rounded-2xl',
      ...options,
    });
  },
  info: (message: string, description?: string, options?: ExternalToast) => {
    return sonnerToast.info(message, {
      description,
      className: 'border-border bg-background text-foreground shadow-lg rounded-2xl',
      ...options,
    });
  },
  loading: (message: string, description?: string, options?: ExternalToast) => {
    return sonnerToast.loading(message, {
      description,
      className: 'border-border bg-background text-foreground shadow-lg rounded-2xl',
      ...options,
    });
  },
  dismiss: (id?: string | number) => {
    sonnerToast.dismiss(id);
  },
};
