import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SearchType } from './dto/search.dto';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async globalSearch(query: string, type?: SearchType, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const results: any = {};

    if (!type || type === SearchType.USER) {
      const [users, userTotal] = await Promise.all([
        this.prisma.user.findMany({
          where: {
            AND: [
              { isActive: true },
              {
                OR: [
                  { username: { contains: query, mode: 'insensitive' } },
                  { firstName: { contains: query, mode: 'insensitive' } },
                  { lastName: { contains: query, mode: 'insensitive' } },
                  { favoriteGames: { has: query } },
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
            bio: true,
            level: true,
            xp: true,
            status: true,
            favoriteGames: true,
            _count: {
              select: {
                followers: true,
                following: true,
                posts: true,
              },
            },
          },
          skip: type === SearchType.USER ? skip : 0,
          take: type === SearchType.USER ? limit : 5,
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
                  { favoriteGames: { has: query } },
                ],
              },
            ],
          },
        }),
      ]);

      results.users = {
        data: users,
        total: userTotal,
        page: type === SearchType.USER ? page : 1,
        limit: type === SearchType.USER ? limit : 5,
        totalPages: Math.ceil(userTotal / (type === SearchType.USER ? limit : 5)),
      };
    }

    if (!type || type === SearchType.CLAN) {
      const [clans, clanTotal] = await Promise.all([
        this.prisma.clan.findMany({
          where: {
            AND: [
              { isPublic: true },
              {
                OR: [
                  { name: { contains: query, mode: 'insensitive' } },
                  { tag: { contains: query, mode: 'insensitive' } },
                  { description: { contains: query, mode: 'insensitive' } },
                ],
              },
            ],
          },
          select: {
            id: true,
            name: true,
            tag: true,
            description: true,
            imageUrl: true,
            memberCount: true,
            level: true,
            xp: true,
            wins: true,
            losses: true,
            creator: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          skip: type === SearchType.CLAN ? skip : 0,
          take: type === SearchType.CLAN ? limit : 5,
          orderBy: { xp: 'desc' },
        }),
        this.prisma.clan.count({
          where: {
            AND: [
              { isPublic: true },
              {
                OR: [
                  { name: { contains: query, mode: 'insensitive' } },
                  { tag: { contains: query, mode: 'insensitive' } },
                  { description: { contains: query, mode: 'insensitive' } },
                ],
              },
            ],
          },
        }),
      ]);

      results.clans = {
        data: clans,
        total: clanTotal,
        page: type === SearchType.CLAN ? page : 1,
        limit: type === SearchType.CLAN ? limit : 5,
        totalPages: Math.ceil(clanTotal / (type === SearchType.CLAN ? limit : 5)),
      };
    }

    if (!type || type === SearchType.TOURNAMENT) {
      const [tournaments, tournamentTotal] = await Promise.all([
        this.prisma.tournament.findMany({
          where: {
            AND: [
              { isPublic: true },
              {
                OR: [
                  { name: { contains: query, mode: 'insensitive' } },
                  { description: { contains: query, mode: 'insensitive' } },
                  { game: { contains: query, mode: 'insensitive' } },
                ],
              },
            ],
          },
          select: {
            id: true,
            name: true,
            description: true,
            game: true,
            maxParticipants: true,
            entryFee: true,
            prizePool: true,
            format: true,
            type: true,
            status: true,
            startDate: true,
            endDate: true,
            creator: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
              },
            },
            _count: {
              select: {
                participants: true,
              },
            },
          },
          skip: type === SearchType.TOURNAMENT ? skip : 0,
          take: type === SearchType.TOURNAMENT ? limit : 5,
          orderBy: { startDate: 'asc' },
        }),
        this.prisma.tournament.count({
          where: {
            AND: [
              { isPublic: true },
              {
                OR: [
                  { name: { contains: query, mode: 'insensitive' } },
                  { description: { contains: query, mode: 'insensitive' } },
                  { game: { contains: query, mode: 'insensitive' } },
                ],
              },
            ],
          },
        }),
      ]);

      results.tournaments = {
        data: tournaments.map(tournament => ({
          ...tournament,
          participantCount: tournament._count.participants,
          _count: undefined,
        })),
        total: tournamentTotal,
        page: type === SearchType.TOURNAMENT ? page : 1,
        limit: type === SearchType.TOURNAMENT ? limit : 5,
        totalPages: Math.ceil(tournamentTotal / (type === SearchType.TOURNAMENT ? limit : 5)),
      };
    }

    return results;
  }

  async searchUsersByGame(game: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: {
          AND: [
            { isActive: true },
            { favoriteGames: { has: game } },
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
          status: true,
          favoriteGames: true,
        },
        skip,
        take: limit,
        orderBy: { level: 'desc' },
      }),
      this.prisma.user.count({
        where: {
          AND: [
            { isActive: true },
            { favoriteGames: { has: game } },
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

  async getPopularGames() {
    // Get most common games from user favorites
    const users = await this.prisma.user.findMany({
      where: {
        isActive: true,
        favoriteGames: { not: { equals: [] } },
      },
      select: {
        favoriteGames: true,
      },
    });

    const gameCount: Record<string, number> = {};
    users.forEach(user => {
      user.favoriteGames.forEach(game => {
        gameCount[game] = (gameCount[game] || 0) + 1;
      });
    });

    return Object.entries(gameCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([game, count]) => ({ game, playerCount: count }));
  }

  async searchSuggestions(query: string, limit = 10) {
    const suggestions: string[] = [];

    // Get user suggestions
    const users = await this.prisma.user.findMany({
      where: {
        AND: [
          { isActive: true },
          {
            OR: [
              { username: { startsWith: query, mode: 'insensitive' } },
              { firstName: { startsWith: query, mode: 'insensitive' } },
              { lastName: { startsWith: query, mode: 'insensitive' } },
            ],
          },
        ],
      },
      select: { username: true, firstName: true, lastName: true },
      take: Math.ceil(limit / 3),
    });

    users.forEach(user => {
      if (user.username && user.username.toLowerCase().startsWith(query.toLowerCase())) {
        suggestions.push(user.username);
      }
      if (user.firstName && user.firstName.toLowerCase().startsWith(query.toLowerCase())) {
        suggestions.push(user.firstName);
      }
    });

    // Get clan suggestions
    const clans = await this.prisma.clan.findMany({
      where: {
        AND: [
          { isPublic: true },
          {
            OR: [
              { name: { startsWith: query, mode: 'insensitive' } },
              { tag: { startsWith: query, mode: 'insensitive' } },
            ],
          },
        ],
      },
      select: { name: true, tag: true },
      take: Math.ceil(limit / 3),
    });

    clans.forEach(clan => {
      suggestions.push(clan.name);
      if (clan.tag) suggestions.push(clan.tag);
    });

    // Get tournament suggestions
    const tournaments = await this.prisma.tournament.findMany({
      where: {
        AND: [
          { isPublic: true },
          {
            OR: [
              { name: { startsWith: query, mode: 'insensitive' } },
              { game: { startsWith: query, mode: 'insensitive' } },
            ],
          },
        ],
      },
      select: { name: true, game: true },
      take: Math.ceil(limit / 3),
    });

    tournaments.forEach(tournament => {
      suggestions.push(tournament.name);
      suggestions.push(tournament.game);
    });

    // Remove duplicates and limit results
    return [...new Set(suggestions)].slice(0, limit);
  }
}