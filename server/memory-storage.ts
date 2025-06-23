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
  private tournaments = new Map<number, Tournament>();
  private tournamentParticipants = new Map<number, TournamentParticipant>();
  private tournamentMatches = new Map<number, TournamentMatch>();
  private chatRooms = new Map<number, ChatRoom>();
  private chatMessages = new Map<number, ChatMessage>();
  private chatRoomMemberships = new Map<number, ChatRoomMembership>();
  private notifications = new Map<number, Notification>();
  private follows = new Map<number, Follow>();

  private postIdCounter = 1;
  private commentIdCounter = 1;
  private likeIdCounter = 1;
  private clanIdCounter = 1;
  private membershipIdCounter = 1;
  private tournamentIdCounter = 1;
  private participantIdCounter = 1;
  private matchIdCounter = 1;
  private roomIdCounter = 1;
  private messageIdCounter = 1;
  private notificationIdCounter = 1;
  private followIdCounter = 1;
  private chatRoomMembershipIdCounter = 1;

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
}