import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CreateRoomDto, SendMessageDto } from './dto/chat.dto';

@ApiTags('chat')
@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('rooms')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new chat room' })
  @ApiResponse({ status: 201, description: 'Chat room created successfully' })
  async createRoom(
    @GetUser('id') userId: string,
    @Body() createRoomDto: CreateRoomDto,
  ) {
    return this.chatService.createRoom(userId, createRoomDto);
  }

  @Get('rooms')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user chat rooms' })
  @ApiResponse({ status: 200, description: 'Chat rooms retrieved successfully' })
  async getUserRooms(@GetUser('id') userId: string) {
    return this.chatService.getUserRooms(userId);
  }

  @Get('rooms/search')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Search chat rooms' })
  @ApiQuery({ name: 'q', description: 'Search query' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'Search results retrieved' })
  async searchRooms(
    @Query('q') query: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.chatService.searchRooms(query, page, limit);
  }

  @Get('rooms/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get chat room details' })
  @ApiResponse({ status: 200, description: 'Chat room retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Chat room not found' })
  async getRoom(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('id') userId: string,
  ) {
    return this.chatService.getRoomById(id, userId);
  }

  @Post('rooms/:id/join')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Join a chat room' })
  @ApiResponse({ status: 201, description: 'Joined room successfully' })
  @ApiResponse({ status: 403, description: 'Cannot join this room' })
  async joinRoom(
    @GetUser('id') userId: string,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.chatService.joinRoom(userId, id);
  }

  @Delete('rooms/:id/leave')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Leave a chat room' })
  @ApiResponse({ status: 200, description: 'Left room successfully' })
  @ApiResponse({ status: 404, description: 'Not a member of this room' })
  async leaveRoom(
    @GetUser('id') userId: string,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.chatService.leaveRoom(userId, id);
  }

  @Get('rooms/:id/messages')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get chat room messages' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully' })
  async getRoomMessages(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('id') userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return this.chatService.getRoomMessages(id, userId, page, limit);
  }

  @Post('rooms/:id/messages')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send message to chat room' })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  @ApiResponse({ status: 403, description: 'Not a member of this room' })
  async sendMessage(
    @GetUser('id') userId: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() sendMessageDto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(userId, id, sendMessageDto);
  }

  @Post('dm/:userId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create or get direct message room' })
  @ApiResponse({ status: 201, description: 'DM room created or retrieved' })
  async createDirectMessage(
    @GetUser('id') userId: string,
    @Param('userId') targetUserId: string,
  ) {
    return this.chatService.createDirectMessage(userId, targetUserId);
  }
}