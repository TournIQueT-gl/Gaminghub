import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Profile Header Skeleton */}
      <Card className="bg-gaming-card border-gaming-card-hover overflow-hidden">
        <div className="h-40 bg-gradient-to-r from-gaming-purple via-gaming-blue to-gaming-emerald opacity-50" />
        <CardContent className="pt-0 pb-6">
          <div className="flex flex-col lg:flex-row items-start gap-6 -mt-16">
            {/* Avatar Skeleton */}
            <div className="relative flex-shrink-0">
              <Skeleton className="w-32 h-32 rounded-full border-4 border-gaming-card" />
            </div>

            {/* Profile Info Skeleton */}
            <div className="flex-1 space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-64" />
                  
                  <div className="flex gap-4 mt-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-24" />
                </div>
              </div>

              {/* Level Progress Skeleton */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-3 w-full" />
              </div>

              {/* Stats Grid Skeleton */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="text-center p-3 bg-gaming-darker rounded-lg">
                    <Skeleton className="h-6 w-8 mx-auto mb-1" />
                    <Skeleton className="h-3 w-12 mx-auto" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Skeleton */}
      <div className="space-y-4">
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-24" />
          ))}
        </div>
        
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="bg-gaming-card border-gaming-card-hover">
              <CardContent className="p-6">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}