import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from './Typography';

export const Breadcrumb: React.FC<React.HTMLAttributes<HTMLElement>> = ({
  className,
  ...props
}) => (
  <nav
    aria-label="breadcrumb"
    className={cn('flex items-center text-sm text-muted-foreground', className)}
    {...props}
  />
);

export const BreadcrumbList: React.FC<React.HTMLAttributes<HTMLOListElement>> = ({
  className,
  ...props
}) => (
  <ol
    className={cn('flex flex-wrap items-center gap-1.5 break-words sm:gap-2.5', className)}
    {...props}
  />
);

export const BreadcrumbItem: React.FC<React.LiHTMLAttributes<HTMLLIElement>> = ({
  className,
  ...props
}) => <li className={cn('inline-flex items-center gap-1.5 font-medium', className)} {...props} />;

export interface BreadcrumbLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to?: string;
  isHome?: boolean;
}

export const BreadcrumbLink: React.FC<BreadcrumbLinkProps> = ({
  to,
  isHome,
  className,
  children,
  ...props
}) => {
  const content = isHome ? (
    <span className="flex items-center gap-1">
      <Home className="h-3.5 w-3.5" />
      {children}
    </span>
  ) : (
    children
  );

  if (to) {
    return (
      <Link
        to={to}
        className={cn('transition-colors hover:text-foreground text-muted-foreground', className)}
      >
        {content}
      </Link>
    );
  }

  return (
    <a
      href="#"
      className={cn('transition-colors hover:text-foreground text-muted-foreground', className)}
      {...props}
    >
      {content}
    </a>
  );
};

export const BreadcrumbPage: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({
  className,
  ...props
}) => (
  <span
    role="link"
    aria-disabled="true"
    aria-current="page"
    className={cn('font-bold text-foreground', className)}
    {...props}
  />
);

export const BreadcrumbSeparator: React.FC<React.HTMLAttributes<HTMLLIElement>> = ({
  children,
  className,
  ...props
}) => (
  <li
    role="presentation"
    aria-hidden="true"
    className={cn('[&>svg]:w-3.5 [&>svg]:h-3.5 text-muted-foreground/60', className)}
    {...props}
  >
    {children ?? <ChevronRight />}
  </li>
);
