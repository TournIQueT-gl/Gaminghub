import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Send, 
  Paperclip, 
  X, 
  Image as ImageIcon,
  File,
  Smile
} from "lucide-react";

interface Message {
  id: number;
  content: string;
  user: { username: string };
}

interface MessageInputProps {
  roomId: number;
  replyingTo?: Message | null;
  editingMessage?: Message | null;
  onCancelReply: () => void;
  onCancelEdit: () => void;
}

export default function MessageInput({ 
  roomId, 
  replyingTo, 
  editingMessage,
  onCancelReply, 
  onCancelEdit 
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Set editing message content
  useEffect(() => {
    if (editingMessage) {
      setMessage(editingMessage.content);
      textareaRef.current?.focus();
    }
  }, [editingMessage]);

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      const endpoint = editingMessage 
        ? `/api/chat/messages/${editingMessage.id}`
        : `/api/chat/rooms/${roomId}/messages`;
      
      const method = editingMessage ? 'PATCH' : 'POST';
      const response = await apiRequest(method, endpoint, messageData);
      
      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/chat/rooms/${roomId}/messages`] });
      setMessage("");
      setAttachments([]);
      onCancelReply();
      onCancelEdit();
      
      if (editingMessage) {
        toast({ title: "Message updated" });
      }
    },
    onError: (error) => {
      toast({ 
        title: "Failed to send message", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() && attachments.length === 0) return;

    const messageData: any = {
      content: message.trim(),
      replyToId: replyingTo?.id || null,
    };

    // Handle file attachments (convert to base64 for demo)
    if (attachments.length > 0) {
      const attachmentData = await Promise.all(
        attachments.map(async (file) => {
          const base64 = await fileToBase64(file);
          return {
            name: file.name,
            type: file.type,
            size: file.size,
            data: base64,
          };
        })
      );
      messageData.attachments = attachmentData;
      messageData.messageType = 'file';
    }

    sendMessageMutation.mutate(messageData);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate file sizes (max 10MB per file)
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 10MB`,
          variant: "destructive"
        });
        return false;
      }
      return true;
    });

    setAttachments(prev => [...prev, ...validFiles].slice(0, 5)); // Max 5 files
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
    
    if (e.key === 'Escape') {
      if (replyingTo) onCancelReply();
      if (editingMessage) onCancelEdit();
    }
  };

  return (
    <div className="p-4 border-t border-gaming-card-hover bg-gaming-card">
      {/* Reply indicator */}
      {replyingTo && (
        <div className="mb-3 p-3 bg-gaming-darker rounded-lg border-l-4 border-gaming-blue">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gaming-blue font-medium">
                Replying to {replyingTo.user.username}
              </div>
              <div className="text-sm text-gaming-text-dim truncate">
                {replyingTo.content}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancelReply}
              className="text-gaming-text-dim hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Edit indicator */}
      {editingMessage && (
        <div className="mb-3 p-3 bg-gaming-darker rounded-lg border-l-4 border-gaming-emerald">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gaming-emerald font-medium">
              Editing message
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancelEdit}
              className="text-gaming-text-dim hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Attachments */}
      {attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachments.map((file, index) => (
            <Badge
              key={index}
              variant="outline"
              className="bg-gaming-darker border-gaming-card-hover text-white pr-1"
            >
              <div className="flex items-center gap-2">
                {file.type.startsWith('image/') ? (
                  <ImageIcon className="w-3 h-3" />
                ) : (
                  <File className="w-3 h-3" />
                )}
                <span className="text-xs truncate max-w-20">{file.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAttachment(index)}
                  className="h-4 w-4 p-0 hover:bg-red-500/20"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </Badge>
          ))}
        </div>
      )}

      {/* Message input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              editingMessage 
                ? "Edit your message..." 
                : "Type a message..."
            }
            className="bg-gaming-darker border-gaming-card-hover text-white resize-none min-h-[44px] max-h-32 pr-20"
            rows={1}
          />
          
          {/* Attachment button */}
          <div className="absolute right-2 top-2 flex gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="h-8 w-8 p-0 text-gaming-text-dim hover:text-white"
            >
              <Paperclip className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={(!message.trim() && attachments.length === 0) || sendMessageMutation.isPending}
          className="bg-gaming-blue hover:bg-blue-600 self-end"
        >
          {sendMessageMutation.isPending ? (
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt"
        />
      </form>

      <div className="mt-2 text-xs text-gaming-text-dim">
        Press Enter to send, Shift+Enter for new line
        {editingMessage && " • Press Escape to cancel editing"}
        {replyingTo && " • Press Escape to cancel reply"}
      </div>
    </div>
  );
}