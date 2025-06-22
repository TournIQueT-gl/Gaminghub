import React from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      return (
        <div className="min-h-screen bg-gaming-dark flex items-center justify-center p-6">
          <div className="bg-gaming-card rounded-xl p-8 border border-gaming-card-hover max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            
            <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
            <p className="text-gaming-text-dim mb-6">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            
            {this.state.error && (
              <details className="mb-6 text-left">
                <summary className="text-sm text-gaming-text-dim cursor-pointer mb-2">
                  Error details
                </summary>
                <pre className="text-xs bg-gaming-darker rounded p-3 overflow-auto text-red-300">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            
            <div className="flex gap-3 justify-center">
              <Button 
                onClick={() => window.location.reload()} 
                className="bg-gaming-blue hover:bg-blue-600"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Page
              </Button>
              
              <Button 
                onClick={this.resetError} 
                variant="outline" 
                className="border-gaming-card-hover hover:bg-gaming-card-hover"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;