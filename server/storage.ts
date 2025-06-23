import {
  users,
  posts,
  comments,
  likes,
  clans,
  clanMemberships,
  tournaments,
  tournamentParticipants,
  tournamentMatches,
  chatRooms,
  chatMessages,
  chatRoomMemberships,
  notifications,
  follows,
  type User,
  type UpsertUser,
  type InsertPost,
  type Post,
  type InsertComment,
  type Comment,
  type InsertClan,
  type Clan,
  type ClanMembership,
  type InsertTournament,
  type Tournament,
  type TournamentParticipant,
  type TournamentMatch,
  type InsertChatMessage,
  type ChatMessage,
  type ChatRoom,
  type InsertNotification,
  type Notification,
  type Like,
  type Follow,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, sql, count, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserLevel(userId: string, xp: number): Promise<void>;
  getUsersByIds(ids: string[]): Promise<User[]>;
  
  // Post operations
  createPost(post: InsertPost): Promise<Post>;
  getPosts(limit?: number, offset?: number): Promise<Post[]>;
  getPostById(id: number): Promise<Post | undefined>;
  getPostsByUserId(userId: string): Promise<Post[]>;
  updatePostCounts(postId: number, type: 'like' | 'comment' | 'share', increment: boolean): Promise<void>;
  
  // Comment operations
  createComment(comment: InsertComment): Promise<Comment>;
  getCommentsByPostId(postId: number): Promise<Comment[]>;
  
  // Like operations
  toggleLike(userId: string, targetId: number, targetType: 'post' | 'comment'): Promise<boolean>;
  getUserLikes(userId: string, targetIds: number[], targetType: 'post' | 'comment'): Promise<Like[]>;
  
  // Clan operations
  createClan(clan: InsertClan): Promise<Clan>;
  getClans(filters?: {
    search?: string;
    game?: string;
    region?: string;
    isPrivate?: boolean;
    minLevel?: number;
    maxLevel?: number;
  }): Promise<(Clan & { memberCount: number; isOwner?: boolean; isMember?: boolean })[]>;
  getClanById(id: number, userId?: string): Promise<(Clan & { 
    members: (ClanMembership & { user: User })[];
    memberCount: number;
    userMembership?: ClanMembership;
    recentEvents: ClanEvent[];
    achievements: ClanAchievement[];
  }) | undefined>;
  updateClan(clanId: number, updates: Partial<Clan>, userId: string): Promise<Clan>;
  deleteClan(clanId: number, userId: string): Promise<void>;
  
  // Clan membership operations
  createClanApplication(application: InsertClanApplication): Promise<ClanApplication>;
  getClanApplications(clanId: number): Promise<(ClanApplication & { user: User })[]>;
  reviewClanApplication(applicationId: number, status: 'approved' | 'rejected', reviewerId: string): Promise<void>;
  joinClan(clanId: number, userId: string, role?: string): Promise<ClanMembership>;
  leaveClan(clanId: number, userId: string): Promise<void>;
  updateClanMembership(membershipId: number, updates: Partial<ClanMembership>, requesterId: string): Promise<ClanMembership>;
  kickClanMember(clanId: number, targetUserId: string, kickerId: string): Promise<void>;
  getClanMembers(clanId: number): Promise<(ClanMembership & { user: User })[]>;
  getUserClanMembership(userId: string): Promise<(ClanMembership & { clan: Clan }) | undefined>;
  getClanMembershipWithPermissions(clanId: number, userId: string): Promise<ClanMembership | undefined>;
  
  // Clan progression
  updateClanXP(clanId: number, xp: number): Promise<void>;
  updateClanTrophies(clanId: number, trophies: number): Promise<void>;
  recordClanMatch(clanId: number, won: boolean, xpGained: number, trophiesGained: number): Promise<void>;
  
  // Clan events
  createClanEvent(event: InsertClanEvent): Promise<ClanEvent>;
  getClanEvents(clanId: number, upcoming?: boolean): Promise<ClanEvent[]>;
  updateClanEvent(eventId: number, updates: Partial<ClanEvent>, userId: string): Promise<ClanEvent>;
  deleteClanEvent(eventId: number, userId: string): Promise<void>;
  joinClanEvent(eventId: number, userId: string, status?: string): Promise<ClanEventParticipant>;
  leaveClanEvent(eventId: number, userId: string): Promise<void>;
  getClanEventParticipants(eventId: number): Promise<(ClanEventParticipant & { user: User })[]>;
  
  // Clan achievements
  unlockClanAchievement(clanId: number, achievementId: string, title: string, description: string, rarity?: string): Promise<ClanAchievement>;
  getClanAchievements(clanId: number): Promise<ClanAchievement[]>;
  
  // Tournament operations
  createTournament(tournament: InsertTournament): Promise<Tournament>;
  getTournaments(): Promise<Tournament[]>;
  getTournamentById(id: number): Promise<Tournament | undefined>;
  joinTournament(tournamentId: number, userId: string, clanId?: number): Promise<TournamentParticipant>;
  getTournamentParticipants(tournamentId: number): Promise<TournamentParticipant[]>;
  createTournamentMatch(match: Omit<TournamentMatch, 'id'>): Promise<TournamentMatch>;
  updateMatchResult(matchId: number, winnerId: number, score: any): Promise<void>;
  
  // Chat operations
  createChatRoom(room: InsertChatRoom): Promise<ChatRoom>;
  getChatRooms(userId: string): Promise<(ChatRoom & { 
    memberCount: number; 
    lastMessage: ChatMessage | null;
    unreadCount: number;
    otherUser?: User;
  })[]>;
  getChatRoom(roomId: number, userId: string): Promise<(ChatRoom & { 
    members: (ChatRoomMembership & { user: User })[];
    memberCount: number;
  }) | null>;
  joinChatRoom(roomId: number, userId: string, role?: string): Promise<ChatRoomMembership>;
  leaveChatRoom(roomId: number, userId: string): Promise<void>;
  updateChatRoom(roomId: number, updates: Partial<ChatRoom>): Promise<ChatRoom>;
  sendMessage(message: InsertChatMessage): Promise<ChatMessage & { user: User }>;
  getMessages(roomId: number, limit?: number, before?: number): Promise<(ChatMessage & { user: User; replyTo?: ChatMessage & { user: User } })[]>;
  editMessage(messageId: number, content: string, userId: string): Promise<ChatMessage>;
  deleteMessage(messageId: number, userId: string): Promise<void>;
  addReaction(messageId: number, emoji: string, userId: string): Promise<void>;
  removeReaction(messageId: number, emoji: string, userId: string): Promise<void>;
  markAsRead(roomId: number, userId: string): Promise<void>;
  searchMessages(roomId: number, query: string, limit?: number): Promise<(ChatMessage & { user: User })[]>;
  getOrCreateDirectRoom(userId1: string, userId2: string): Promise<ChatRoom>;
  
  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string): Promise<Notification[]>;
  markNotificationAsRead(id: number, userId: string): Promise<void>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
  
  // Follow operations
  followUser(followerId: string, followingId: string): Promise<Follow>;
  unfollowUser(followerId: string, followingId: string): Promise<void>;
  getUserFollowers(userId: string): Promise<Follow[]>;
  getUserFollowing(userId: string): Promise<Follow[]>;
  isFollowing(followerId: string, followingId: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserLevel(userId: string, xp: number): Promise<void> {
    const level = Math.floor(xp / 100) + 1; // Simple level calculation
    await db
      .update(users)
      .set({ xp, level, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async getUsersByIds(ids: string[]): Promise<User[]> {
    if (ids.length === 0) return [];
    return await db.select().from(users).where(inArray(users.id, ids));
  }

  // Post operations
  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db.insert(posts).values(post).returning();
    return newPost;
  }

  async getPosts(limit = 50, offset = 0): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getPostById(id: number): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post;
  }

  async getPostsByUserId(userId: string): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .where(eq(posts.userId, userId))
      .orderBy(desc(posts.createdAt));
  }

  async updatePostCounts(postId: number, type: 'like' | 'comment' | 'share', increment: boolean): Promise<void> {
    const field = type === 'like' ? posts.likeCount : 
                  type === 'comment' ? posts.commentCount : posts.shareCount;
    
    await db
      .update(posts)
      .set({
        [type + 'Count']: increment ? sql`${field} + 1` : sql`${field} - 1`,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, postId));
  }

  // Comment operations
  async createComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db.insert(comments).values(comment).returning();
    
    // Update post comment count
    await this.updatePostCounts(comment.postId, 'comment', true);
    
    return newComment;
  }

  async getCommentsByPostId(postId: number): Promise<Comment[]> {
    return await db
      .select()
      .from(comments)
      .where(eq(comments.postId, postId))
      .orderBy(desc(comments.createdAt));
  }

  // Like operations
  async toggleLike(userId: string, targetId: number, targetType: 'post' | 'comment'): Promise<boolean> {
    const existingLike = await db
      .select()
      .from(likes)
      .where(
        and(
          eq(likes.userId, userId),
          eq(likes.targetId, targetId),
          eq(likes.targetType, targetType)
        )
      );

    if (existingLike.length > 0) {
      // Remove like
      await db
        .delete(likes)
        .where(
          and(
            eq(likes.userId, userId),
            eq(likes.targetId, targetId),
            eq(likes.targetType, targetType)
          )
        );
      
      if (targetType === 'post') {
        await this.updatePostCounts(targetId, 'like', false);
      }
      
      return false;
    } else {
      // Add like
      await db.insert(likes).values({
        userId,
        targetId,
        targetType,
      });
      
      if (targetType === 'post') {
        await this.updatePostCounts(targetId, 'like', true);
      }
      
      return true;
    }
  }

  async getUserLikes(userId: string, targetIds: number[], targetType: 'post' | 'comment'): Promise<Like[]> {
    if (targetIds.length === 0) return [];
    return await db
      .select()
      .from(likes)
      .where(
        and(
          eq(likes.userId, userId),
          inArray(likes.targetId, targetIds),
          eq(likes.targetType, targetType)
        )
      );
  }

  // Clan operations
  async createClan(clan: InsertClan): Promise<Clan> {
    const [newClan] = await db.insert(clans).values(clan).returning();
    
    // Add creator as leader
    await db.insert(clanMemberships).values({
      clanId: newClan.id,
      userId: clan.leaderId,
      role: 'leader',
    });
    
    return newClan;
  }

  async getClans(): Promise<Clan[]> {
    return await db.select().from(clans).orderBy(desc(clans.xp));
  }

  async getClanById(id: number): Promise<Clan | undefined> {
    const [clan] = await db.select().from(clans).where(eq(clans.id, id));
    return clan;
  }

  async joinClan(clanId: number, userId: string, role = 'member'): Promise<ClanMembership> {
    const [membership] = await db
      .insert(clanMemberships)
      .values({ clanId, userId, role })
      .returning();
    
    // Update clan member count
    await db
      .update(clans)
      .set({ memberCount: sql`${clans.memberCount} + 1` })
      .where(eq(clans.id, clanId));
    
    return membership;
  }

  async getClanMembers(clanId: number): Promise<(ClanMembership & { user: User })[]> {
    const results = await db
      .select({
        id: clanMemberships.id,
        clanId: clanMemberships.clanId,
        userId: clanMemberships.userId,
        role: clanMemberships.role,
        joinedAt: clanMemberships.joinedAt,
        user: users,
      })
      .from(clanMemberships)
      .innerJoin(users, eq(clanMemberships.userId, users.id))
      .where(eq(clanMemberships.clanId, clanId));
      
    return results.map(r => ({
      id: r.id,
      clanId: r.clanId,
      userId: r.userId,
      role: r.role,
      joinedAt: r.joinedAt,
      user: r.user!
    }));
  }

  async getUserClanMembership(userId: string): Promise<(ClanMembership & { clan: Clan }) | undefined> {
    const [membership] = await db
      .select({
        id: clanMemberships.id,
        clanId: clanMemberships.clanId,
        userId: clanMemberships.userId,
        role: clanMemberships.role,
        joinedAt: clanMemberships.joinedAt,
        clan: clans,
      })
      .from(clanMemberships)
      .innerJoin(clans, eq(clanMemberships.clanId, clans.id))
      .where(eq(clanMemberships.userId, userId));
    
    if (!membership) return undefined;
    
    return {
      id: membership.id,
      clanId: membership.clanId,
      userId: membership.userId,
      role: membership.role,
      joinedAt: membership.joinedAt,
      clan: membership.clan!
    };
  }

  async updateClanXP(clanId: number, xp: number): Promise<void> {
    await db
      .update(clans)
      .set({ xp: sql`${clans.xp} + ${xp}` })
      .where(eq(clans.id, clanId));
  }

  // Tournament operations
  async createTournament(tournament: InsertTournament): Promise<Tournament> {
    const [newTournament] = await db.insert(tournaments).values(tournament).returning();
    return newTournament;
  }

  async getTournaments(): Promise<Tournament[]> {
    return await db
      .select()
      .from(tournaments)
      .orderBy(desc(tournaments.createdAt));
  }

  async getTournamentById(id: number): Promise<Tournament | undefined> {
    const [tournament] = await db.select().from(tournaments).where(eq(tournaments.id, id));
    return tournament;
  }

  async joinTournament(tournamentId: number, userId: string, clanId?: number): Promise<TournamentParticipant> {
    const [participant] = await db
      .insert(tournamentParticipants)
      .values({ tournamentId, userId, clanId })
      .returning();
    
    // Update tournament participant count
    await db
      .update(tournaments)
      .set({ currentParticipants: sql`${tournaments.currentParticipants} + 1` })
      .where(eq(tournaments.id, tournamentId));
    
    return participant;
  }

  async getTournamentParticipants(tournamentId: number): Promise<TournamentParticipant[]> {
    return await db
      .select()
      .from(tournamentParticipants)
      .where(eq(tournamentParticipants.tournamentId, tournamentId));
  }

  async createTournamentMatch(match: Omit<TournamentMatch, 'id'>): Promise<TournamentMatch> {
    const [newMatch] = await db.insert(tournamentMatches).values(match).returning();
    return newMatch;
  }

  async updateMatchResult(matchId: number, winnerId: number, score: any): Promise<void> {
    await db
      .update(tournamentMatches)
      .set({
        winnerId,
        score,
        status: 'completed',
        completedAt: new Date(),
      })
      .where(eq(tournamentMatches.id, matchId));
  }

  // Chat operations
  async createChatRoom(room: Omit<ChatRoom, 'id' | 'createdAt'>): Promise<ChatRoom> {
    const [newRoom] = await db.insert(chatRooms).values(room).returning();
    return newRoom;
  }

  async getChatRooms(userId: string): Promise<ChatRoom[]> {
    const results = await db
      .select()
      .from(chatRooms)
      .innerJoin(chatRoomMemberships, eq(chatRooms.id, chatRoomMemberships.roomId))
      .where(eq(chatRoomMemberships.userId, userId));
      
    return results.map(r => r.chat_rooms);
  }

  async joinChatRoom(roomId: number, userId: string): Promise<void> {
    await db.insert(chatRoomMemberships).values({ roomId, userId });
  }

  async sendMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db.insert(chatMessages).values(message).returning();
    return newMessage;
  }

  async getMessages(roomId: number, limit = 50): Promise<(ChatMessage & { user: User })[]> {
    const results = await db
      .select({
        id: chatMessages.id,
        roomId: chatMessages.roomId,
        userId: chatMessages.userId,
        content: chatMessages.content,
        messageType: chatMessages.messageType,
        metadata: chatMessages.metadata,
        createdAt: chatMessages.createdAt,
        user: users,
      })
      .from(chatMessages)
      .innerJoin(users, eq(chatMessages.userId, users.id))
      .where(eq(chatMessages.roomId, roomId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);
      
    return results.map(r => ({
      id: r.id,
      roomId: r.roomId,
      userId: r.userId,
      content: r.content,
      messageType: r.messageType,
      metadata: r.metadata,
      createdAt: r.createdAt,
      user: r.user!
    }));
  }

  // Notification operations
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationAsRead(id: number, userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));
  }

  // Follow operations
  async followUser(followerId: string, followingId: string): Promise<Follow> {
    const [follow] = await db
      .insert(follows)
      .values({ followerId, followingId })
      .returning();
    return follow;
  }

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    await db
      .delete(follows)
      .where(
        and(
          eq(follows.followerId, followerId),
          eq(follows.followingId, followingId)
        )
      );
  }

  async getUserFollowers(userId: string): Promise<Follow[]> {
    return await db
      .select()
      .from(follows)
      .where(eq(follows.followingId, userId));
  }

  async getUserFollowing(userId: string): Promise<Follow[]> {
    return await db
      .select()
      .from(follows)
      .where(eq(follows.followerId, userId));
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const [follow] = await db
      .select()
      .from(follows)
      .where(
        and(
          eq(follows.followerId, followerId),
          eq(follows.followingId, followingId)
        )
      );
    return !!follow;
  }
}

import { MemoryStorage } from "./memory-storage";

// Use memory storage to avoid database connection issues
export const storage = new MemoryStorage();
// Uncomment below when database is properly configured
// export const storage = new DatabaseStorage();
