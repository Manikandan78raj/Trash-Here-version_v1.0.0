import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ErrorBoundary } from '@/common/routing/ErrorBoundary';

const ThrowErrorComponent: React.FC<{ error: Error }> = ({ error }) => {
  throw error;
};

describe('ErrorBoundary Security Hardening (TDD)', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Prevent React error boundary logs from cluttering test output
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should never leak backend SQL or database error details to user DOM', () => {
    const backendSqlError = new Error(
      "PrismaClientKnownRequestError: Invalid `prisma.user.findUnique()` invocation:\nTable 'public.users' does not exist in the current database.\n at /var/www/backend/node_modules/@prisma/client/runtime/library.js:142:30",
    );

    render(
      <ErrorBoundary>
        <ThrowErrorComponent error={backendSqlError} />
      </ErrorBoundary>,
    );

    expect(screen.queryByText(/PrismaClientKnownRequestError/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Table 'public.users'/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/library\.js/i)).not.toBeInTheDocument();
    expect(screen.getByText(/An unexpected application error occurred/i)).toBeInTheDocument();
  });

  it('should sanitize displayed error messages to prevent XSS injection via error strings', () => {
    const xssError = new Error(
      '<script>alert("hacked via error")</script>Failed to load dashboard',
    );

    render(
      <ErrorBoundary>
        <ThrowErrorComponent error={xssError} />
      </ErrorBoundary>,
    );

    expect(screen.queryByText(/<script>/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/alert\("hacked via error"\)/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Failed to load dashboard/i)).toBeInTheDocument();
  });

  it('should never render raw stack traces in the UI fallback', () => {
    const stackError = new Error('Network timeout');
    stackError.stack =
      'Error: Network timeout\n    at fetchData (https://app.trashhere.com/main.js:45:12)\n    at ReactCompositeComponent.render';

    render(
      <ErrorBoundary>
        <ThrowErrorComponent error={stackError} />
      </ErrorBoundary>,
    );

    expect(screen.queryByText(/https:\/\/app\.trashhere\.com/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/ReactCompositeComponent/i)).not.toBeInTheDocument();
  });

  it('should provide a Try Again button that resets error state without page crash', () => {
    const normalError = new Error('Temporary loading issue');

    render(
      <ErrorBoundary>
        <ThrowErrorComponent error={normalError} />
      </ErrorBoundary>,
    );

    const retryButton = screen.getByRole('button', { name: /try again/i });
    expect(retryButton).toBeInTheDocument();
    fireEvent.click(retryButton);
  });
});
