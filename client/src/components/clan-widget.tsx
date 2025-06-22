import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export default function ClanWidget() {
  const { data: clans, isLoading } = useQuery({
    queryKey: ['/api/clans'],
    retry: false,
  });

  const trendingClans = clans?.slice(0, 3) || [];

  const getClanInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="bg-gaming-card border-gaming-card-hover">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Trending Clans</CardTitle>
          <Button variant="ghost" size="sm" className="text-gaming-blue hover:text-blue-400">
            Explore
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 p-3 rounded-lg">
              <Skeleton className="w-10 h-10 rounded-lg bg-gaming-darker" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-24 bg-gaming-darker" />
                <Skeleton className="h-3 w-16 bg-gaming-darker" />
              </div>
              <div className="text-right space-y-1">
                <Skeleton className="h-3 w-12 bg-gaming-darker" />
                <Skeleton className="h-2 w-16 bg-gaming-darker" />
              </div>
            </div>
          ))
        ) : trendingClans.length > 0 ? (
          trendingClans.map((clan: any) => (
            <div 
              key={clan.id}
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gaming-card-hover transition-colors cursor-pointer"
            >
              <div className="w-10 h-10 clan-badge rounded-lg flex items-center justify-center text-white font-bold text-sm">
                {getClanInitials(clan.name)}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-white text-sm">{clan.name}</h4>
                <p className="text-xs text-gaming-text-dim">{clan.memberCount} members</p>
              </div>
              <div className="text-right">
                <div className="text-xs text-gaming-emerald font-mono">
                  +{clan.xp.toLocaleString()} XP
                </div>
                <div className="text-xs text-gaming-text-dim">this week</div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Shield className="w-12 h-12 text-gaming-text-dim mx-auto mb-2" />
            <p className="text-gaming-text-dim text-sm">No clans found</p>
          </div>
        )}
        
        <Button className="w-full bg-gaming-purple hover:bg-purple-600 text-white">
          <Shield className="w-4 h-4 mr-2" />
          Create Clan
        </Button>
      </CardContent>
    </Card>
  );
}
