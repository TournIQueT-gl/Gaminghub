import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { validateImageFile, compressImage } from "@/utils/profileUtils";

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

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast({
        title: "Invalid file",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    try {
      // Compress image
      const compressedDataUrl = await compressImage(file);
      setPreviewImage(compressedDataUrl);
      onImageUpdate?.(compressedDataUrl);
      
      toast({
        title: "Profile image updated",
        description: "Your profile picture has been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to process image. Please try again.",
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
      <div className="absolute top-0 right-0 w-6 h-6 bg-gaming-emerald rounded-full border-4 border-gaming-card shadow-lg"></div>
    </div>
  );
}