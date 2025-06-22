import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsUrl, MaxLength, MinLength, IsEnum } from 'class-validator';
import { ClanRole } from '@prisma/client';

export class CreateClanDto {
  @ApiProperty({ description: 'Clan name', minLength: 3, maxLength: 50 })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  name: string;

  @ApiProperty({ required: false, description: 'Clan description', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ required: false, description: 'Clan logo URL' })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiProperty({ required: false, default: true, description: 'Is clan public' })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class UpdateClanDto {
  @ApiProperty({ required: false, minLength: 3, maxLength: 50 })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  name?: string;

  @ApiProperty({ required: false, maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class UpdateMemberRoleDto {
  @ApiProperty({ enum: ClanRole, description: 'New role for the member' })
  @IsEnum(ClanRole)
  role: ClanRole;
}