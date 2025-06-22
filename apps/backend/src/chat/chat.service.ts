import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto, SendMessageDto } from './dto/chat.dto';
import { ChatRoomType, MessageType } from '@prisma/client';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createRoom(userId: string, createRoomDto: CreateRoomDto) {
    // Validate room creation permissions
    if (createRoomDto.type === ChatRoomType.CLAN && !createRoomDto.clanId) {
      throw new BadRequestException('Clan ID is required for clan chat rooms');
    }

    if (createRoomDto.type === ChatRoomType.TOURNAMENT && !createRoomDto.tournamentId) {
      throw new BadRequestException('Tournament ID is required for tournament chat rooms');
    }

    const room = await this.prisma.$transaction(async (tx) => {
      // Create the room
      const newRoom = await tx.chatRoom.create({
        data: {
          name: createRoomDto.name,
          type: createRoomDto.type,
          clanId: createRoomDto.clanId,
          tournamentId: createRoomDto.tournamentId,
        },
      });

      // Add creator as member
      await tx.chatRoomMembership.create({
        data: {
          roomId: newRoom.id,
          userId,
        },
      });

      return newRoom;
    });

    return this.getRoomById(room.id, userId);
  }

  async getUserRooms(userId: string) {
    const memberships = await this.prisma.chatRoomMembership.findMany({
      where: { userId },
      include: {
        room: {
          include: {
            clan: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
            tournament: {
              select: {
                id: true,
                name: true,
                game: true,
              },
            },
            _count: {
              select: {
                memberships: true,
                messages: true,
              },
            },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });

    return memberships.map(membership => ({
      ...membership.room,
      memberCount: membership.room._count.memberships,
      messageCount: membership.room._count.messages,
      _count: undefined,
    }));
  }

  async getRoomById(roomId: number, userId?: string) {
    const room = await this.prisma.chatRoom.findUnique({
      where: { id: roomId },
      include: {
        clan: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
        tournament: {
          select: {
            id: true,
            name: true,
            game: true,
          },
        },
        memberships: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                profileImageUrl: true,
                level: true,
              },
            },
          },
          orderBy: { joinedAt: 'asc' },
        },
        _count: {
          select: {
            memberships: true,
            messages: true,
          },
        },
      },
    });

    if (!room) {
      throw new NotFoundException('Chat room not found');
    }

    // Check if user has access to this room
    if (userId && room.type === ChatRoomType.PRIVATE) {
      const membership = room.memberships.find(m => m.userId === userId);
      if (!membership) {
        throw new ForbiddenException('You do not have access to this private room');
      }
    }

    return {
      ...room,
      memberCount: room._count.memberships,
      messageCount: room._count.messages,
      _count: undefined,
    };
  }

  async joinRoom(userId: string, roomId: number) {
    const room = await this.prisma.chatRoom.findUnique({
      where: { id: roomId },
      include: {
        clan: true,
        tournament: true,
      },
    });

    if (!room) {
      throw new NotFoundException('Chat room not found');
    }

    // Check if user can join this room
    if (room.type === ChatRoomType.PRIVATE) {
      throw new ForbiddenException('Cannot join private room without invitation');
    }

    if (room.type === ChatRoomType.CLAN && room.clanId) {
      // Check if user is member of the clan
      const clanMembership = await this.prisma.clanMembership.findUnique({
        where: {
          clanId_userId: {
            clanId: room.clanId,
            userId,
          },
        },
      });

      if (!clanMembership) {
        throw new ForbiddenException('You must be a clan member to join this room');
      }
    }

    if (room.type === ChatRoomType.TOURNAMENT && room.tournamentId) {
      // Check if user is participating in the tournament
      const participation = await this.prisma.tournamentParticipant.findUnique({
        where: {
          tournamentId_userId: {
            tournamentId: room.tournamentId,
            userId,
          },
        },
      });

      if (!participation) {
        throw new ForbiddenException('You must be a tournament participant to join this room');
      }
    }

    // Check if already a member
    const existingMembership = await this.prisma.chatRoomMembership.findUnique({
      where: {
        roomId_userId: {
          roomId,
          userId,
        },
      },
    });

    if (existingMembership) {
      throw new BadRequestException('Already a member of this room');
    }

    const membership = await this.prisma.chatRoomMembership.create({
      data: {
        roomId,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
            level: true,
          },
        },
        room: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    return membership;
  }

  async leaveRoom(userId: string, roomId: number) {
    const membership = await this.prisma.chatRoomMembership.findUnique({
      where: {
        roomId_userId: {
          roomId,
          userId,
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('You are not a member of this room');
    }

    await this.prisma.chatRoomMembership.delete({
      where: {
        roomId_userId: {
          roomId,
          userId,
        },
      },
    });

    return { message: 'Left room successfully' };
  }

  async sendMessage(userId: string, roomId: number, sendMessageDto: SendMessageDto) {
    // Verify user is member of the room
    const membership = await this.prisma.chatRoomMembership.findUnique({
      where: {
        roomId_userId: {
          roomId,
          userId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('You must be a member of the room to send messages');
    }

    const message = await this.prisma.chatMessage.create({
      data: {
        roomId,
        userId,
        content: sendMessageDto.content,
        type: sendMessageDto.type || MessageType.TEXT,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
            level: true,
          },
        },
        room: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    return message;
  }

  async getRoomMessages(roomId: number, userId: string, page = 1, limit = 50) {
    // Verify user has access to the room
    const membership = await this.prisma.chatRoomMembership.findUnique({
      where: {
        roomId_userId: {
          roomId,
          userId,
        },
      },
    });

    if (!membership) {
      // Check if it's a public room
      const room = await this.prisma.chatRoom.findUnique({
        where: { id: roomId },
      });

      if (!room || room.type !== ChatRoomType.PUBLIC) {
        throw new ForbiddenException('You do not have access to this room');
      }
    }

    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      this.prisma.chatMessage.findMany({
        where: { roomId },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              profileImageUrl: true,
              level: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.chatMessage.count({ where: { roomId } }),
    ]);

    return {
      messages: messages.reverse(), // Return oldest first
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async searchRooms(query: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [rooms, total] = await Promise.all([
      this.prisma.chatRoom.findMany({
        where: {
          AND: [
            { type: { in: [ChatRoomType.PUBLIC, ChatRoomType.CLAN, ChatRoomType.TOURNAMENT] } },
            {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { clan: { name: { contains: query, mode: 'insensitive' } } },
                { tournament: { name: { contains: query, mode: 'insensitive' } } },
              ],
            },
          ],
        },
        include: {
          clan: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
            },
          },
          tournament: {
            select: {
              id: true,
              name: true,
              game: true,
            },
          },
          _count: {
            select: {
              memberships: true,
              messages: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.chatRoom.count({
        where: {
          AND: [
            { type: { in: [ChatRoomType.PUBLIC, ChatRoomType.CLAN, ChatRoomType.TOURNAMENT] } },
            {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { clan: { name: { contains: query, mode: 'insensitive' } } },
                { tournament: { name: { contains: query, mode: 'insensitive' } } },
              ],
            },
          ],
        },
      }),
    ]);

    return {
      rooms: rooms.map(room => ({
        ...room,
        memberCount: room._count.memberships,
        messageCount: room._count.messages,
        _count: undefined,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createDirectMessage(userId: string, targetUserId: string) {
    if (userId === targetUserId) {
      throw new BadRequestException('Cannot create DM with yourself');
    }

    // Check if DM room already exists
    const existingRoom = await this.prisma.chatRoom.findFirst({
      where: {
        type: ChatRoomType.DIRECT_MESSAGE,
        memberships: {
          every: {
            userId: { in: [userId, targetUserId] },
          },
        },
      },
      include: {
        memberships: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                profileImageUrl: true,
              },
            },
          },
        },
      },
    });

    if (existingRoom && existingRoom.memberships.length === 2) {
      return existingRoom;
    }

    // Create new DM room
    const room = await this.prisma.$transaction(async (tx) => {
      const newRoom = await tx.chatRoom.create({
        data: {
          type: ChatRoomType.DIRECT_MESSAGE,
        },
      });

      // Add both users as members
      await tx.chatRoomMembership.createMany({
        data: [
          { roomId: newRoom.id, userId },
          { roomId: newRoom.id, userId: targetUserId },
        ],
      });

      return tx.chatRoom.findUnique({
        where: { id: newRoom.id },
        include: {
          memberships: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  firstName: true,
                  lastName: true,
                  profileImageUrl: true,
                },
              },
            },
          },
        },
      });
    });

    return room;
  }
}