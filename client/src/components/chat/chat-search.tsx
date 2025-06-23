import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ChatSearchProps {
  roomId: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatSearch({ roomId, isOpen, onClose }: ChatSearchProps) {
  const [query, setQuery] = useState("");

  const { data: searchResults, isLoading } = useQuery({
    queryKey: [`/api/chat/rooms/${roomId}/search`, query],
    queryFn: async () => {
      if (!query.trim()) return [];
      const response = await fetch(`/api/chat/rooms/${roomId}/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Failed to search messages');
      return response.json();
    },
    enabled: !!query.trim(),
  });

  if (!isOpen) return null;

  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 bg-gaming-card border-l border-gaming-card-hover z-50">
      {/* Header */}
      <div className="p-4 border-b border-gaming-card-hover">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gaming-text-dim" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search messages..."
              className="pl-10 bg-gaming-darker border-gaming-card-hover text-white"
              autoFocus
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gaming-text-dim hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Results */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-gaming-blue border-t-transparent rounded-full" />
            </div>
          ) : query.trim() && searchResults?.length === 0 ? (
            <div className="text-center py-8 text-gaming-text-dim">
              <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No messages found</p>
              <p className="text-sm">Try different keywords</p>
            </div>
          ) : (
            <div className="space-y-4">
              {searchResults?.map((message: any) => (
                <div
                  key={message.id}
                  className="p-3 rounded-lg bg-gaming-darker border border-gaming-card-hover hover:border-gaming-blue/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={message.user.profileImageUrl} />
                      <AvatarFallback className="bg-gaming-card text-white text-xs">
                        {message.user.username[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-white">
                          {message.user.username}
                        </span>
                        <span className="text-xs text-gaming-text-dim">
                          {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gaming-text break-words">
                        {message.content}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}