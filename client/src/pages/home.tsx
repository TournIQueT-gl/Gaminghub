import { useEffect, useState } from "react";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import CreatePost from "@/components/create-post";
import PostCard from "@/components/post-card";
import TournamentWidget from "@/components/tournament-widget";
import ClanWidget from "@/components/clan-widget";
import ChatWidget from "@/components/chat-widget";
import { LoadingPage } from "@/components/loading-spinner";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { checkGuestLimitation, GUEST_LIMITATIONS } from "@/lib/authUtils";
import GuestLimitationBanner from "@/components/guest-limitation-banner";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isGuest, isLoading } = useAuth();

  const { data: posts, isLoading: postsLoading, error } = useQuery({
    queryKey: ['/api/posts'],
    retry: false,
    staleTime: 30000,
  });

  // Limit posts for guests
  const displayPosts = isGuest && posts ? posts.slice(0, GUEST_LIMITATIONS.maxViewableItems) : posts;

  if (isLoading) {
    return <LoadingPage text="Loading GamingX..." />;
  }

  return (
    <div className="min-h-screen bg-gaming-dark text-gaming-text">
      <div className="flex">
        <Sidebar />
        
        <div className="flex-1 ml-64">
          <Header title="Gaming Feed" />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            {/* Main Feed */}
            <div className="lg:col-span-2 space-y-6">
              <CreatePost />
              
              {postsLoading ? (
                <div className="space-y-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-gaming-card rounded-xl p-6 border border-gaming-card-hover">
                      <div className="flex items-center space-x-3 mb-4">
                        <Skeleton className="w-12 h-12 rounded-lg bg-gaming-darker" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32 bg-gaming-darker" />
                          <Skeleton className="h-3 w-24 bg-gaming-darker" />
                        </div>
                      </div>
                      <Skeleton className="h-4 w-full mb-2 bg-gaming-darker" />
                      <Skeleton className="h-4 w-3/4 mb-4 bg-gaming-darker" />
                      <Skeleton className="h-40 w-full rounded-xl bg-gaming-darker" />
                    </div>
                  ))}
                </div>
              ) : posts && posts.length > 0 ? (
                <div className="space-y-6">
                  {posts.map((post: any) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <div className="bg-gaming-card rounded-xl p-12 border border-gaming-card-hover text-center">
                  <div className="w-16 h-16 bg-gaming-blue/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gaming-blue" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">No posts yet</h3>
                  <p className="text-gaming-text-dim">Be the first to share your gaming moments with the community!</p>
                </div>
              )}
            </div>
            
            {/* Right Sidebar */}
            <div className="space-y-6">
              <TournamentWidget />
              <ClanWidget />
              <ChatWidget />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
