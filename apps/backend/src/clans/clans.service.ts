import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { CreateClanDto, UpdateClanDto, UpdateMemberRoleDto, CreateClanPostDto } from './dto/clan.dto';
import { ClanRole } from '@prisma/client';

@Injectable()
export class ClansService {
  private readonly logger = new Logger(ClansService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async createClan(userId: string, createClanDto: CreateClanDto) {
    // Check if user is already in a clan
    const existingMembership = await this.prisma.clanMembership.findFirst({
      where: { userId },
    });

    if (existingMembership) {
      throw new BadRequestException('You are already a member of a clan');
    }

    // Check if clan name or tag is taken
    const existingClan = await this.prisma.clan.findFirst({
      where: {
        OR: [
          { name: createClanDto.name },
          { tag: createClanDto.tag },
        ],
      },
    });

    if (existingClan) {
      throw new BadRequestException('Clan name or tag already taken');
    }

    const clan = await this.prisma.$transaction(async (tx) => {
      // Create clan
      const newClan = await tx.clan.create({
        data: {
          name: createClanDto.name,
          tag: createClanDto.tag,
          description: createClanDto.description,
          imageUrl: createClanDto.imageUrl,
          isPublic: createClanDto.isPublic ?? true,
          creatorId: userId,
        },
      });

      // Add creator as leader
      await tx.clanMembership.create({
        data: {
          clanId: newClan.id,
          userId,
          role: ClanRole.LEADER,
        },
      });

      return newClan;
    });

    // Award XP for creating a clan
    await this.usersService.addXP(userId, 100, 'Created a clan');

    return this.getClanById(clan.id);
  }

  async getClans(page = 1, limit = 20, isPublic?: boolean) {
    const skip = (page - 1) * limit;

    const whereClause = isPublic !== undefined ? { isPublic } : {};

    const [clans, total] = await Promise.all([
      this.prisma.clan.findMany({
        where: whereClause,
        include: {
          creator: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              profileImageUrl: true,
            },
          },
          _count: {
            select: {
              memberships: true,
            },
          },
        },
        orderBy: { xp: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.clan.count({ where: whereClause }),
    ]);

    return {
      clans: clans.map(clan => ({
        ...clan,
        memberCount: clan._count.memberships,
        _count: undefined,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getClanById(clanId: number) {
    const clan = await this.prisma.clan.findUnique({
      where: { id: clanId },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
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
                xp: true,
              },
            },
          },
          orderBy: [
            { role: 'asc' }, // Leaders first, then co-leaders, then members
            { joinedAt: 'asc' },
          ],
        },
        _count: {
          select: {
            memberships: true,
          },
        },
      },
    });

    if (!clan) {
      throw new NotFoundException('Clan not found');
    }

    return {
      ...clan,
      memberCount: clan._count.memberships,
      _count: undefined,
    };
  }

  async updateClan(userId: string, clanId: number, updateClanDto: UpdateClanDto) {
    const membership = await this.getUserClanRole(userId, clanId);

    if (membership.role !== ClanRole.LEADER && membership.role !== ClanRole.CO_LEADER) {
      throw new ForbiddenException('Only leaders and co-leaders can update clan details');
    }

    // Check if name or tag is taken by another clan
    if (updateClanDto.name || updateClanDto.tag) {
      const existingClan = await this.prisma.clan.findFirst({
        where: {
          OR: [
            ...(updateClanDto.name ? [{ name: updateClanDto.name }] : []),
            ...(updateClanDto.tag ? [{ tag: updateClanDto.tag }] : []),
          ],
          NOT: { id: clanId },
        },
      });

      if (existingClan) {
        throw new BadRequestException('Clan name or tag already taken');
      }
    }

    const updatedClan = await this.prisma.clan.update({
      where: { id: clanId },
      data: updateClanDto,
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
          },
        },
        _count: {
          select: {
            memberships: true,
          },
        },
      },
    });

