import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';
import { Card, Heading, Text, Button } from '@/components/ui';
import { sanitizeText } from '@/common/security/sanitization';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

function formatSafeErrorMessage(error: Error): string {
  const rawMsg = `${error.name || ''}: ${error.message || ''}`;
  // Check for backend/database/Prisma error leaks
  if (/prisma|sql|database|table|library\.js|node_modules/i.test(rawMsg)) {
    return 'An unexpected application error occurred. Please try again.';
  }
  return sanitizeText(error.message || 'An unexpected application error occurred.');
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (import.meta.env.MODE === 'development') {
      console.error('❌ [ErrorBoundary] Uncaught application error:', error, errorInfo);
    }
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else if (import.meta.env.MODE !== 'test' && typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[80vh] w-full items-center justify-center p-6 bg-background">
          <Card className="max-w-xl w-full p-8 border-destructive/40 shadow-2xl space-y-6 bg-card/90 backdrop-blur-xl">
            <div className="flex items-center gap-3 text-destructive">
              <div className="p-3 rounded-2xl bg-destructive/10 border border-destructive/20">
                <ShieldAlert className="h-8 w-8" />
              </div>
              <div>
                <Heading level={2} className="text-2xl font-bold">
                  System Exception Encountered
                </Heading>
                <Text variant="muted" className="text-xs uppercase tracking-wider">
                  Runtime Error Boundary Active
                </Text>
              </div>
            </div>

            <Text variant="default" className="text-muted-foreground">
              A workspace runtime exception was intercepted by our security boundary. Our telemetry
              nodes have logged the event for diagnostics.
            </Text>

            {this.state.error && (
              <div className="p-4 rounded-2xl bg-muted/60 border border-border/60 overflow-x-auto">
                <Text variant="small" className="font-mono font-bold text-destructive block mb-1">
                  {formatSafeErrorMessage(this.state.error)}
                </Text>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="primary"
                size="md"
                leftIcon={<RefreshCw className="h-4 w-4" />}
                onClick={this.handleReset}
              >
                Try Again
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
