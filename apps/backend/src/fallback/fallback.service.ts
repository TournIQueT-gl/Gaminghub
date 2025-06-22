import { Injectable, Logger } from '@nestjs/common';

// Fallback service for when database is unavailable
@Injectable()
export class FallbackService {
  private readonly logger = new Logger(FallbackService.name);
  private memoryStore = new Map<string, any>();

  constructor() {
    this.logger.warn('FallbackService initialized - using in-memory storage');
  }

  // Basic CRUD operations for in-memory storage
  set(key: string, value: any): void {
    this.memoryStore.set(key, value);
  }

  get(key: string): any {
    return this.memoryStore.get(key);
  }

  delete(key: string): boolean {
    return this.memoryStore.delete(key);
  }

  has(key: string): boolean {
    return this.memoryStore.has(key);
  }

  clear(): void {
    this.memoryStore.clear();
  }

  // Mock user for testing
  getMockUser() {
    return {
      id: 'mock-user-1',
      email: 'demo@gamingx.com',
      username: 'demouser',
      firstName: 'Demo',
      lastName: 'User',
      profileImageUrl: null,
      bio: 'Demo user for testing',
      favoriteGames: ['Valorant', 'CS:GO'],
      status: 'ONLINE',
      currentGame: null,
      xp: 1250,
      level: 5,
      totalWins: 15,
      totalGames: 32,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // Mock achievements
  getMockAchievements() {
    return {
      achievements: [
        {
          id: 'first_steps',
          name: 'First Steps',
          description: 'Create your first post',
          icon: '🎯',
          xpReward: 50,
          isUnlocked: true,
          progress: 100,
          currentValue: 5,
          targetValue: 1,
        },
        {
          id: 'social_butterfly',
          name: 'Social Butterfly',
          description: 'Get 10 followers',
          icon: '🦋',
          xpReward: 100,
          isUnlocked: false,
          progress: 30,
          currentValue: 3,
          targetValue: 10,
        },
      ],
      unlockedCount: 1,
      totalCount: 7,
      progress: 14,
    };
  }

  // Mock clans
  getMockClans() {
    return {
      clans: [
        {
          id: 1,
          name: 'Elite Gaming',
          tag: 'ELIT',
          description: 'Professional esports clan',
          imageUrl: null,
          isPublic: true,
          memberCount: 15,
          level: 8,
          xp: 12500,
          wins: 45,
          losses: 12,
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
  }

  // Mock tournaments
  getMockTournaments() {
    return {
      tournaments: [
        {
          id: 1,
          name: 'Championship 2025',
          description: 'Annual gaming championship',
          game: 'Valorant',
          maxParticipants: 64,
          participantCount: 32,
          entryFee: 25.0,
          prizePool: 5000.0,
          format: 'SINGLE_ELIMINATION',
          type: 'SOLO',
          status: 'UPCOMING',
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
  }
}