    return {
      ...updatedClan,
      memberCount: updatedClan._count.memberships,
      _count: undefined,
    };
  }

  async joinClan(userId: string, clanId: number) {
    // Check if user is already in a clan
    const existingMembership = await this.prisma.clanMembership.findFirst({
      where: { userId },
    });

    if (existingMembership) {
      throw new BadRequestException('You are already a member of a clan');
    }

    // Check if clan exists and is public
    const clan = await this.prisma.clan.findUnique({
      where: { id: clanId },
    });

    if (!clan) {
      throw new NotFoundException('Clan not found');
    }

    if (!clan.isPublic) {
      throw new ForbiddenException('Cannot join private clan without invitation');
    }

    const membership = await this.prisma.$transaction(async (tx) => {
      // Create membership
      const newMembership = await tx.clanMembership.create({
        data: {
          clanId,
          userId,
          role: ClanRole.MEMBER,
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
          clan: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
            },
          },
        },
      });

      // Update clan member count
      await tx.clan.update({
        where: { id: clanId },
        data: { memberCount: { increment: 1 } },
      });

      return newMembership;
    });

    // Award XP for joining a clan
    await this.usersService.addXP(userId, 50, 'Joined a clan');

    return membership;
  }

  async leaveClan(userId: string, clanId: number) {
    const membership = await this.prisma.clanMembership.findUnique({
      where: {
        clanId_userId: {
          clanId,
          userId,
        },
      },
      include: {
        clan: {
          select: {
            creatorId: true,
            memberCount: true,
          },
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('You are not a member of this clan');
    }

    // If user is the creator and there are other members, transfer leadership
    if (membership.clan.creatorId === userId && membership.clan.memberCount > 1) {
      // Find the next leader (first co-leader or member by join date)
      const nextLeader = await this.prisma.clanMembership.findFirst({
        where: {
          clanId,
          userId: { not: userId },
        },
        orderBy: [
          { role: 'asc' },
          { joinedAt: 'asc' },
        ],
      });

      if (nextLeader) {
        await this.prisma.$transaction(async (tx) => {
          // Promote next leader
          await tx.clanMembership.update({
            where: { id: nextLeader.id },
            data: { role: ClanRole.LEADER },
          });

          // Update clan creator
          await tx.clan.update({
            where: { id: clanId },
            data: { creatorId: nextLeader.userId },
          });

          // Remove current user
          await tx.clanMembership.delete({
            where: {
              clanId_userId: {
                clanId,
                userId,
              },
            },
          });

          // Update member count
          await tx.clan.update({
            where: { id: clanId },
            data: { memberCount: { decrement: 1 } },
          });
        });
      }
    } else if (membership.clan.memberCount === 1) {
      // If user is the only member, delete the clan
      await this.prisma.clan.delete({
        where: { id: clanId },
      });
    } else {
      // Regular member leaving
      await this.prisma.$transaction(async (tx) => {
        await tx.clanMembership.delete({
          where: {
            clanId_userId: {
              clanId,
              userId,
            },
          },
        });

        await tx.clan.update({
          where: { id: clanId },
          data: { memberCount: { decrement: 1 } },
        });
      });
    }

    return { message: 'Left clan successfully' };
  }

  async updateMemberRole(userId: string, clanId: number, targetUserId: string, updateRoleDto: UpdateMemberRoleDto) {
    const userMembership = await this.getUserClanRole(userId, clanId);
    const targetMembership = await this.getUserClanRole(targetUserId, clanId);

    // Only leaders can change roles
    if (userMembership.role !== ClanRole.LEADER) {
      throw new ForbiddenException('Only clan leaders can change member roles');
    }

    // Cannot change your own role
    if (userId === targetUserId) {
      throw new BadRequestException('Cannot change your own role');
    }

    // Cannot promote someone to leader (there can only be one leader)
    if (updateRoleDto.role === ClanRole.LEADER) {
      throw new BadRequestException('Cannot promote member to leader');
    }

    const updatedMembership = await this.prisma.clanMembership.update({
      where: { id: targetMembership.id },
      data: { role: updateRoleDto.role },
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
    });

    return updatedMembership;
  }

  async removeMember(userId: string, clanId: number, targetUserId: string) {
    const userMembership = await this.getUserClanRole(userId, clanId);

    // Only leaders and co-leaders can remove members
    if (userMembership.role !== ClanRole.LEADER && userMembership.role !== ClanRole.CO_LEADER) {
      throw new ForbiddenException('Only leaders and co-leaders can remove members');
    }

    const targetMembership = await this.getUserClanRole(targetUserId, clanId);

    // Cannot remove yourself
    if (userId === targetUserId) {
      throw new BadRequestException('Cannot remove yourself, use leave clan instead');
    }

    // Co-leaders cannot remove other co-leaders or leaders
    if (userMembership.role === ClanRole.CO_LEADER && targetMembership.role !== ClanRole.MEMBER) {
      throw new ForbiddenException('Co-leaders can only remove regular members');
    }

    // Leaders cannot remove other leaders
    if (targetMembership.role === ClanRole.LEADER) {
      throw new ForbiddenException('Cannot remove clan leader');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.clanMembership.delete({
        where: {
          clanId_userId: {
            clanId,
            userId: targetUserId,
          },
        },
      });

      await tx.clan.update({
        where: { id: clanId },
        data: { memberCount: { decrement: 1 } },
      });
    });

    return { message: 'Member removed successfully' };
  }

  async addClanXP(clanId: number, xp: number, reason?: string) {
    const clan = await this.prisma.clan.findUnique({
      where: { id: clanId },
      select: { xp: true, level: true },
    });

    if (!clan) {
      throw new NotFoundException('Clan not found');
    }

    const newXP = clan.xp + xp;
    const newLevel = this.calculateClanLevel(newXP);

    const updatedClan = await this.prisma.clan.update({
      where: { id: clanId },
      data: {
        xp: newXP,
        level: newLevel,
      },
      select: {
        id: true,
        name: true,
        xp: true,
        level: true,
      },
    });

    this.logger.log(`Clan ${clanId} gained ${xp} XP. Reason: ${reason || 'Unknown'}`);

    if (newLevel > clan.level) {
      this.logger.log(`Clan ${clanId} leveled up to level ${newLevel}!`);
      // TODO: Create clan level up notification for all members
    }

    return updatedClan;
  }

  async getUserClanMembership(userId: string) {
    const membership = await this.prisma.clanMembership.findFirst({
      where: { userId },
      include: {
        clan: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            level: true,
            xp: true,
            memberCount: true,
          },
        },
      },
    });

    return membership;
  }

  async searchClans(query: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [clans, total] = await Promise.all([
      this.prisma.clan.findMany({
        where: {
          AND: [
            { isPublic: true },
            {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
              ],
            },
          ],
        },
        include: {
          creator: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              profileImageUrl: true,
            },
          },
          _count: {
            select: {
              memberships: true,
            },
          },
        },
        orderBy: { xp: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.clan.count({
        where: {
          AND: [
            { isPublic: true },
            {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
              ],
            },
          ],
        },
      }),
    ]);

    return {
      clans: clans.map(clan => ({
        ...clan,
        memberCount: clan._count.memberships,
        _count: undefined,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  private async getUserClanRole(userId: string, clanId: number) {
    const membership = await this.prisma.clanMembership.findUnique({
      where: {
        clanId_userId: {
          clanId,
          userId,
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('You are not a member of this clan');
    }

    return membership;
  }

  async createClanPost(userId: string, clanId: number, createPostDto: CreateClanPostDto) {
    // Verify user is member of the clan
    const membership = await this.getUserClanRole(userId, clanId);

    const post = await this.prisma.clanPost.create({
      data: {
        clanId,
        userId,
        content: createPostDto.content,
        imageUrl: createPostDto.imageUrl,
        isPinned: createPostDto.isPinned && (membership.role === ClanRole.LEADER || membership.role === ClanRole.CO_LEADER),
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
      },
    });

    // Award XP for clan activity
    await this.usersService.addXP(userId, 5, 'Created clan post');
    await this.addClanXP(clanId, 10, 'Member posted content');

    return post;
  }

  async getClanPosts(clanId: number, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      this.prisma.clanPost.findMany({
        where: { clanId },
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
        orderBy: [
          { isPinned: 'desc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      this.prisma.clanPost.count({ where: { clanId } }),
    ]);

    return {
      posts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async disbandClan(userId: string, clanId: number) {
    const clan = await this.prisma.clan.findUnique({
      where: { id: clanId },
    });

    if (!clan) {
      throw new NotFoundException('Clan not found');
    }

    if (clan.creatorId !== userId) {
      throw new ForbiddenException('Only clan creator can disband the clan');
    }

    // Delete clan and all related data (cascade will handle memberships)
    await this.prisma.clan.delete({
      where: { id: clanId },
    });

    return { message: 'Clan disbanded successfully' };
  }

  private calculateClanLevel(xp: number): number {
    // Clan level calculation: every 5000 XP = 1 level
    return Math.floor(xp / 5000) + 1;
  }
}