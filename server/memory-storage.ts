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

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existing = this.users.get(userData.id!);
    const user: User = {
      ...existing,
      ...userData,
      id: userData.id!,
      createdAt: existing?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUserLevel(userId: string, xp: number): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.xp = (user.xp || 0) + xp;
      user.level = Math.floor((user.xp || 0) / 100) + 1;
      user.updatedAt = new Date();
    }
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

  async createChatRoom(room: Omit<ChatRoom, 'id' | 'createdAt'>): Promise<ChatRoom> {
    const newRoom: ChatRoom = {
      id: this.roomIdCounter++,
      ...room,
      createdAt: new Date(),
    };
    this.chatRooms.set(newRoom.id, newRoom);
    return newRoom;
  }

  async getChatRooms(userId: string): Promise<ChatRoom[]> {
    return Array.from(this.chatRooms.values());
  }

  async joinChatRoom(roomId: number, userId: string): Promise<void> {
    // In memory implementation
  }

  async sendMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const newMessage: ChatMessage = {
      id: this.messageIdCounter++,
      ...message,
      createdAt: new Date(),
    };
    this.chatMessages.set(newMessage.id, newMessage);
    return newMessage;
  }

  async getMessages(roomId: number, limit = 50): Promise<(ChatMessage & { user: User })[]> {
    return Array.from(this.chatMessages.values())
      .filter(message => message.roomId === roomId)
      .sort((a, b) => a.createdAt!.getTime() - b.createdAt!.getTime())
      .slice(-limit)
      .map(message => ({
        ...message,
        user: this.users.get(message.userId)!
      }))
      .filter(item => item.user);
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