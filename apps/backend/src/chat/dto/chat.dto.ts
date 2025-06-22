import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsInt } from 'class-validator';
import { ChatRoomType, MessageType } from '@prisma/client';

export class CreateRoomDto {
  @ApiProperty({ required: false, description: 'Room name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ enum: ChatRoomType, description: 'Room type' })
  @IsEnum(ChatRoomType)
  type: ChatRoomType;

  @ApiProperty({ required: false, description: 'Clan ID for clan rooms' })
  @IsOptional()
  @IsInt()
  clanId?: number;

  @ApiProperty({ required: false, description: 'Tournament ID for tournament rooms' })
  @IsOptional()
  @IsInt()
  tournamentId?: number;
}

export class SendMessageDto {
  @ApiProperty({ description: 'Message content' })
  @IsString()
  content: string;

  @ApiProperty({ required: false, enum: MessageType, default: MessageType.TEXT })
  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType;
}