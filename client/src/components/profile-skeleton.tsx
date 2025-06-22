import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Profile Header Skeleton */}
      <Card className="bg-gaming-card border-gaming-card-hover overflow-hidden">
        <div className="h-40 bg-gaming-darker animate-pulse" />
        <CardContent className="pt-0 pb-6">
          <div className="flex flex-col lg:flex-row items-start gap-6 -mt-16">
            {/* Profile Picture Skeleton */}
            <div className="relative flex-shrink-0">
              <Skeleton className="w-32 h-32 rounded-full bg-gaming-darker" />
            </div>

            {/* Profile Info Skeleton */}
            <div className="flex-1 space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-48 bg-gaming-darker" />
                    <Skeleton className="h-6 w-20 bg-gaming-darker" />
                  </div>
                  <Skeleton className="h-5 w-64 bg-gaming-darker" />
                  <Skeleton className="h-4 w-96 bg-gaming-darker" />
                </div>
                <div className="flex gap-3">
                  <Skeleton className="h-10 w-32 bg-gaming-darker" />
                  <Skeleton className="h-10 w-24 bg-gaming-darker" />
                </div>
              </div>

              {/* Level Progress Skeleton */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24 bg-gaming-darker" />
                  <Skeleton className="h-4 w-32 bg-gaming-darker" />
                </div>
                <Skeleton className="h-3 w-full bg-gaming-darker" />
              </div>

              {/* Stats Grid Skeleton */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="text-center p-3 bg-gaming-darker rounded-lg">
                    <Skeleton className="h-8 w-12 mx-auto mb-2 bg-gaming-card" />
                    <Skeleton className="h-3 w-16 mx-auto bg-gaming-card" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Skeleton */}
      <div className="space-y-6">
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-24 bg-gaming-darker" />
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="bg-gaming-card border-gaming-card-hover">
              <CardHeader>
                <Skeleton className="h-6 w-3/4 bg-gaming-darker" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2 bg-gaming-darker" />
                <Skeleton className="h-4 w-2/3 bg-gaming-darker" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}