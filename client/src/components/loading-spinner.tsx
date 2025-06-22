import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

export function LoadingSpinner({ size = "md", className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="flex flex-col items-center space-y-2">
        <Loader2 className={cn("animate-spin text-gaming-blue", sizeClasses[size])} />
        {text && (
          <p className="text-sm text-gaming-text-dim">{text}</p>
        )}
      </div>
    </div>
  );
}

export function LoadingPage({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="min-h-screen bg-gaming-dark flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-gaming-blue to-gaming-purple rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
        <p className="text-gaming-text-dim">{text}</p>
      </div>
    </div>
  );
}

export default LoadingSpinner;