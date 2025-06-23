import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProfileAvatarUploadProps {
  currentImage?: string;
  username?: string;
  onImageUpdate?: (imageUrl: string) => void;
  editable?: boolean;
}

export default function ProfileAvatarUpload({ 
  currentImage, 
  username, 
  onImageUpdate, 
  editable = false 
}: ProfileAvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewImage(result);
        
        // For demo purposes, we'll use the preview as the final image
        // In a real app, you'd upload to a service like AWS S3, Cloudinary, etc.
        onImageUpdate?.(result);
        
        toast({
          title: "Profile image updated",
          description: "Your profile picture has been updated successfully",
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    onImageUpdate?.('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    toast({
      title: "Profile image removed",
      description: "Your profile picture has been removed",
    });
  };

  const displayImage = previewImage || currentImage;

  return (
    <div className="relative">
      <Avatar className="w-32 h-32 border-4 border-gaming-card shadow-xl">
        <AvatarImage src={displayImage} />
        <AvatarFallback className="bg-gaming-darker text-white text-4xl">
          {username?.[0]?.toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>

      {editable && (
        <>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute -bottom-2 -right-2 w-10 h-10 bg-gaming-purple hover:bg-purple-600 text-white rounded-full shadow-lg"
          >
            {uploading ? (
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Camera className="w-5 h-5" />
            )}
          </Button>

          {displayImage && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg"
            >
              <X className="w-4 h-4" />
            </Button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </>
      )}

      {/* Online Status Indicator */}
      <div className="absolute top-2 right-2 w-6 h-6 bg-gaming-emerald rounded-full border-4 border-gaming-card"></div>
    </div>
  );
}