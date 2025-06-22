import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  criteria: {
    type: 'xp' | 'posts' | 'wins' | 'games' | 'level' | 'followers' | 'clan_level';
    target: number;
  };
}

@Injectable()
export class AchievementsService {
  private readonly logger = new Logger(AchievementsService.name);

  constructor(private readonly prisma: PrismaService) {}

  private achievements: Achievement[] = [
    {
      id: 'first_steps',
      name: 'First Steps',
      description: 'Create your first post',
      icon: '🎯',
      xpReward: 50,
      criteria: { type: 'posts', target: 1 },
    },
    {
      id: 'social_butterfly',
      name: 'Social Butterfly',
      description: 'Get 10 followers',
      icon: '🦋',
      xpReward: 100,
      criteria: { type: 'followers', target: 10 },
    },
    {
      id: 'level_up_5',
      name: 'Rising Star',
      description: 'Reach level 5',
      icon: '⭐',
      xpReward: 150,
      criteria: { type: 'level', target: 5 },
    },
    {
      id: 'level_up_10',
      name: 'Gaming Pro',
      description: 'Reach level 10',
      icon: '🏆',
      xpReward: 300,
      criteria: { type: 'level', target: 10 },
    },
    {
      id: 'first_win',
      name: 'First Victory',
      description: 'Win your first game',
      icon: '🥇',
      xpReward: 100,
      criteria: { type: 'wins', target: 1 },
    },
    {
      id: 'veteran_gamer',
      name: 'Veteran Gamer',
      description: 'Play 50 games',
      icon: '🎮',
      xpReward: 200,
      criteria: { type: 'games', target: 50 },
    },
    {
      id: 'xp_milestone_1000',
      name: 'Experience Gatherer',
      description: 'Earn 1000 XP',
      icon: '💎',
      xpReward: 250,
      criteria: { type: 'xp', target: 1000 },
    },
  ];

  async getUserAchievements(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        xp: true,
        level: true,
        totalWins: true,
        totalGames: true,
        _count: {
          select: {
            posts: true,
            followers: true,
          },
        },
        clanMemberships: {
          include: {
            clan: {
              select: { level: true },
            },
          },
        },
      },
    });

    if (!user) {
      return { achievements: [], unlockedCount: 0, totalCount: this.achievements.length };
    }

    const userStats = {
      xp: user.xp,
      level: user.level,
      wins: user.totalWins,
      games: user.totalGames,
      posts: user._count.posts,
      followers: user._count.followers,
      clan_level: user.clanMemberships[0]?.clan?.level || 0,
    };

    const achievementsWithStatus = this.achievements.map(achievement => {
      const currentValue = userStats[achievement.criteria.type];
      const isUnlocked = currentValue >= achievement.criteria.target;
      const progress = Math.min((currentValue / achievement.criteria.target) * 100, 100);

      return {
        ...achievement,
        isUnlocked,
        progress,
        currentValue,
        targetValue: achievement.criteria.target,
      };
    });

    const unlockedCount = achievementsWithStatus.filter(a => a.isUnlocked).length;

    return {
      achievements: achievementsWithStatus,
      unlockedCount,
      totalCount: this.achievements.length,
      progress: Math.round((unlockedCount / this.achievements.length) * 100),
    };
  }

  async checkAndUnlockAchievements(userId: string) {
    const { achievements } = await this.getUserAchievements(userId);
    const newlyUnlocked = [];

    // Get existing notifications to avoid duplicates
    const existingNotifications = await this.prisma.notification.findMany({
      where: {
        userId,
        type: 'SYSTEM',
        title: 'Achievement Unlocked!',
      },
    });

    const notifiedAchievements = existingNotifications
      .map(n => n.data as any)
      .filter(data => data?.achievementId)
      .map(data => data.achievementId);

    for (const achievement of achievements) {
      if (achievement.isUnlocked && !notifiedAchievements.includes(achievement.id)) {
        newlyUnlocked.push(achievement);

        // Create notification
        await this.prisma.notification.create({
          data: {
            userId,
            title: 'Achievement Unlocked!',
            message: `You've unlocked: ${achievement.name} - ${achievement.description}`,
            type: 'SYSTEM',
            data: { achievementId: achievement.id },
          },
        });

        this.logger.log(`User ${userId} unlocked achievement: ${achievement.name}`);
      }
    }

    return newlyUnlocked;
  }

  async getLeaderboard() {
    const users = await this.prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        profileImageUrl: true,
        xp: true,
        level: true,
        totalWins: true,
        totalGames: true,
        _count: {
          select: {
            posts: true,
            followers: true,
          },
        },
      },
      orderBy: { xp: 'desc' },
      take: 50,
    });

    return users.map((user, index) => ({
      ...user,
      rank: index + 1,
      winRate: user.totalGames > 0 ? Math.round((user.totalWins / user.totalGames) * 100) : 0,
    }));
  }
}