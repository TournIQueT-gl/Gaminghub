import { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Send, Users, MessageCircle, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ChatRoom {
  id: string;
  name: string;
  type: 'global' | 'dm' | 'group';
  lastMessage?: string;
  lastActivity?: string;
  unreadCount?: number;
  participants?: string[];
}

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  content: string;
  createdAt: string;
}

export default function Messages() {
  const [selectedRoom, setSelectedRoom] = useState<string>('global');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [rooms] = useState<ChatRoom[]>([
    {
      id: 'global',
      name: 'Global Chat',
      type: 'global',
      lastMessage: 'Welcome to GamingX!',
      lastActivity: new Date().toISOString(),
      unreadCount: 3,
    },
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { socket, isConnected, sendMessage, joinRoom, leaveRoom } = useWebSocket();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (socket && isConnected && selectedRoom) {
      joinRoom(selectedRoom);

      const handleMessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'chat_message':
              if (data.data.roomId === selectedRoom) {
                const chatMessage: ChatMessage = {
                  id: data.data.id || Date.now().toString(),
                  userId: data.data.userId,
                  username: data.data.username,
                  content: data.data.content,
                  createdAt: data.data.createdAt || new Date().toISOString(),
                };
                setMessages(prev => [...prev, chatMessage]);
              }
              break;
            case 'typing_start':
              // Handle typing indicators
              break;
            case 'typing_stop':
              // Handle typing indicators
              break;
          }
        } catch (error) {
          console.error('Error parsing chat message:', error);
        }
      };

      socket.addEventListener('message', handleMessage);
      return () => {
        socket.removeEventListener('message', handleMessage);
        leaveRoom(selectedRoom);
      };
    }
  }, [socket, isConnected, selectedRoom, joinRoom, leaveRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !isConnected || !selectedRoom) return;

    sendMessage({
      type: 'chat_message',
      data: {
        roomId: selectedRoom,
        content: newMessage.trim(),
      }
    });

    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleRoomSelect = (roomId: string) => {
    if (selectedRoom) {
      leaveRoom(selectedRoom);
    }
    setSelectedRoom(roomId);
    setMessages([]); // Clear messages when switching rooms
  };

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedRoomData = rooms.find(room => room.id === selectedRoom);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gaming-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-gaming-blue to-gaming-purple rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <p className="text-gaming-text-dim">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gaming-dark text-gaming-text">
      <div className="flex">
        <Sidebar />
        
        <div className="flex-1 ml-64">
          <Header title="Messages" />
          
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
              {/* Chat Rooms List */}
              <div className="lg:col-span-1">
                <Card className="bg-gaming-card border-gaming-card-hover h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white">Chats</CardTitle>
                      <Button size="sm" className="bg-gaming-blue hover:bg-blue-600">
                        New Chat
                      </Button>
                    </div>
                    
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gaming-text-dim" />
                      <Input
                        placeholder="Search chats..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-gaming-darker border-gaming-card-hover pl-10 text-sm focus:border-gaming-blue"
                      />
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-0">
                    <div className="space-y-1">
                      {filteredRooms.map((room) => (
                        <div
                          key={room.id}
                          onClick={() => handleRoomSelect(room.id)}
                          className={`flex items-center space-x-3 p-4 cursor-pointer transition-colors border-l-4 ${
                            selectedRoom === room.id
                              ? 'bg-gaming-card-hover border-gaming-blue'
                              : 'border-transparent hover:bg-gaming-card-hover/50'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            room.type === 'global' 
                              ? 'bg-gaming-blue/20' 
                              : 'bg-gaming-purple/20'
                          }`}>
                            {room.type === 'global' ? (
                              <Users className="w-5 h-5 text-gaming-blue" />
                            ) : (
                              <MessageCircle className="w-5 h-5 text-gaming-purple" />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-white truncate">{room.name}</h4>
                              {room.unreadCount && room.unreadCount > 0 && (
                                <span className="bg-gaming-red text-white text-xs px-2 py-1 rounded-full">
                                  {room.unreadCount}
                                </span>
                              )}
                            </div>
                            {room.lastMessage && (
                              <p className="text-gaming-text-dim text-sm truncate">
                                {room.lastMessage}
                              </p>
                            )}
                            {room.lastActivity && (
                              <p className="text-gaming-text-dim text-xs">
                                {formatDistanceToNow(new Date(room.lastActivity), { addSuffix: true })}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Chat Messages */}
              <div className="lg:col-span-3">
                <Card className="bg-gaming-card border-gaming-card-hover h-full flex flex-col">
                  {selectedRoomData && (
                    <CardHeader className="border-b border-gaming-card-hover">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            selectedRoomData.type === 'global' 
                              ? 'bg-gaming-blue/20' 
                              : 'bg-gaming-purple/20'
                          }`}>
                            {selectedRoomData.type === 'global' ? (
                              <Users className="w-5 h-5 text-gaming-blue" />
                            ) : (
                              <MessageCircle className="w-5 h-5 text-gaming-purple" />
                            )}
                          </div>
                          <div>
                            <CardTitle className="text-white">{selectedRoomData.name}</CardTitle>
                            <p className="text-gaming-text-dim text-sm">
                              {isConnected ? 'Connected' : 'Connecting...'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-gaming-emerald animate-pulse' : 'bg-gaming-red'}`}></div>
                          <span className="text-xs text-gaming-text-dim">
                            {isConnected ? 'Online' : 'Offline'}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                  )}
                  
                  {/* Messages Area */}
                  <CardContent className="flex-1 p-4 overflow-y-auto scrollbar-gaming">
                    <div className="space-y-4">
                      {messages.length > 0 ? (
                        messages.map((message) => (
                          <div key={message.id} className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-gaming-purple/20 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-bold text-gaming-purple">
                                {message.username[0].toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium text-white text-sm">
                                  {message.username}
                                  {message.userId === user?.id && (
                                    <span className="text-gaming-blue ml-1">(You)</span>
                                  )}
                                </span>
                                <span className="text-xs text-gaming-text-dim">
                                  {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                                </span>
                              </div>
                              <p className="text-gaming-text text-sm break-words">
                                {message.content}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <MessageCircle className="w-12 h-12 text-gaming-text-dim mx-auto mb-4" />
                          <p className="text-gaming-text-dim">
                            {isConnected 
                              ? 'No messages yet. Start the conversation!' 
                              : 'Connecting to chat...'
                            }
                          </p>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </CardContent>
                  
                  {/* Message Input */}
                  <div className="p-4 border-t border-gaming-card-hover">
                    <div className="flex items-center space-x-3">
                      <Input
                        placeholder={isConnected ? "Type a message..." : "Connecting..."}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={!isConnected}
                        className="flex-1 bg-gaming-darker border-gaming-card-hover rounded-lg focus:border-gaming-blue transition-colors"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || !isConnected}
                        className="bg-gaming-blue hover:bg-blue-600 text-white"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
