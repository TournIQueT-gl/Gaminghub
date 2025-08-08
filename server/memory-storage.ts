import { IStorage } from "./storage";
import type {
  User,
  UpsertUser,
  Post,
  InsertPost,
  Comment,
  InsertComment,
  Like,
  Clan,
  InsertClan,
  ClanMembership,
  InsertClanMembership,
  ClanApplication,
  InsertClanApplication,
  ClanEvent,
  InsertClanEvent,
  ClanEventParticipant,
  ClanAchievement,
  Tournament,
  InsertTournament,
  TournamentParticipant,
  TournamentMatch,
  ChatRoom,
  ChatMessage,
  InsertChatMessage,
  ChatRoomMembership,
  InsertChatRoom,
  Notification,
  InsertNotification,
  Follow,
} from "@shared/schema";

export class MemoryStorage implements IStorage {
  private users = new Map<string, User>();
  private posts = new Map<number, Post>();
  private comments = new Map<number, Comment>();
  private likes = new Map<number, Like>();
  private clans = new Map<number, Clan>();
  private clanMemberships = new Map<number, ClanMembership>();
  private clanApplications = new Map<number, ClanApplication>();
  private clanEvents = new Map<number, ClanEvent>();
  private clanEventParticipants = new Map<number, ClanEventParticipant>();
  private clanAchievements = new Map<number, ClanAchievement>();
  private tournaments = new Map<number, Tournament>();
  private tournamentParticipants = new Map<number, TournamentParticipant>();
  private tournamentMatches = new Map<number, TournamentMatch>();
  private tournamentBrackets = new Map<number, TournamentBracket>();
  private tournamentPrizes = new Map<number, TournamentPrize>();
  private chatRooms = new Map<number, ChatRoom>();
  private chatMessages = new Map<number, ChatMessage>();
  private chatRoomMemberships = new Map<number, ChatRoomMembership>();
  private notifications = new Map<number, Notification>();
  private follows = new Map<number, Follow>();
  private activities = new Map<number, Activity>();
  private userSocials = new Map<number, UserSocial>();
  private userBadges = new Map<number, UserBadge>();
  private friendRequests = new Map<number, FriendRequest>();
  private userBlocks = new Map<number, UserBlock>();
  private userPreferences = new Map<string, UserPreferences>();
  private userGames = new Map<number, UserGame>();
  private gameAchievements = new Map<number, GameAchievement>();
  private gameSessions = new Map<number, GameSession>();
  private gameStatistics = new Map<string, GameStatistics>(); // key: userId-gameId
  private gameLeaderboards = new Map<string, GameLeaderboard>();
  private gameReviews = new Map<number, GameReview>();
  private gameLibrarySyncs = new Map<number, GameLibrarySync>();
  private notificationSettings = new Map<string, NotificationSettings[]>(); // key: userId
  private pushSubscriptions = new Map<number, PushSubscription>();
  private streams = new Map<number, Stream>();
  private streamFollows = new Map<number, StreamFollow>();
  private streamChats = new Map<number, StreamChat>();
  private contentPieces = new Map<number, ContentPiece>();

