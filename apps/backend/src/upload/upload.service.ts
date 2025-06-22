import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(private configService: ConfigService) {}

  async uploadImage(file: Express.Multer.File): Promise<{ url: string }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed');
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size too large. Maximum size is 5MB');
    }

    try {
      // For development, we'll use a simple file URL
      // In production, you would integrate with Cloudinary or similar service
      const filename = `${Date.now()}-${Math.random().toString(36).substring(2)}-${file.originalname}`;
      const publicUrl = `${this.configService.get('FRONTEND_URL')}/uploads/${filename}`;

      this.logger.log(`Image uploaded: ${filename}`);

      return {
        url: publicUrl,
      };
    } catch (error) {
      this.logger.error('Failed to upload image', error);
      throw new BadRequestException('Failed to upload image');
    }
  }
}