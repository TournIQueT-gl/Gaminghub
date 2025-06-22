import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { ChatService } from './chat.service';
import { PrismaService } from '../prisma/prisma.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  path: '/ws',
})
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private connectedUsers = new Map<string, AuthenticatedSocket[]>();

  constructor(
    private readonly chatService: ChatService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract token from handshake auth
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');
      
      if (!token) {
        this.logger.warn('Client connected without token');
        client.emit('error', 'Authentication required');
        client.disconnect();
        return;
      }

      // Verify JWT token
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET') || 'gamingx-secret-key',
      });

      // Get user details
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          isActive: true,
        },
      });

      if (!user || !user.isActive) {
        this.logger.warn(`Invalid user attempted connection: ${payload.sub}`);
        client.emit('error', 'Invalid user');
        client.disconnect();
        return;
      }

      // Attach user info to socket
      client.userId = user.id;
      client.username = user.username || user.firstName || 'Anonymous';

      // Track connected user
      const userSockets = this.connectedUsers.get(user.id) || [];
      userSockets.push(client);
      this.connectedUsers.set(user.id, userSockets);

      this.logger.log(`User ${client.username} (${user.id}) connected`);
      
      // Emit successful connection
      client.emit('connected', {
        userId: user.id,
        username: client.username,
      });

      // Notify other users about online status
      client.broadcast.emit('user_online', {
        userId: user.id,
        username: client.username,
      });

    } catch (error) {
      this.logger.error('Authentication failed:', error.message);
      client.emit('error', 'Authentication failed');
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      const userSockets = this.connectedUsers.get(client.userId) || [];
      const updatedSockets = userSockets.filter(socket => socket.id !== client.id);
      
      if (updatedSockets.length === 0) {
        this.connectedUsers.delete(client.userId);
        // Notify others that user went offline
        client.broadcast.emit('user_offline', {
          userId: client.userId,
          username: client.username,
        });
      } else {
        this.connectedUsers.set(client.userId, updatedSockets);
      }

      this.logger.log(`User ${client.username} (${client.userId}) disconnected`);
    }
  }

  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: number },
  ) {
    if (!client.userId) {
      client.emit('error', 'Not authenticated');
      return;
    }

    try {
      await this.chatService.joinRoom(client.userId, data.roomId);
      client.join(`room_${data.roomId}`);
      
      client.emit('joined_room', { roomId: data.roomId });
      client.to(`room_${data.roomId}`).emit('user_joined_room', {
        roomId: data.roomId,
        userId: client.userId,
        username: client.username,
      });

      this.logger.log(`User ${client.username} joined room ${data.roomId}`);
    } catch (error) {
      client.emit('error', error.message);
    }
  }

  @SubscribeMessage('leave_room')
  async handleLeaveRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: number },
  ) {
    if (!client.userId) {
      client.emit('error', 'Not authenticated');
      return;
    }

    try {
      await this.chatService.leaveRoom(client.userId, data.roomId);
      client.leave(`room_${data.roomId}`);
      
      client.emit('left_room', { roomId: data.roomId });
      client.to(`room_${data.roomId}`).emit('user_left_room', {
        roomId: data.roomId,
        userId: client.userId,
        username: client.username,
      });

      this.logger.log(`User ${client.username} left room ${data.roomId}`);
    } catch (error) {
      client.emit('error', error.message);
    }
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: number; content: string; type?: string },
  ) {
    if (!client.userId) {
      client.emit('error', 'Not authenticated');
      return;
    }

    try {
      const message = await this.chatService.sendMessage(client.userId, data.roomId, {
        content: data.content,
        type: data.type as any,
      });

      // Emit message to all users in the room
      this.server.to(`room_${data.roomId}`).emit('new_message', message);

      this.logger.log(`Message sent in room ${data.roomId} by ${client.username}`);
    } catch (error) {
      client.emit('error', error.message);
    }
  }

  @SubscribeMessage('typing_start')
  handleTypingStart(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: number },
  ) {
    if (!client.userId) return;

    client.to(`room_${data.roomId}`).emit('user_typing', {
      roomId: data.roomId,
      userId: client.userId,
      username: client.username,
      isTyping: true,
    });
  }

  @SubscribeMessage('typing_stop')
  handleTypingStop(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: number },
  ) {
    if (!client.userId) return;

    client.to(`room_${data.roomId}`).emit('user_typing', {
      roomId: data.roomId,
      userId: client.userId,
      username: client.username,
      isTyping: false,
    });
  }

  @SubscribeMessage('mark_message_read')
  async handleMarkMessageRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { messageId: number },
  ) {
    if (!client.userId) {
      client.emit('error', 'Not authenticated');
      return;
    }

    try {
      await this.prisma.messageReadStatus.upsert({
        where: {
          messageId_userId: {
            messageId: data.messageId,
            userId: client.userId,
          },
        },
        update: { readAt: new Date() },
        create: {
          messageId: data.messageId,
          userId: client.userId,
        },
      });

      client.emit('message_read', {
        messageId: data.messageId,
        userId: client.userId,
      });
    } catch (error) {
      client.emit('error', error.message);
    }
  }

  @SubscribeMessage('get_unread_count')
  async handleGetUnreadCount(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: number },
  ) {
    if (!client.userId) {
      client.emit('error', 'Not authenticated');
      return;
    }

    try {
      const unreadCount = await this.prisma.chatMessage.count({
        where: {
          roomId: data.roomId,
          NOT: {
            readBy: {
              some: {
                userId: client.userId,
              },
            },
          },
          userId: { not: client.userId }, // Don't count own messages
        },
      });

      client.emit('unread_count', {
        roomId: data.roomId,
        count: unreadCount,
      });
    } catch (error) {
      client.emit('error', error.message);
    }
  }

  @SubscribeMessage('get_online_users')
  handleGetOnlineUsers(@ConnectedSocket() client: AuthenticatedSocket) {
    const onlineUsers = Array.from(this.connectedUsers.keys()).map(userId => {
      const sockets = this.connectedUsers.get(userId) || [];
      return {
        userId,
        username: sockets[0]?.username || 'Anonymous',
        isOnline: sockets.length > 0,
      };
    });

    client.emit('online_users', onlineUsers);
  }

  // Method to send notifications to specific users
  sendNotificationToUser(userId: string, notification: any) {
    const userSockets = this.connectedUsers.get(userId) || [];
    userSockets.forEach(socket => {
      socket.emit('notification', notification);
    });
  }

  // Method to broadcast system messages
  broadcastSystemMessage(roomId: number, message: string) {
    this.server.to(`room_${roomId}`).emit('system_message', {
      roomId,
      content: message,
      timestamp: new Date(),
    });
  }

  // Check if user is online
  isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }
}