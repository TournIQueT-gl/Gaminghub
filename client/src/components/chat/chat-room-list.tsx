import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  Users,
  MessageCircle,
  Settings,
  Hash,
  Crown,
  Shield
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ChatRoom {
  id: number;
  name: string;
  type: string;
  memberCount: number;
  unreadCount: number;
  lastMessage?: {
    content: string;
    createdAt: string;
    user: { username: string };
  };
  otherUser?: {
    id: string;
    username: string;
    profileImageUrl?: string;
  };
}

interface ChatRoomListProps {
  currentUserId: string;
  activeRoomId?: number;
}

export default function ChatRoomList({ currentUserId, activeRoomId }: ChatRoomListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const { toast } = useToast();

  const { data: rooms, isLoading } = useQuery({
    queryKey: [`/api/chat/rooms`],
    queryFn: async () => {
      const response = await fetch('/api/chat/rooms');
      if (!response.ok) throw new Error('Failed to fetch chat rooms');
      return response.json();
    },
    refetchInterval: 5000, // Poll for updates
  });

  const { data: users } = useQuery({
    queryKey: [`/api/users`],
    queryFn: async () => {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
  });

  const createGroupMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await apiRequest('POST', '/api/chat/rooms', {
        name,
        type: 'group',
        isPrivate: false,
      });
      if (!response.ok) throw new Error('Failed to create group');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/chat/rooms`] });
      setNewGroupName("");
      setShowCreateGroup(false);
      toast({ title: "Group created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create group", variant: "destructive" });
    }
  });

  const startDirectChatMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest('POST', '/api/chat/direct', { userId });
      if (!response.ok) throw new Error('Failed to start chat');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/chat/rooms`] });
      // Navigate to the new room (you might want to use a navigation callback)
    },
    onError: () => {
      toast({ title: "Failed to start chat", variant: "destructive" });
    }
  });

  const filteredRooms = rooms?.filter((room: ChatRoom) => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    if (room.type === 'direct' && room.otherUser) {
      return room.otherUser.username.toLowerCase().includes(searchLower);
    }
    return room.name?.toLowerCase().includes(searchLower);
  });

  const getRoomDisplayName = (room: ChatRoom) => {
    if (room.type === 'direct' && room.otherUser) {
      return room.otherUser.username;
    }
    return room.name || 'Unnamed Group';
  };

  const getRoomIcon = (room: ChatRoom) => {
    if (room.type === 'direct') {
      return room.otherUser ? (
        <Avatar className="w-8 h-8">
          <AvatarImage src={room.otherUser.profileImageUrl} />
          <AvatarFallback className="bg-gaming-darker text-white text-xs">
            {room.otherUser.username[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ) : (
        <MessageCircle className="w-8 h-8 p-2 bg-gaming-darker rounded-full text-gaming-blue" />
      );
    }
    
    return room.type === 'group' ? (
      <Users className="w-8 h-8 p-2 bg-gaming-darker rounded-full text-gaming-purple" />
    ) : (
      <Hash className="w-8 h-8 p-2 bg-gaming-darker rounded-full text-gaming-emerald" />
    );
  };

  if (isLoading) {
    return (
      <div className="w-80 bg-gaming-card border-r border-gaming-card-hover p-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gaming-darker rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="w-20 h-3 bg-gaming-darker rounded" />
                <div className="w-32 h-2 bg-gaming-darker rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-gaming-card border-r border-gaming-card-hover flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gaming-card-hover">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Messages</h2>
          <div className="flex gap-2">
            {/* Start Direct Chat */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MessageCircle className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gaming-card border-gaming-card-hover">
                <DialogHeader>
                  <DialogTitle className="text-white">Start a Chat</DialogTitle>
                  <DialogDescription>
                    Choose a user to start a direct conversation with.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {users?.filter((user: any) => user.id !== currentUserId).map((user: any) => (
                    <Button
                      key={user.id}
                      variant="ghost"
                      onClick={() => startDirectChatMutation.mutate(user.id)}
                      className="w-full justify-start gap-3 p-3"
                    >
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={user.profileImageUrl} />
                        <AvatarFallback className="bg-gaming-darker text-white text-xs">
                          {user.username[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-white">{user.username}</span>
                    </Button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>

            {/* Create Group */}
            <Dialog open={showCreateGroup} onOpenChange={setShowCreateGroup}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gaming-card border-gaming-card-hover">
                <DialogHeader>
                  <DialogTitle className="text-white">Create Group</DialogTitle>
                  <DialogDescription>
                    Create a new group chat.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Group name"
                    className="bg-gaming-darker border-gaming-card-hover text-white"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => createGroupMutation.mutate(newGroupName)}
                      disabled={!newGroupName.trim() || createGroupMutation.isPending}
                      className="bg-gaming-blue hover:bg-blue-600"
                    >
                      Create
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowCreateGroup(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gaming-text-dim" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="pl-10 bg-gaming-darker border-gaming-card-hover text-white"
          />
        </div>
      </div>

      {/* Room List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredRooms?.length === 0 ? (
            <div className="text-center py-8 text-gaming-text-dim">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No conversations yet</p>
              <p className="text-sm">Start a chat to get going!</p>
            </div>
          ) : (
            filteredRooms?.map((room: ChatRoom) => (
              <Link key={room.id} href={`/messages/${room.id}`}>
                <div
                  className={`p-3 rounded-lg mb-1 cursor-pointer transition-colors hover:bg-gaming-card-hover ${
                    activeRoomId === room.id ? 'bg-gaming-blue/20 border border-gaming-blue' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {getRoomIcon(room)}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-white truncate">
                          {getRoomDisplayName(room)}
                        </h3>
                        <div className="flex items-center gap-1">
                          {room.unreadCount > 0 && (
                            <Badge className="bg-gaming-blue text-white text-xs">
                              {room.unreadCount > 99 ? '99+' : room.unreadCount}
                            </Badge>
                          )}
                          {room.lastMessage && (
                            <span className="text-xs text-gaming-text-dim">
                              {formatDistanceToNow(new Date(room.lastMessage.createdAt), { addSuffix: true })}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-xs text-gaming-text-dim">
                          <Users className="w-3 h-3" />
                          {room.memberCount}
                        </div>
                        
                        {room.lastMessage && (
                          <p className="text-sm text-gaming-text-dim truncate flex-1">
                            <span className="font-medium">{room.lastMessage.user.username}:</span> {room.lastMessage.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}