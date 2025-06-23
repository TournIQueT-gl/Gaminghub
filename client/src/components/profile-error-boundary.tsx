import { Component, ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ProfileErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Profile component error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="bg-gaming-card border-gaming-card-hover">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
              <div>
                <h3 className="text-white font-semibold mb-2">Something went wrong</h3>
                <p className="text-gaming-text-dim text-sm">
                  There was an error loading this part of the profile. Please try refreshing.
                </p>
              </div>
              <Button
                onClick={this.handleReset}
                variant="outline"
                className="border-gaming-card-hover"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}