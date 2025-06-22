import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  content: string;
  createdAt: string;
}

export default function ChatWidget() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [onlineCount, setOnlineCount] = useState(127);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { socket, isConnected, sendMessage, joinRoom } = useWebSocket();
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (socket && isConnected) {
      // Join global chat room
      joinRoom('global');

      // Listen for chat messages
      const handleMessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'chat_message':
              const chatMessage: ChatMessage = {
                id: data.data.id || Date.now().toString(),
                userId: data.data.userId,
                username: data.data.username,
                content: data.data.content,
                createdAt: data.data.createdAt || new Date().toISOString(),
              };
              setMessages(prev => [...prev, chatMessage]);
              break;
            case 'user_joined':
              setOnlineCount(prev => prev + 1);
              break;
            case 'user_left':
              setOnlineCount(prev => Math.max(0, prev - 1));
              break;
          }
        } catch (error) {
          console.error('Error parsing chat message:', error);
        }
      };

      socket.addEventListener('message', handleMessage);
      return () => socket.removeEventListener('message', handleMessage);
    }
  }, [socket, isConnected, joinRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !isConnected) return;

    sendMessage({
      type: 'chat_message',
      data: {
        roomId: 'global',
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

  return (
    <Card className="bg-gaming-card border-gaming-card-hover">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Global Chat</CardTitle>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-gaming-emerald animate-pulse' : 'bg-gaming-red'}`}></div>
            <span className="text-xs text-gaming-text-dim">{onlineCount} online</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Chat Messages */}
        <div className="h-64 overflow-y-auto scrollbar-hidden p-4 space-y-3">
          {messages.length > 0 ? (
            messages.map((message) => (
              <div key={message.id} className="flex items-start space-x-2">
                <div className="w-6 h-6 bg-gaming-purple/20 rounded flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-gaming-purple">
                    {message.username[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-white text-xs truncate">
                      {message.username}
                    </span>
                    <span className="text-xs text-gaming-text-dim">
                      {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-gaming-text text-xs mt-1 break-words">
                    {message.content}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="text-gaming-text-dim text-sm">
                {isConnected ? 'No messages yet. Start the conversation!' : 'Connecting to chat...'}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-gaming-card-hover">
          <div className="flex items-center space-x-2">
            <Input
              placeholder={isConnected ? "Type a message..." : "Connecting..."}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={!isConnected}
              className="flex-1 bg-gaming-darker border-gaming-card-hover rounded-lg text-sm focus:border-gaming-blue transition-colors"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || !isConnected}
              size="icon"
              className="bg-gaming-blue hover:bg-blue-600 text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