  private postIdCounter = 1;
  private commentIdCounter = 1;
  private likeIdCounter = 1;
  private clanIdCounter = 1;
  private membershipIdCounter = 1;
  private clanApplicationIdCounter = 1;
  private clanEventIdCounter = 1;
  private clanEventParticipantIdCounter = 1;
  private clanAchievementIdCounter = 1;
  private tournamentIdCounter = 1;
  private participantIdCounter = 1;
  private matchIdCounter = 1;
  private bracketIdCounter = 1;
  private prizeIdCounter = 1;
  private roomIdCounter = 1;
  private messageIdCounter = 1;
  private notificationIdCounter = 1;
  private followIdCounter = 1;
  private activityIdCounter = 1;
  private socialIdCounter = 1;
  private badgeIdCounter = 1;
  private friendRequestIdCounter = 1;
  private blockIdCounter = 1;
  private userGameIdCounter = 1;
  private gameAchievementIdCounter = 1;
  private gameSessionIdCounter = 1;
  private gameReviewIdCounter = 1;
  private gameLibrarySyncIdCounter = 1;
  private pushSubscriptionIdCounter = 1;
  private chatRoomMembershipIdCounter = 1;
  private streamIdCounter = 1;
  private streamFollowIdCounter = 1;
  private streamChatIdCounter = 1;
  private contentPieceIdCounter = 1;

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existing = this.users.get(userData.id!);
    const user: User = {
      id: userData.id!,
      email: userData.email !== undefined ? userData.email : existing?.email || null,
      firstName: userData.firstName !== undefined ? userData.firstName : existing?.firstName || null,
      lastName: userData.lastName !== undefined ? userData.lastName : existing?.lastName || null,
      profileImageUrl: userData.profileImageUrl !== undefined ? userData.profileImageUrl : existing?.profileImageUrl || null,
      coverImageUrl: userData.coverImageUrl !== undefined ? userData.coverImageUrl : existing?.coverImageUrl || null,
      username: userData.username !== undefined ? userData.username : existing?.username || `User${Math.floor(Math.random() * 1000)}`,
      bio: userData.bio !== undefined ? userData.bio : existing?.bio || null,
      location: userData.location !== undefined ? userData.location : existing?.location || null,
      website: userData.website !== undefined ? userData.website : existing?.website || null,
      favoriteGames: userData.favoriteGames !== undefined ? userData.favoriteGames : existing?.favoriteGames || [],
      level: userData.level !== undefined ? userData.level : existing?.level || 1,
      xp: userData.xp !== undefined ? userData.xp : existing?.xp || 0,
      role: userData.role !== undefined ? userData.role : existing?.role || "user",
      isVerified: userData.isVerified !== undefined ? userData.isVerified : existing?.isVerified || false,
      socialLinks: userData.socialLinks !== undefined ? userData.socialLinks : existing?.socialLinks || [],
      createdAt: existing?.createdAt || userData.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUserLevel(userId: string, xp: number): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.xp = (user.xp || 0) + xp;
      // Enhanced leveling formula: exponential growth
      user.level = this.calculateLevel(user.xp);
      user.updatedAt = new Date();
    }
  }

  private calculateLevel(xp: number): number {
    // Exponential leveling: each level requires more XP
    // Level 1: 0 XP, Level 2: 100 XP, Level 3: 250 XP, Level 4: 450 XP, etc.
    let level = 1;
    let requiredXP = 0;
    
    while (xp >= requiredXP) {
      level++;
      requiredXP += level * 50; // Each level requires 50 * level XP more than previous
    }
    
    return level - 1;
  }

  getXPForLevel(level: number): number {
    let totalXP = 0;
    for (let i = 2; i <= level; i++) {
      totalXP += i * 50;
    }
    return totalXP;
  }

  getNextLevelXP(level: number): number {
    return this.getXPForLevel(level + 1);
  }

  async getUsersByIds(ids: string[]): Promise<User[]> {
    return ids.map(id => this.users.get(id)).filter(Boolean) as User[];
  }

  async createPost(post: InsertPost): Promise<Post> {
    const newPost: Post = {
      id: this.postIdCounter++,
      ...post,
      likeCount: 0,
      commentCount: 0,
      shareCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.posts.set(newPost.id, newPost);
    return newPost;
  }

  async getPosts(limit = 50, offset = 0): Promise<Post[]> {
    const allPosts = Array.from(this.posts.values())
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
    return allPosts.slice(offset, offset + limit);
  }

  async getPostById(id: number): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async getPostsByUserId(userId: string): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter(post => post.userId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async updatePostCounts(postId: number, type: 'like' | 'comment' | 'share', increment: boolean): Promise<void> {
    const post = this.posts.get(postId);
    if (post) {
      const change = increment ? 1 : -1;
      if (type === 'like') post.likeCount = Math.max(0, (post.likeCount || 0) + change);
      else if (type === 'comment') post.commentCount = Math.max(0, (post.commentCount || 0) + change);
      else if (type === 'share') post.shareCount = Math.max(0, (post.shareCount || 0) + change);
      post.updatedAt = new Date();
    }
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const newComment: Comment = {
      id: this.commentIdCounter++,
      ...comment,
      likeCount: 0,
      createdAt: new Date(),
    };
    this.comments.set(newComment.id, newComment);
    
    // Update post comment count
    await this.updatePostCounts(comment.postId, 'comment', true);
    
    return newComment;
  }

  async getCommentsByPostId(postId: number): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.postId === postId)
      .sort((a, b) => a.createdAt!.getTime() - b.createdAt!.getTime());
  }

  async toggleLike(userId: string, targetId: number, targetType: 'post' | 'comment'): Promise<boolean> {
    const existingLike = Array.from(this.likes.values())
      .find(like => like.userId === userId && like.targetId === targetId && like.targetType === targetType);

    if (existingLike) {
      this.likes.delete(existingLike.id);
      if (targetType === 'post') {
        await this.updatePostCounts(targetId, 'like', false);
      }
      return false;
    } else {
      const newLike: Like = {
        id: this.likeIdCounter++,
        userId,
        targetId,
        targetType,
        createdAt: new Date(),
      };
      this.likes.set(newLike.id, newLike);
      if (targetType === 'post') {
        await this.updatePostCounts(targetId, 'like', true);
      }
      return true;
    }
  }

  async getUserLikes(userId: string, targetIds: number[], targetType: 'post' | 'comment'): Promise<Like[]> {
    return Array.from(this.likes.values())
      .filter(like => 
        like.userId === userId && 
        targetIds.includes(like.targetId) && 
        like.targetType === targetType
      );
  }

  async createClan(clan: InsertClan): Promise<Clan> {
    const newClan: Clan = {
      id: this.clanIdCounter++,
      ...clan,
      memberCount: 1,
      xp: 0,
      createdAt: new Date(),
    };
    this.clans.set(newClan.id, newClan);
    return newClan;
  }

  async getClans(): Promise<Clan[]> {
    return Array.from(this.clans.values());
  }

  async getClanById(id: number): Promise<Clan | undefined> {
    return this.clans.get(id);
  }

  async joinClan(clanId: number, userId: string, role = 'member'): Promise<ClanMembership> {
    const membership: ClanMembership = {
      id: this.membershipIdCounter++,
      clanId,
      userId,
      role,
      joinedAt: new Date(),
    };
    this.clanMemberships.set(membership.id, membership);
    
    // Update clan member count
    const clan = this.clans.get(clanId);
    if (clan) {
      clan.memberCount = (clan.memberCount || 0) + 1;
    }
    
    return membership;
  }

  async getClanMembers(clanId: number): Promise<(ClanMembership & { user: User })[]> {
    return Array.from(this.clanMemberships.values())
      .filter(membership => membership.clanId === clanId)
      .map(membership => ({
        ...membership,
        user: this.users.get(membership.userId)!
      }))
      .filter(item => item.user);
  }

  async getUserClanMembership(userId: string): Promise<(ClanMembership & { clan: Clan }) | undefined> {
    const membership = Array.from(this.clanMemberships.values())
      .find(membership => membership.userId === userId);
    
    if (membership) {
      const clan = this.clans.get(membership.clanId);
      if (clan) {
        return { ...membership, clan };
      }
    }
    return undefined;
  }

  async updateClanXP(clanId: number, xp: number): Promise<void> {
    const clan = this.clans.get(clanId);
    if (clan) {
      clan.xp = (clan.xp || 0) + xp;
    }
  }

  async createTournament(tournament: InsertTournament): Promise<Tournament> {
    const newTournament: Tournament = {
      id: this.tournamentIdCounter++,
      ...tournament,
      currentParticipants: 0,
      createdAt: new Date(),
    };
    this.tournaments.set(newTournament.id, newTournament);
    return newTournament;
  }

  async getTournaments(): Promise<Tournament[]> {
    return Array.from(this.tournaments.values());
  }

  async getTournamentById(id: number): Promise<Tournament | undefined> {
    return this.tournaments.get(id);
  }

  async joinTournament(tournamentId: number, userId: string, clanId?: number): Promise<TournamentParticipant> {
    const participant: TournamentParticipant = {
      id: this.participantIdCounter++,
      tournamentId,
      userId,
      clanId,
      status: 'registered',
      joinedAt: new Date(),
    };
    this.tournamentParticipants.set(participant.id, participant);
    return participant;
  }

  async getTournamentParticipants(tournamentId: number): Promise<TournamentParticipant[]> {
    return Array.from(this.tournamentParticipants.values())
      .filter(participant => participant.tournamentId === tournamentId);
  }

  async createTournamentMatch(match: Omit<TournamentMatch, 'id'>): Promise<TournamentMatch> {
    const newMatch: TournamentMatch = {
      id: this.matchIdCounter++,
      ...match,
    };
    this.tournamentMatches.set(newMatch.id, newMatch);
    return newMatch;
  }

  async updateMatchResult(matchId: number, winnerId: number, score: any): Promise<void> {
    const match = this.tournamentMatches.get(matchId);
    if (match) {
      match.winnerId = winnerId;
      match.score = score;
      match.status = 'completed';
      match.completedAt = new Date();
    }
  }

  async createChatRoom(room: InsertChatRoom): Promise<ChatRoom> {
    const newRoom: ChatRoom = {
      id: this.roomIdCounter++,
      ...room,
      lastMessageAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.chatRooms.set(newRoom.id, newRoom);
    return newRoom;
  }

  async getChatRooms(userId: string): Promise<(ChatRoom & { 
    memberCount: number; 
    lastMessage: ChatMessage | null;
    unreadCount: number;
    otherUser?: User;
  })[]> {
    const userMemberships = Array.from(this.chatRoomMemberships.values())
      .filter(membership => membership.userId === userId && !membership.leftAt);
    
    return userMemberships.map(membership => {
      const room = this.chatRooms.get(membership.roomId)!;
      if (!room) return null;

      const allMembers = Array.from(this.chatRoomMemberships.values())
        .filter(m => m.roomId === room.id && !m.leftAt);
      
      const lastMessage = Array.from(this.chatMessages.values())
        .filter(msg => msg.roomId === room.id && !msg.isDeleted)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0] || null;

      const unreadCount = Array.from(this.chatMessages.values())
        .filter(msg => 
          msg.roomId === room.id && 
          !msg.isDeleted &&
          msg.userId !== userId &&
          (!membership.lastReadAt || msg.createdAt > membership.lastReadAt)
        ).length;

      let otherUser: User | undefined;
      if (room.type === 'direct' && allMembers.length === 2) {
        const otherMember = allMembers.find(m => m.userId !== userId);
        if (otherMember) {
          otherUser = this.users.get(otherMember.userId);
        }
      }

      return {
        ...room,
        memberCount: allMembers.length,
        lastMessage,
        unreadCount,
        otherUser,
      };
    }).filter(Boolean) as any[];
  }

  async getChatRoom(roomId: number, userId: string): Promise<(ChatRoom & { 
    members: (ChatRoomMembership & { user: User })[];
    memberCount: number;
  }) | null> {
    const room = this.chatRooms.get(roomId);
    if (!room) return null;

    const members = Array.from(this.chatRoomMemberships.values())
      .filter(m => m.roomId === roomId && !m.leftAt)
      .map(membership => ({
        ...membership,
        user: this.users.get(membership.userId)!,
      }))
      .filter(m => m.user);

    return {
      ...room,
      members,
      memberCount: members.length,
    };
  }

  async joinChatRoom(roomId: number, userId: string, role = 'member'): Promise<ChatRoomMembership> {
    const membership: ChatRoomMembership = {
      id: this.chatRoomMembershipIdCounter++,
      roomId,
      userId,
      role,
      nickname: null,
      lastReadAt: null,
      mutedUntil: null,
      isBlocked: false,
      joinedAt: new Date(),
      leftAt: null,
    };
    this.chatRoomMemberships.set(membership.id, membership);
    return membership;
  }

  async leaveChatRoom(roomId: number, userId: string): Promise<void> {
    const membership = Array.from(this.chatRoomMemberships.values())
      .find(m => m.roomId === roomId && m.userId === userId && !m.leftAt);
    
    if (membership) {
      membership.leftAt = new Date();
    }
  }

  async updateChatRoom(roomId: number, updates: Partial<ChatRoom>): Promise<ChatRoom> {
    const room = this.chatRooms.get(roomId);
    if (!room) throw new Error('Room not found');

    const updatedRoom = { ...room, ...updates, updatedAt: new Date() };
    this.chatRooms.set(roomId, updatedRoom);
    return updatedRoom;
  }

  async sendMessage(message: InsertChatMessage): Promise<ChatMessage & { user: User }> {
    const newMessage: ChatMessage = {
      id: this.messageIdCounter++,
      ...message,
      messageType: message.messageType || 'text',
      attachments: message.attachments || null,
      replyToId: message.replyToId || null,
      isEdited: false,
      editedAt: null,
      isDeleted: false,
      reactions: message.reactions || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.chatMessages.set(newMessage.id, newMessage);

    // Update room's last message time
    const room = this.chatRooms.get(message.roomId);
    if (room) {
      room.lastMessageAt = new Date();
      room.updatedAt = new Date();
    }

    const user = this.users.get(message.userId)!;
    return { ...newMessage, user };
  }

  async getMessages(roomId: number, limit = 50, before?: number): Promise<(ChatMessage & { user: User; replyTo?: ChatMessage & { user: User } })[]> {
    let messages = Array.from(this.chatMessages.values())
      .filter(message => message.roomId === roomId && !message.isDeleted);

    if (before) {
      messages = messages.filter(msg => msg.id < before);
    }

    messages = messages
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);

    return messages.map(message => {
      const user = this.users.get(message.userId)!;
      let replyTo: (ChatMessage & { user: User }) | undefined;
      
      if (message.replyToId) {
        const replyMessage = this.chatMessages.get(message.replyToId);
        if (replyMessage) {
          const replyUser = this.users.get(replyMessage.userId)!;
          replyTo = { ...replyMessage, user: replyUser };
        }
      }

      return { ...message, user, replyTo };
    }).filter(m => m.user);
  }

  async editMessage(messageId: number, content: string, userId: string): Promise<ChatMessage> {
    const message = this.chatMessages.get(messageId);
    if (!message || message.userId !== userId) {
      throw new Error('Message not found or unauthorized');
    }

    message.content = content;
    message.isEdited = true;
    message.editedAt = new Date();
    message.updatedAt = new Date();

    return message;
  }

  async deleteMessage(messageId: number, userId: string): Promise<void> {
    const message = this.chatMessages.get(messageId);
    if (!message || message.userId !== userId) {
      throw new Error('Message not found or unauthorized');
    }

    message.isDeleted = true;
    message.updatedAt = new Date();
  }

  async addReaction(messageId: number, emoji: string, userId: string): Promise<void> {
    const message = this.chatMessages.get(messageId);
    if (!message) throw new Error('Message not found');

    const reactions = Array.isArray(message.reactions) ? message.reactions : [];
    const existingReaction = reactions.find((r: any) => r.emoji === emoji);

    if (existingReaction) {
      if (!existingReaction.userIds.includes(userId)) {
        existingReaction.userIds.push(userId);
      }
    } else {
      reactions.push({ emoji, userIds: [userId] });
    }

    message.reactions = reactions;
    message.updatedAt = new Date();
  }

  async removeReaction(messageId: number, emoji: string, userId: string): Promise<void> {
    const message = this.chatMessages.get(messageId);
    if (!message) throw new Error('Message not found');

    const reactions = Array.isArray(message.reactions) ? message.reactions : [];
    const reactionIndex = reactions.findIndex((r: any) => r.emoji === emoji);

    if (reactionIndex !== -1) {
      const reaction = reactions[reactionIndex];
      reaction.userIds = reaction.userIds.filter((id: string) => id !== userId);
      
      if (reaction.userIds.length === 0) {
        reactions.splice(reactionIndex, 1);
      }
    }

    message.reactions = reactions;
    message.updatedAt = new Date();
  }

  async markAsRead(roomId: number, userId: string): Promise<void> {
    const membership = Array.from(this.chatRoomMemberships.values())
      .find(m => m.roomId === roomId && m.userId === userId && !m.leftAt);

    if (membership) {
      membership.lastReadAt = new Date();
    }
  }

  async searchMessages(roomId: number, query: string, limit = 20): Promise<(ChatMessage & { user: User })[]> {
    const messages = Array.from(this.chatMessages.values())
      .filter(message => 
        message.roomId === roomId && 
        !message.isDeleted &&
        message.content.toLowerCase().includes(query.toLowerCase())
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);

    return messages.map(message => ({
      ...message,
      user: this.users.get(message.userId)!,
    })).filter(m => m.user);
  }

  async getOrCreateDirectRoom(userId1: string, userId2: string): Promise<ChatRoom> {
    // Find existing direct room between these users
    const user1Memberships = Array.from(this.chatRoomMemberships.values())
      .filter(m => m.userId === userId1 && !m.leftAt);
    
    for (const membership of user1Memberships) {
      const room = this.chatRooms.get(membership.roomId);
      if (room?.type === 'direct') {
        const otherMembership = Array.from(this.chatRoomMemberships.values())
          .find(m => m.roomId === room.id && m.userId === userId2 && !m.leftAt);
        
        if (otherMembership) {
          return room;
        }
      }
    }

    // Create new direct room
    const room = await this.createChatRoom({
      name: null,
      description: null,
      type: 'direct',
      isPrivate: true,
      maxMembers: 2,
      createdBy: userId1,
    });

    // Add both users to the room
    await this.joinChatRoom(room.id, userId1, 'member');
    await this.joinChatRoom(room.id, userId2, 'member');

    return room;
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const newNotification: Notification = {
      id: this.notificationIdCounter++,
      ...notification,
      createdAt: new Date(),
    };
    this.notifications.set(newNotification.id, newNotification);
    return newNotification;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async markNotificationAsRead(id: number, userId: string): Promise<void> {
    const notification = this.notifications.get(id);
    if (notification && notification.userId === userId) {
      notification.isRead = true;
    }
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    for (const notification of this.notifications.values()) {
      if (notification.userId === userId) {
        notification.isRead = true;
      }
    }
  }

  async followUser(followerId: string, followingId: string): Promise<Follow> {
    const follow: Follow = {
      id: this.followIdCounter++,
      followerId,
      followingId,
      createdAt: new Date(),
    };
    this.follows.set(follow.id, follow);
    return follow;
  }

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    for (const [id, follow] of this.follows.entries()) {
      if (follow.followerId === followerId && follow.followingId === followingId) {
        this.follows.delete(id);
        break;
      }
    }
  }

  async getUserFollowers(userId: string): Promise<Follow[]> {
    return Array.from(this.follows.values())
      .filter(follow => follow.followingId === userId);
  }

  async getUserFollowing(userId: string): Promise<Follow[]> {
    return Array.from(this.follows.values())
      .filter(follow => follow.followerId === userId);
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    return Array.from(this.follows.values())
      .some(follow => follow.followerId === followerId && follow.followingId === followingId);
  }

  // Gaming library operations
  async addGameToLibrary(game: InsertUserGame): Promise<UserGame> {
    const existing = Array.from(this.userGames.values())
      .find(g => g.userId === game.userId && g.gameId === game.gameId && g.platform === game.platform);
    
    if (existing) {
      throw new Error('Game already in library for this platform');
    }

    const newGame: UserGame = {
      id: this.userGameIdCounter++,
      ...game,
      hoursPlayed: game.hoursPlayed || '0',
      isPlaying: false,
      isFavorite: game.isFavorite || false,
      isPublic: game.isPublic !== false,
      addedAt: new Date(),
      updatedAt: new Date(),
    };
    this.userGames.set(newGame.id, newGame);
    return newGame;
  }

  async removeGameFromLibrary(gameId: string, userId: string): Promise<void> {
    const game = Array.from(this.userGames.values())
      .find(g => g.gameId === gameId && g.userId === userId);
    
    if (game) {
      this.userGames.delete(game.id);
    }
  }

  async updateGameInLibrary(gameId: string, userId: string, updates: Partial<UserGame>): Promise<UserGame> {
    const game = Array.from(this.userGames.values())
      .find(g => g.gameId === gameId && g.userId === userId);
    
    if (!game) throw new Error('Game not found in library');

    const updatedGame = { ...game, ...updates, updatedAt: new Date() };
    this.userGames.set(game.id, updatedGame);
    return updatedGame;
  }

  async getUserGameLibrary(userId: string, filters?: {
    platform?: string;
    isFavorite?: boolean;
    isPlaying?: boolean;
  }): Promise<UserGame[]> {
    let games = Array.from(this.userGames.values())
      .filter(game => game.userId === userId);

    if (filters) {
      if (filters.platform) {
        games = games.filter(game => game.platform === filters.platform);
      }
      if (filters.isFavorite !== undefined) {
        games = games.filter(game => game.isFavorite === filters.isFavorite);
      }
      if (filters.isPlaying !== undefined) {
        games = games.filter(game => game.isPlaying === filters.isPlaying);
      }
    }

    return games.sort((a, b) => {
      if (a.lastPlayed && b.lastPlayed) {
        return b.lastPlayed.getTime() - a.lastPlayed.getTime();
      }
      return b.addedAt.getTime() - a.addedAt.getTime();
    });
  }

  async getGameById(gameId: string, userId: string): Promise<UserGame | undefined> {
    return Array.from(this.userGames.values())
      .find(game => game.gameId === gameId && game.userId === userId);
  }

  async startGameSession(session: InsertGameSession): Promise<GameSession> {
    const newSession: GameSession = {
      id: this.gameSessionIdCounter++,
      ...session,
      sessionEnd: null,
      duration: null,
      score: session.score || null,
      kills: session.kills || null,
      deaths: session.deaths || null,
      assists: session.assists || null,
      wins: session.wins || 0,
      losses: session.losses || 0,
      xpGained: session.xpGained || 0,
      notes: session.notes || null,
      isPublic: session.isPublic !== false,
      createdAt: new Date(),
    };
    this.gameSessions.set(newSession.id, newSession);

    await this.updateGameInLibrary(session.gameId, session.userId, { 
      isPlaying: true, 
      lastPlayed: new Date() 
    });

    return newSession;
  }

  async endGameSession(sessionId: number, sessionEnd: Date, stats?: {
    duration?: number;
    score?: number;
    kills?: number;
    deaths?: number;
    assists?: number;
    wins?: number;
    losses?: number;
    xpGained?: number;
  }): Promise<GameSession> {
    const session = this.gameSessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    const updatedSession = {
      ...session,
      sessionEnd,
      duration: stats?.duration || Math.floor((sessionEnd.getTime() - session.sessionStart.getTime()) / 60000),
      score: stats?.score || session.score,
      kills: stats?.kills || session.kills,
      deaths: stats?.deaths || session.deaths,
      assists: stats?.assists || session.assists,
      wins: stats?.wins || session.wins,
      losses: stats?.losses || session.losses,
      xpGained: stats?.xpGained || session.xpGained,
    };
    this.gameSessions.set(sessionId, updatedSession);

    const game = await this.getGameById(session.gameId, session.userId);
    await this.updateGameInLibrary(session.gameId, session.userId, { 
      isPlaying: false,
      hoursPlayed: (parseFloat(game ? game.hoursPlayed : '0') + (updatedSession.duration! / 60)).toString()
    });

    return updatedSession;
  }

  async getUserGameSessions(userId: string, gameId?: string, limit = 50): Promise<GameSession[]> {
    let sessions = Array.from(this.gameSessions.values())
      .filter(session => session.userId === userId);

    if (gameId) {
      sessions = sessions.filter(session => session.gameId === gameId);
    }

    return sessions
      .sort((a, b) => b.sessionStart.getTime() - a.sessionStart.getTime())
      .slice(0, limit);
  }

  async unlockGameAchievement(achievement: InsertGameAchievement): Promise<GameAchievement> {
    const existing = Array.from(this.gameAchievements.values())
      .find(a => a.userId === achievement.userId && a.gameId === achievement.gameId && a.achievementId === achievement.achievementId);
    
    if (existing) {
      existing.progress = Math.min(existing.progress + 1, existing.maxProgress);
      return existing;
    }

    const newAchievement: GameAchievement = {
      id: this.gameAchievementIdCounter++,
      ...achievement,
      iconUrl: achievement.iconUrl || null,
      rarity: achievement.rarity || 'common',
      points: achievement.points || 0,
      progress: achievement.progress || 1,
      maxProgress: achievement.maxProgress || 1,
      isSecret: achievement.isSecret || false,
      unlockedAt: new Date(),
    };
    this.gameAchievements.set(newAchievement.id, newAchievement);
    return newAchievement;
  }

  async getUserGameAchievements(userId: string, gameId?: string): Promise<GameAchievement[]> {
    let achievements = Array.from(this.gameAchievements.values())
      .filter(achievement => achievement.userId === userId);

    if (gameId) {
      achievements = achievements.filter(achievement => achievement.gameId === gameId);
    }

    return achievements.sort((a, b) => b.unlockedAt.getTime() - a.unlockedAt.getTime());
  }

  async updateAchievementProgress(achievementId: number, progress: number): Promise<void> {
    const achievement = this.gameAchievements.get(achievementId);
    if (achievement) {
      achievement.progress = Math.min(progress, achievement.maxProgress);
    }
  }

  async getGameStatistics(userId: string, gameId: string): Promise<GameStatistics | undefined> {
    const key = `${userId}-${gameId}`;
    return this.gameStatistics.get(key);
  }

  async updateGameStatistics(userId: string, gameId: string, sessionStats: {
    duration: number;
    kills?: number;
    deaths?: number;
    assists?: number;
    wins?: number;
    losses?: number;
    score?: number;
    xpGained?: number;
  }): Promise<GameStatistics> {
    const key = `${userId}-${gameId}`;
    const game = await this.getGameById(gameId, userId);
    const gameName = game?.gameName || 'Unknown Game';
    
    let stats = this.gameStatistics.get(key);
    
    if (!stats) {
      stats = {
        id: Object.keys(this.gameStatistics).length + 1,
        userId,
        gameId,
        gameName,
        totalHours: '0',
        totalSessions: 0,
        totalKills: 0,
        totalDeaths: 0,
        totalAssists: 0,
        totalWins: 0,
        totalLosses: 0,
        totalScore: 0,
        averageScore: '0',
        bestScore: 0,
        killDeathRatio: '0',
        winRate: '0',
        currentStreak: 0,
        bestStreak: 0,
        lastPlayed: null,
        updatedAt: new Date(),
      };
    }

    stats.totalHours = (parseFloat(stats.totalHours) + (sessionStats.duration / 60)).toString();
    stats.totalSessions += 1;
    stats.totalKills += sessionStats.kills || 0;
    stats.totalDeaths += sessionStats.deaths || 0;
    stats.totalAssists += sessionStats.assists || 0;
    stats.totalWins += sessionStats.wins || 0;
    stats.totalLosses += sessionStats.losses || 0;
    stats.totalScore += sessionStats.score || 0;
    stats.averageScore = (stats.totalScore / stats.totalSessions).toString();
    stats.bestScore = Math.max(stats.bestScore, sessionStats.score || 0);
    stats.killDeathRatio = stats.totalDeaths > 0 ? (stats.totalKills / stats.totalDeaths).toString() : stats.totalKills.toString();
    stats.winRate = (stats.totalWins + stats.totalLosses) > 0 ? (stats.totalWins / (stats.totalWins + stats.totalLosses) * 100).toString() : '0';
    stats.lastPlayed = new Date();
    stats.updatedAt = new Date();

    if (sessionStats.wins && sessionStats.wins > 0) {
      stats.currentStreak += sessionStats.wins;
      stats.bestStreak = Math.max(stats.bestStreak, stats.currentStreak);
    } else if (sessionStats.losses && sessionStats.losses > 0) {
      stats.currentStreak = 0;
    }

    this.gameStatistics.set(key, stats);
    return stats;
  }

  async getTopGames(userId: string, metric: 'hours' | 'score' | 'wins', limit = 10): Promise<GameStatistics[]> {
    const userStats = Array.from(this.gameStatistics.values())
      .filter(stats => stats.userId === userId);

    return userStats.sort((a, b) => {
      switch (metric) {
        case 'hours':
          return parseFloat(b.totalHours) - parseFloat(a.totalHours);
        case 'score':
          return b.totalScore - a.totalScore;
        case 'wins':
          return b.totalWins - a.totalWins;
        default:
          return 0;
      }
    }).slice(0, limit);
  }

  async createGameReview(review: InsertGameReview): Promise<GameReview> {
    const existing = Array.from(this.gameReviews.values())
      .find(r => r.userId === review.userId && r.gameId === review.gameId);
    
    if (existing) {
      throw new Error('You have already reviewed this game');
    }

    const newReview: GameReview = {
      id: this.gameReviewIdCounter++,
      ...review,
      title: review.title || null,
      content: review.content || null,
      hoursPlayed: review.hoursPlayed || null,
      isRecommended: review.isRecommended || null,
      isVisible: review.isVisible !== false,
      helpfulVotes: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.gameReviews.set(newReview.id, newReview);
    return newReview;
  }

  async updateGameReview(reviewId: number, updates: Partial<GameReview>, userId: string): Promise<GameReview> {
    const review = this.gameReviews.get(reviewId);
    if (!review) throw new Error('Review not found');
    if (review.userId !== userId) throw new Error('Permission denied');

    const updatedReview = { ...review, ...updates, updatedAt: new Date() };
    this.gameReviews.set(reviewId, updatedReview);
    return updatedReview;
  }

  async deleteGameReview(reviewId: number, userId: string): Promise<void> {
    const review = this.gameReviews.get(reviewId);
    if (!review) throw new Error('Review not found');
    if (review.userId !== userId) throw new Error('Permission denied');

    this.gameReviews.delete(reviewId);
  }

  async getGameReviews(gameId: string, limit = 20): Promise<(GameReview & { user: User })[]> {
    const reviews = Array.from(this.gameReviews.values())
      .filter(review => review.gameId === gameId && review.isVisible)
      .sort((a, b) => b.helpfulVotes - a.helpfulVotes || b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);

    return reviews.map(review => ({
      ...review,
      user: this.users.get(review.userId)!,
    })).filter(r => r.user);
  }

  async getUserGameReviews(userId: string): Promise<GameReview[]> {
    return Array.from(this.gameReviews.values())
      .filter(review => review.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getGameLeaderboard(gameId: string, type: string, period = 'all-time', region?: string, limit = 100): Promise<(GameStatistics & { user: User; rank: number })[]> {
    let stats = Array.from(this.gameStatistics.values())
      .filter(stat => stat.gameId === gameId);

    stats.sort((a, b) => {
      switch (type) {
        case 'hours':
          return parseFloat(b.totalHours) - parseFloat(a.totalHours);
        case 'score':
          return b.totalScore - a.totalScore;
        case 'wins':
          return b.totalWins - a.totalWins;
        default:
          return 0;
      }
    });

    return stats.slice(0, limit).map((stat, index) => ({
      ...stat,
      user: this.users.get(stat.userId)!,
      rank: index + 1,
    })).filter(s => s.user);
  }

  async updateLeaderboards(gameId: string): Promise<void> {
    // Implementation for memory storage
  }

  async connectGameLibrary(sync: InsertGameLibrarySync): Promise<GameLibrarySync> {
    const newSync: GameLibrarySync = {
      id: this.gameLibrarySyncIdCounter++,
      ...sync,
      accountName: sync.accountName || null,
      isConnected: true,
      lastSync: null,
      syncEnabled: sync.syncEnabled !== false,
      accessToken: sync.accessToken || null,
      refreshToken: sync.refreshToken || null,
      tokenExpiry: sync.tokenExpiry || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.gameLibrarySyncs.set(newSync.id, newSync);
    return newSync;
  }

  async disconnectGameLibrary(syncId: number, userId: string): Promise<void> {
    const sync = this.gameLibrarySyncs.get(syncId);
    if (!sync) throw new Error('Library sync not found');
    if (sync.userId !== userId) throw new Error('Permission denied');

    sync.isConnected = false;
    sync.updatedAt = new Date();
  }

  async getUserLibrarySyncs(userId: string): Promise<GameLibrarySync[]> {
    return Array.from(this.gameLibrarySyncs.values())
      .filter(sync => sync.userId === userId && sync.isConnected)
      .sort((a, b) => a.platform.localeCompare(b.platform));
  }

  async syncGameLibrary(syncId: number): Promise<UserGame[]> {
    const sync = this.gameLibrarySyncs.get(syncId);
    if (!sync) throw new Error('Library sync not found');

    const syncedGames: UserGame[] = [];
    sync.lastSync = new Date();
    sync.updatedAt = new Date();

    return syncedGames;
  }

  // Enhanced notification operations
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const newNotification: Notification = {
      id: this.notificationIdCounter++,
      ...notification,
      category: notification.category || 'general',
      priority: notification.priority || 'normal',
      isRead: false,
      isArchived: false,
      readAt: null,
      createdAt: new Date(),
    };
    this.notifications.set(newNotification.id, newNotification);

    // Send push notification if user has subscriptions and settings allow it
    const settings = await this.getUserNotificationSettings(notification.userId);
    const typeSettings = settings.find(s => s.type === notification.type);
    
    if (!typeSettings || typeSettings.push) {
      await this.sendPushNotification(notification.userId, {
        title: newNotification.title,
        body: newNotification.message,
        data: {
          notificationId: newNotification.id,
          type: newNotification.type,
          actionUrl: newNotification.actionUrl,
        },
      });
    }

    return newNotification;
  }

  async getUserNotifications(userId: string, filters?: {
    category?: string;
    isRead?: boolean;
    isArchived?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<Notification[]> {
    let notifications = Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId);

    // Apply filters
    if (filters) {
      if (filters.category) {
        notifications = notifications.filter(n => n.category === filters.category);
      }
      if (filters.isRead !== undefined) {
        notifications = notifications.filter(n => n.isRead === filters.isRead);
      }
      if (filters.isArchived !== undefined) {
        notifications = notifications.filter(n => n.isArchived === filters.isArchived);
      }
    }

    // Filter out expired notifications
    const now = new Date();
    notifications = notifications.filter(n => !n.expiresAt || n.expiresAt > now);

    // Sort by creation date (newest first)
    notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Apply pagination
    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;
    return notifications.slice(offset, offset + limit);
  }

  async markNotificationAsRead(id: number, userId: string): Promise<void> {
    const notification = this.notifications.get(id);
    if (notification && notification.userId === userId && !notification.isRead) {
      notification.isRead = true;
      notification.readAt = new Date();
    }
  }

  async markAllNotificationsAsRead(userId: string, category?: string): Promise<void> {
    Array.from(this.notifications.values())
      .filter(notification => 
        notification.userId === userId && 
        !notification.isRead &&
        (!category || notification.category === category)
      )
      .forEach(notification => {
        notification.isRead = true;
        notification.readAt = new Date();
      });
  }

  async archiveNotification(id: number, userId: string): Promise<void> {
    const notification = this.notifications.get(id);
    if (notification && notification.userId === userId) {
      notification.isArchived = true;
    }
  }

  async deleteNotification(id: number, userId: string): Promise<void> {
    const notification = this.notifications.get(id);
    if (notification && notification.userId === userId) {
      this.notifications.delete(id);
    }
  }

  async getUnreadNotificationCount(userId: string, category?: string): Promise<number> {
    return Array.from(this.notifications.values())
      .filter(notification => 
        notification.userId === userId && 
        !notification.isRead && 
        !notification.isArchived &&
        (!category || notification.category === category) &&
        (!notification.expiresAt || notification.expiresAt > new Date())
      ).length;
  }

  // Notification settings
  async getUserNotificationSettings(userId: string): Promise<NotificationSettings[]> {
    let settings = this.notificationSettings.get(userId);
    
    if (!settings) {
      // Create default settings for all notification types
      const defaultTypes = [
        'follow', 'like', 'comment', 'friend_request', 'tournament', 
        'clan', 'achievement', 'message', 'system'
      ];
      
      settings = defaultTypes.map(type => ({
        id: Object.keys(this.notificationSettings).length + 1,
        userId,
        type,
        email: true,
        push: true,
        inApp: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      
      this.notificationSettings.set(userId, settings);
    }
    
    return settings;
  }

  async updateNotificationSetting(userId: string, type: string, updates: {
    email?: boolean;
    push?: boolean;
    inApp?: boolean;
  }): Promise<NotificationSettings> {
    const settings = await this.getUserNotificationSettings(userId);
    let setting = settings.find(s => s.type === type);
    
    if (!setting) {
      // Create new setting
      setting = {
        id: Object.keys(this.notificationSettings).length + 1,
        userId,
        type,
        email: updates.email ?? true,
        push: updates.push ?? true,
        inApp: updates.inApp ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      settings.push(setting);
    } else {
      // Update existing setting
      Object.assign(setting, updates, { updatedAt: new Date() });
    }
    
    this.notificationSettings.set(userId, settings);
    return setting;
  }

  // Push notifications
  async createPushSubscription(subscription: InsertPushSubscription): Promise<PushSubscription> {
    // Check if subscription already exists
    const existing = Array.from(this.pushSubscriptions.values())
      .find(s => s.userId === subscription.userId && s.endpoint === subscription.endpoint);
    
    if (existing) {
      existing.isActive = true;
      existing.lastUsed = new Date();
      return existing;
    }

    const newSubscription: PushSubscription = {
      id: this.pushSubscriptionIdCounter++,
      ...subscription,
      isActive: true,
      createdAt: new Date(),
      lastUsed: new Date(),
    };
    this.pushSubscriptions.set(newSubscription.id, newSubscription);
    return newSubscription;
  }

  async deletePushSubscription(userId: string, endpoint: string): Promise<void> {
    const subscription = Array.from(this.pushSubscriptions.values())
      .find(s => s.userId === userId && s.endpoint === endpoint);
    
    if (subscription) {
      this.pushSubscriptions.delete(subscription.id);
    }
  }

  async getUserPushSubscriptions(userId: string): Promise<PushSubscription[]> {
    return Array.from(this.pushSubscriptions.values())
      .filter(subscription => subscription.userId === userId && subscription.isActive);
  }

  async sendPushNotification(userId: string, notification: {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    data?: any;
  }): Promise<void> {
    // In a real implementation, this would use web-push library
    const subscriptions = await this.getUserPushSubscriptions(userId);
    
    if (subscriptions.length > 0) {
      console.log(`[PUSH] Sending notification to ${subscriptions.length} subscription(s) for user ${userId}:`, {
        title: notification.title,
        body: notification.body,
        data: notification.data,
      });
      
      // Update last used timestamp for subscriptions
      subscriptions.forEach(sub => {
        sub.lastUsed = new Date();
      });
    }
  }

  // Live streaming operations
  async createStream(stream: InsertStream): Promise<Stream> {
    const newStream: Stream = {
      id: this.streamIdCounter++,
      ...stream,
      streamKey: `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'offline',
      viewerCount: 0,
      maxViewers: 0,
      totalViews: 0,
      peakViewers: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.streams.set(newStream.id, newStream);
    return newStream;
  }

  async getStreams(filters?: {
    status?: string;
    category?: string;
    limit?: number;
    offset?: number;
  }): Promise<Stream[]> {
    let streams = Array.from(this.streams.values());

    if (filters) {
      if (filters.status) {
        streams = streams.filter(stream => stream.status === filters.status);
      }
      if (filters.category) {
        streams = streams.filter(stream => stream.category === filters.category);
      }
    }

    streams.sort((a, b) => {
      if (a.status === 'live' && b.status !== 'live') return -1;
      if (b.status === 'live' && a.status !== 'live') return 1;
      return b.viewerCount - a.viewerCount;
    });

    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;
    return streams.slice(offset, offset + limit);
  }

  async getStreamById(id: number): Promise<Stream | undefined> {
    return this.streams.get(id);
  }

  async updateStream(id: number, updates: Partial<Stream>): Promise<Stream> {
    const stream = this.streams.get(id);
    if (!stream) throw new Error('Stream not found');

    const updatedStream = { ...stream, ...updates, updatedAt: new Date() };
    this.streams.set(id, updatedStream);
    return updatedStream;
  }

  async deleteStream(id: number, userId: string): Promise<void> {
    const stream = this.streams.get(id);
    if (!stream) throw new Error('Stream not found');
    if (stream.streamerId !== userId) throw new Error('Permission denied');

    this.streams.delete(id);
  }

  // Stream follows
  async followStream(followerId: string, streamerId: string): Promise<StreamFollow> {
    // Check if already following
    const existing = Array.from(this.streamFollows.values())
      .find(follow => follow.followerId === followerId && follow.streamerId === streamerId);
    
    if (existing) {
      throw new Error('Already following this streamer');
    }

    const follow: StreamFollow = {
      id: this.streamFollowIdCounter++,
      followerId,
      streamerId,
      notifyOnLive: true,
      createdAt: new Date(),
    };
    this.streamFollows.set(follow.id, follow);
    return follow;
  }

  async unfollowStream(followerId: string, streamerId: string): Promise<void> {
    const follow = Array.from(this.streamFollows.values())
      .find(f => f.followerId === followerId && f.streamerId === streamerId);
    
    if (follow) {
      this.streamFollows.delete(follow.id);
    }
  }

  async getStreamFollowers(streamerId: string): Promise<StreamFollow[]> {
    return Array.from(this.streamFollows.values())
      .filter(follow => follow.streamerId === streamerId);
  }

  async getUserStreamFollows(userId: string): Promise<StreamFollow[]> {
    return Array.from(this.streamFollows.values())
      .filter(follow => follow.followerId === userId);
  }

  // Stream chat
  async sendStreamMessage(message: InsertStreamChat): Promise<StreamChat> {
    const newMessage: StreamChat = {
      id: this.streamChatIdCounter++,
      ...message,
      isDeleted: false,
      isModerated: false,
      moderatedBy: null,
      moderatedAt: null,
      createdAt: new Date(),
    };
    this.streamChats.set(newMessage.id, newMessage);
    return newMessage;
  }

  async getStreamMessages(streamId: number, limit = 100): Promise<(StreamChat & { user: User })[]> {
    const messages = Array.from(this.streamChats.values())
      .filter(message => message.streamId === streamId && !message.isDeleted)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .slice(-limit);

    return messages.map(message => ({
      ...message,
      user: this.users.get(message.userId)!,
    })).filter(m => m.user);
  }

  async deleteStreamMessage(messageId: number, userId: string): Promise<void> {
    const message = this.streamChats.get(messageId);
    if (!message) throw new Error('Message not found');
    if (message.userId !== userId) throw new Error('Permission denied');

    message.isDeleted = true;
  }

  // Content operations
  async createContent(content: InsertContentPiece): Promise<ContentPiece> {
    const newContent: ContentPiece = {
      id: this.contentPieceIdCounter++,
      ...content,
      status: content.status || 'published',
      visibility: content.visibility || 'public',
      isFeatured: false,
      viewCount: 0,
      likeCount: 0,
      downloadCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.contentPieces.set(newContent.id, newContent);
    return newContent;
  }

  async getContent(filters?: {
    type?: string;
    creatorId?: string;
    status?: string;
    visibility?: string;
    limit?: number;
    offset?: number;
  }): Promise<ContentPiece[]> {
    let content = Array.from(this.contentPieces.values());

    if (filters) {
      if (filters.type) {
        content = content.filter(c => c.type === filters.type);
      }
      if (filters.creatorId) {
        content = content.filter(c => c.creatorId === filters.creatorId);
      }
      if (filters.status) {
        content = content.filter(c => c.status === filters.status);
      }
      if (filters.visibility) {
        content = content.filter(c => c.visibility === filters.visibility);
      }
    }

    content.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;
    return content.slice(offset, offset + limit);
  }

  async getContentById(id: number): Promise<ContentPiece | undefined> {
    return this.contentPieces.get(id);
  }

  async updateContent(id: number, updates: Partial<ContentPiece>, userId: string): Promise<ContentPiece> {
    const content = this.contentPieces.get(id);
    if (!content) throw new Error('Content not found');
    if (content.creatorId !== userId) throw new Error('Permission denied');

    const updatedContent = { ...content, ...updates, updatedAt: new Date() };
    this.contentPieces.set(id, updatedContent);
    return updatedContent;
  }

  async deleteContent(id: number, userId: string): Promise<void> {
    const content = this.contentPieces.get(id);
    if (!content) throw new Error('Content not found');
    if (content.creatorId !== userId) throw new Error('Permission denied');

    this.contentPieces.delete(id);
  }

  // Content interactions
  async likeContent(contentId: number, userId: string): Promise<void> {
    const content = this.contentPieces.get(contentId);
    if (!content) throw new Error('Content not found');

    // Simple like tracking - in real implementation would use separate table
    content.likeCount += 1;
  }

  async unlikeContent(contentId: number, userId: string): Promise<void> {
    const content = this.contentPieces.get(contentId);
    if (!content) throw new Error('Content not found');

    content.likeCount = Math.max(0, content.likeCount - 1);
  }

  async recordContentView(contentId: number, userId?: string, watchTime?: number): Promise<void> {
    const content = this.contentPieces.get(contentId);
    if (!content) throw new Error('Content not found');

    content.viewCount += 1;
  }
}