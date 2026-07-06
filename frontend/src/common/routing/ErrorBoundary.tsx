import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';
import { Card, Heading, Text, Button, Code } from '@/components/ui';

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
    console.error('❌ [ErrorBoundary] Uncaught application error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
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
              An unexpected error occurred in this workspace component. Our telemetry nodes have
              logged the exception for diagnostics.
            </Text>

            {this.state.error && (
              <div className="p-4 rounded-2xl bg-muted/60 border border-border/60 overflow-x-auto">
                <Text variant="small" className="font-mono font-bold text-destructive block mb-1">
                  {this.state.error.toString()}
                </Text>
                {this.state.errorInfo && (
                  <Code className="text-[11px] text-muted-foreground block whitespace-pre-wrap mt-2 max-h-40 overflow-y-auto">
                    {this.state.errorInfo.componentStack}
                  </Code>
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="primary"
                size="md"
                leftIcon={<RefreshCw className="h-4 w-4" />}
                onClick={this.handleReset}
              >
                Reload Workspace
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
