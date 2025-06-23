import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  MoreVertical, 
  Reply, 
  Edit2, 
  Trash2, 
  Smile,
  Copy,
  CheckCheck,
  Check
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";

interface Message {
  id: number;
  content: string;
  userId: string;
  messageType: string;
  isEdited: boolean;
  editedAt?: string;
  reactions: Array<{ emoji: string; userIds: string[] }>;
  replyTo?: {
    id: number;
    content: string;
    user: { username: string };
  };
  user: {
    id: string;
    username: string;
    profileImageUrl?: string;
  };
  createdAt: string;
}

interface MessageListProps {
  roomId: number;
  currentUserId: string;
  onReply: (message: Message) => void;
  onEdit: (message: Message) => void;
}

const EMOJI_REACTIONS = ['👍', '❤️', '😂', '😢', '😮', '😡'];

export default function MessageList({ roomId, currentUserId, onReply, onEdit }: MessageListProps) {
  const [selectedMessage, setSelectedMessage] = useState<number | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { data: messages, isLoading } = useQuery({
    queryKey: [`/api/chat/rooms/${roomId}/messages`],
    queryFn: async () => {
      const response = await fetch(`/api/chat/rooms/${roomId}/messages`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      return response.json();
    },
    refetchInterval: 2000, // Poll for new messages
  });

  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: number) => {
      const response = await apiRequest('DELETE', `/api/chat/messages/${messageId}`);
      if (!response.ok) throw new Error('Failed to delete message');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/chat/rooms/${roomId}/messages`] });
      toast({ title: "Message deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete message", variant: "destructive" });
    }
  });

  const addReactionMutation = useMutation({
    mutationFn: async ({ messageId, emoji }: { messageId: number; emoji: string }) => {
      const response = await apiRequest('POST', `/api/chat/messages/${messageId}/reactions`, { emoji });
      if (!response.ok) throw new Error('Failed to add reaction');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/chat/rooms/${roomId}/messages`] });
    }
  });

  const removeReactionMutation = useMutation({
    mutationFn: async ({ messageId, emoji }: { messageId: number; emoji: string }) => {
      const response = await apiRequest('DELETE', `/api/chat/messages/${messageId}/reactions/${emoji}`);
      if (!response.ok) throw new Error('Failed to remove reaction');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/chat/rooms/${roomId}/messages`] });
    }
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleReaction = (messageId: number, emoji: string) => {
    const message = messages?.find((m: Message) => m.id === messageId);
    const reaction = message?.reactions?.find(r => r.emoji === emoji);
    
    if (reaction?.userIds.includes(currentUserId)) {
      removeReactionMutation.mutate({ messageId, emoji });
    } else {
      addReactionMutation.mutate({ messageId, emoji });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin w-6 h-6 border-2 border-gaming-blue border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages?.map((message: Message, index: number) => {
          const isOwn = message.userId === currentUserId;
          const showAvatar = index === 0 || messages[index - 1]?.userId !== message.userId;
          const reactions = message.reactions || [];

          return (
            <div
              key={message.id}
              className={`flex gap-3 group ${isOwn ? 'flex-row-reverse' : ''}`}
              onMouseEnter={() => setSelectedMessage(message.id)}
              onMouseLeave={() => setSelectedMessage(null)}
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                {showAvatar ? (
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={message.user.profileImageUrl} />
                    <AvatarFallback className="bg-gaming-darker text-white text-xs">
                      {message.user.username[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="w-8 h-8" />
                )}
              </div>

              {/* Message Content */}
              <div className={`flex-1 max-w-[70%] ${isOwn ? 'text-right' : ''}`}>
                {/* Username and timestamp */}
                {showAvatar && (
                  <div className={`flex items-center gap-2 mb-1 text-xs text-gaming-text-dim ${isOwn ? 'justify-end' : ''}`}>
                    <span className="font-medium text-white">{message.user.username}</span>
                    <span>{formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}</span>
                  </div>
                )}

                {/* Reply indicator */}
                {message.replyTo && (
                  <div className={`mb-2 p-2 border-l-2 border-gaming-blue bg-gaming-darker/50 rounded text-xs ${isOwn ? 'border-r-2 border-l-0 text-right' : ''}`}>
                    <div className="text-gaming-blue font-medium">{message.replyTo.user.username}</div>
                    <div className="text-gaming-text-dim truncate">{message.replyTo.content}</div>
                  </div>
                )}

                {/* Message bubble */}
                <div className="relative">
                  <div
                    className={`p-3 rounded-lg break-words ${
                      isOwn 
                        ? 'bg-gaming-blue text-white' 
                        : 'bg-gaming-card border border-gaming-card-hover text-white'
                    }`}
                  >
                    {message.content}
                    {message.isEdited && (
                      <span className="text-xs opacity-70 ml-2">(edited)</span>
                    )}
                  </div>

                  {/* Message actions */}
                  {selectedMessage === message.id && (
                    <div className={`absolute top-0 flex gap-1 ${isOwn ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onReply(message)}
                        className="h-6 w-6 p-0 hover:bg-gaming-card"
                      >
                        <Reply className="w-3 h-3" />
                      </Button>

                      {/* Emoji reactions */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-gaming-card"
                          >
                            <Smile className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-gaming-card border-gaming-card-hover">
                          <div className="grid grid-cols-6 gap-1 p-2">
                            {EMOJI_REACTIONS.map(emoji => (
                              <Button
                                key={emoji}
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReaction(message.id, emoji)}
                                className="h-8 w-8 p-0 text-lg hover:bg-gaming-card-hover"
                              >
                                {emoji}
                              </Button>
                            ))}
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {/* More actions */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-gaming-card"
                          >
                            <MoreVertical className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-gaming-card border-gaming-card-hover">
                          <DropdownMenuItem onClick={() => copyToClipboard(message.content)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Text
                          </DropdownMenuItem>
                          {isOwn && (
                            <>
                              <DropdownMenuItem onClick={() => onEdit(message)}>
                                <Edit2 className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => deleteMessageMutation.mutate(message.id)}
                                className="text-red-400"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>

                {/* Reactions */}
                {reactions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {reactions.map(reaction => (
                      <Tooltip key={reaction.emoji}>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReaction(message.id, reaction.emoji)}
                            className={`h-6 px-2 text-xs ${
                              reaction.userIds.includes(currentUserId) 
                                ? 'bg-gaming-blue/20 border border-gaming-blue' 
                                : 'bg-gaming-darker border border-gaming-card-hover'
                            }`}
                          >
                            {reaction.emoji} {reaction.userIds.length}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{reaction.userIds.length} reaction{reaction.userIds.length !== 1 ? 's' : ''}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
          <div ref={lastMessageRef} />
        </div>
      </ScrollArea>
    </TooltipProvider>
  );
}