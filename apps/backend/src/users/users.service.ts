import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto, UpdateUserBioDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        profileImageUrl: true,
        bio: true,
        xp: true,
        level: true,
        totalWins: true,
        totalGames: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByUsername(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        profileImageUrl: true,
        bio: true,
        xp: true,
        level: true,
        totalWins: true,
        totalGames: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, updateUserDto: UpdateUserDto) {
    // Check if username is taken by another user
    if (updateUserDto.username) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          username: updateUserDto.username,
          NOT: { id: userId },
        },
      });

      if (existingUser) {
        throw new BadRequestException('Username already taken');
      }
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        profileImageUrl: true,
        bio: true,
        xp: true,
        level: true,
        totalWins: true,
        totalGames: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async updateBio(userId: string, updateBioDto: UpdateUserBioDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { bio: updateBioDto.bio },
      select: {
        id: true,
        bio: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async addXP(userId: string, xp: number, reason?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { xp: true, level: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const newXP = user.xp + xp;
    const newLevel = this.calculateLevel(newXP);

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        xp: newXP,
        level: newLevel,
      },
    });

    // If user leveled up, create notification
    if (newLevel > user.level) {
      await this.prisma.notification.create({
        data: {
          userId,
          title: 'Level Up!',
          message: `Congratulations! You've reached level ${newLevel}`,
          type: 'SYSTEM',
        },
      });
      this.logger.log(`User ${userId} leveled up to ${newLevel}!`);
    }

    this.logger.log(`User ${userId} gained ${xp} XP${reason ? ` for: ${reason}` : ''}`);
    return updatedUser;
  }

  async followUser(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new BadRequestException('Cannot follow yourself');
    }

    // Check if users exist
    const [follower, following] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: followerId } }),
      this.prisma.user.findUnique({ where: { id: followingId } }),
    ]);

    if (!follower || !following) {
      throw new NotFoundException('User not found');
    }

    // Check if already following
    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (existingFollow) {
      throw new BadRequestException('Already following this user');
    }

    const follow = await this.prisma.follow.create({
      data: {
        followerId,
        followingId,
      },
      include: {
        following: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
          },
        },
      },
    });

    // TODO: Create follow notification

    return follow;
  }

  async unfollowUser(followerId: string, followingId: string) {
    const follow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (!follow) {
      throw new NotFoundException('Follow relationship not found');
    }

    await this.prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    return { message: 'Unfollowed successfully' };
  }

  async getFollowers(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [followers, total] = await Promise.all([
      this.prisma.follow.findMany({
        where: { followingId: userId },
        skip,
        take: limit,
        include: {
          follower: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              profileImageUrl: true,
              level: true,
              xp: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.follow.count({
        where: { followingId: userId },
      }),
    ]);

    return {
      followers: followers.map(f => f.follower),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getFollowing(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [following, total] = await Promise.all([
      this.prisma.follow.findMany({
        where: { followerId: userId },
        skip,
        take: limit,
        include: {
          following: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              profileImageUrl: true,
              level: true,
              xp: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.follow.count({
        where: { followerId: userId },
      }),
    ]);

    return {
      following: following.map(f => f.following),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async searchUsers(query: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: {
          AND: [
            { isActive: true },
            {
              OR: [
                { username: { contains: query, mode: 'insensitive' } },
                { firstName: { contains: query, mode: 'insensitive' } },
                { lastName: { contains: query, mode: 'insensitive' } },
              ],
            },
          ],
        },
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          profileImageUrl: true,
          level: true,
          xp: true,
          bio: true,
        },
        skip,
        take: limit,
        orderBy: { level: 'desc' },
      }),
      this.prisma.user.count({
        where: {
          AND: [
            { isActive: true },
            {
              OR: [
                { username: { contains: query, mode: 'insensitive' } },
                { firstName: { contains: query, mode: 'insensitive' } },
                { lastName: { contains: query, mode: 'insensitive' } },
              ],
            },
          ],
        },
      }),
    ]);

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUserStats(userId: string) {
    const [user, clanMembership, tournamentsWon, tournamentsPlayed] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          xp: true,
          level: true,
          totalWins: true,
          totalGames: true,
          _count: {
            select: {
              posts: true,
              comments: true,
              likes: true,
              followers: true,
              following: true,
            },
          },
        },
      }),
      this.prisma.clanMembership.findFirst({
        where: { userId },
        include: {
          clan: {
            select: {
              id: true,
              name: true,
              level: true,
              xp: true,
            },
          },
        },
      }),
      this.prisma.tournamentParticipant.count({
        where: {
          userId,
          status: 'WINNER',
        },
      }),
      this.prisma.tournamentParticipant.count({
        where: { userId },
      }),
    ]);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      ...user,
      clan: clanMembership?.clan || null,
      clanRole: clanMembership?.role || null,
      tournamentsWon,
      tournamentsPlayed,
      winRate: user.totalGames > 0 ? Math.round((user.totalWins / user.totalGames) * 100) : 0,
    };
  }

  private calculateLevel(xp: number): number {
    // Simple level calculation: every 1000 XP = 1 level
    return Math.floor(xp / 1000) + 1;
  }
}