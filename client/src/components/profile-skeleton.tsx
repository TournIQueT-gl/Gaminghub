import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gaming-dark">
      <div className="flex">
        {/* Sidebar Skeleton */}
        <div className="w-64 bg-gaming-darker border-r border-gaming-card fixed h-full">
          <div className="p-6 border-b border-gaming-card">
            <div className="flex items-center space-x-3">
              <Skeleton className="w-10 h-10 rounded-lg bg-gaming-card" />
              <div>
                <Skeleton className="h-5 w-20 bg-gaming-card mb-1" />
                <Skeleton className="h-3 w-16 bg-gaming-card" />
              </div>
            </div>
          </div>
          
          <div className="p-4 border-b border-gaming-card">
            <div className="flex items-center space-x-3">
              <Skeleton className="w-12 h-12 rounded-lg bg-gaming-card" />
              <div>
                <Skeleton className="h-4 w-20 bg-gaming-card mb-1" />
                <Skeleton className="h-3 w-16 bg-gaming-card" />
              </div>
            </div>
          </div>
          
          <div className="p-4 space-y-2">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg bg-gaming-card" />
            ))}
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="flex-1 ml-64">
          {/* Header Skeleton */}
          <div className="bg-gaming-darker border-b border-gaming-card p-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-32 bg-gaming-card" />
              <div className="flex items-center space-x-4">
                <Skeleton className="h-10 w-80 rounded-lg bg-gaming-card" />
                <Skeleton className="h-10 w-10 rounded-lg bg-gaming-card" />
                <Skeleton className="h-10 w-20 rounded-lg bg-gaming-card" />
              </div>
            </div>
          </div>

          {/* Profile Content Skeleton */}
          <div className="p-6 space-y-6">
            {/* Profile Header Card */}
            <Card className="bg-gaming-card border-gaming-card-hover">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row items-start gap-6">
                  {/* Avatar */}
                  <Skeleton className="w-32 h-32 rounded-full bg-gaming-darker" />
                  
                  {/* Profile Info */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <Skeleton className="h-8 w-48 bg-gaming-darker mb-2" />
                      <Skeleton className="h-4 w-64 bg-gaming-darker mb-1" />
                      <Skeleton className="h-4 w-32 bg-gaming-darker" />
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Skeleton className="h-10 w-24 rounded-lg bg-gaming-darker" />
                      <Skeleton className="h-10 w-20 rounded-lg bg-gaming-darker" />
                    </div>
                    
                    {/* Level Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-24 bg-gaming-darker" />
                        <Skeleton className="h-4 w-32 bg-gaming-darker" />
                      </div>
                      <Skeleton className="h-3 w-full rounded-full bg-gaming-darker" />
                    </div>
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="text-center p-3 bg-gaming-darker rounded-lg">
                          <Skeleton className="h-6 w-8 bg-gaming-card mx-auto mb-1" />
                          <Skeleton className="h-3 w-12 bg-gaming-card mx-auto" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="bg-gaming-card border-gaming-card-hover">
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-32 bg-gaming-darker mb-4" />
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-full bg-gaming-darker" />
                      <Skeleton className="h-4 w-3/4 bg-gaming-darker" />
                      <Skeleton className="h-4 w-1/2 bg-gaming-darker" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Tabs Skeleton */}
            <Card className="bg-gaming-card border-gaming-card-hover">
              <CardContent className="p-6">
                <div className="flex space-x-4 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-20 rounded-lg bg-gaming-darker" />
                  ))}
                </div>
                
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="bg-gaming-darker border-gaming-card-hover">
                      <CardContent className="p-4">
                        <Skeleton className="h-4 w-3/4 bg-gaming-card mb-2" />
                        <Skeleton className="h-3 w-1/2 bg-gaming-card" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}