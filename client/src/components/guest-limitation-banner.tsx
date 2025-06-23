import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Lock, Star, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface GuestLimitationBannerProps {
  message: string;
  feature: string;
  className?: string;
}

export default function GuestLimitationBanner({ message, feature, className = "" }: GuestLimitationBannerProps) {
  const { login } = useAuth();

  return (
    <Card className={`bg-gradient-to-r from-gaming-blue/10 to-gaming-purple/10 border-gaming-blue/30 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gaming-blue/20 rounded-lg flex items-center justify-center">
              <Lock className="w-5 h-5 text-gaming-blue" />
            </div>
            <div>
              <h3 className="text-white font-medium">{message}</h3>
              <p className="text-sm text-gaming-text-dim">
                Join thousands of gamers on GamingX
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="hidden sm:flex items-center space-x-1 text-xs text-gaming-text-dim">
              <Star className="w-4 h-4 text-yellow-400" />
              <span>Free to join</span>
            </div>
            <Button 
              onClick={login}
              className="bg-gradient-to-r from-gaming-blue to-gaming-purple hover:from-gaming-blue/80 hover:to-gaming-purple/80"
            >
              <Zap className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}