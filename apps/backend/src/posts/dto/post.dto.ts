import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsBoolean, IsUrl, MaxLength } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ description: 'Post content', maxLength: 2000 })
  @IsString()
  @MaxLength(2000)
  content: string;

  @ApiProperty({ required: false, description: 'Image URL' })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiProperty({ required: false, description: 'Post hashtags', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hashtags?: string[];

  @ApiProperty({ required: false, default: true, description: 'Is post public' })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class UpdatePostDto {
  @ApiProperty({ required: false, maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  content?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hashtags?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class CreateCommentDto {
  @ApiProperty({ description: 'Comment content', maxLength: 1000 })
  @IsString()
  @MaxLength(1000)
  content: string;
}