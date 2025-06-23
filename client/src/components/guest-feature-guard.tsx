import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { checkGuestLimitation, getGuestLimitationMessage } from "@/lib/authUtils";

interface GuestFeatureGuardProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

export default function GuestFeatureGuard({ 
  feature, 
  children, 
  fallback, 
  className = "" 
}: GuestFeatureGuardProps) {
  const { isAuthenticated, login } = useAuth();

  if (isAuthenticated) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <Card className={`bg-gaming-card/50 border-gaming-card-hover ${className}`}>
      <CardContent className="p-6 text-center">
        <div className="w-12 h-12 bg-gaming-blue/20 rounded-lg flex items-center justify-center mx-auto mb-4">
          <Lock className="w-6 h-6 text-gaming-blue" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Sign In Required</h3>
        <p className="text-gaming-text-dim mb-4">
          {getGuestLimitationMessage(feature)}
        </p>
        <Button 
          onClick={login}
          className="bg-gradient-to-r from-gaming-blue to-gaming-purple hover:from-gaming-blue/80 hover:to-gaming-purple/80"
        >
          Sign In to Continue
        </Button>
      </CardContent>
    </Card>
  );
}