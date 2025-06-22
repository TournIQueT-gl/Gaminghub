import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { aiService } from "./services/ai";
import { tournamentService } from "./services/tournaments";
import { clanService } from "./services/clans";
import { notificationService } from "./services/notifications";
import { createWebSocketService } from "./services/websocket";
import { insertPostSchema, insertCommentSchema, insertClanSchema, insertTournamentSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User routes
  app.get('/api/users/:id', async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get('/api/users/:id/posts', async (req, res) => {
    try {
      const userId = req.params.id;
      const posts = await storage.getPostsByUserId(userId);
      
      // Get user info
      const user = await storage.getUser(userId);
      const postsWithUser = posts.map(post => ({ ...post, user }));
      
      res.json(postsWithUser);
    } catch (error) {
      console.error("Error fetching user posts:", error);
      res.status(500).json({ message: "Failed to fetch user posts" });
    }
  });

  app.get('/api/users/:id/stats', async (req, res) => {
    try {
      const userId = req.params.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const posts = await storage.getPostsByUserId(userId);
      const followers = await storage.getUserFollowers(userId);
      const following = await storage.getUserFollowing(userId);
      const clanMembership = await storage.getUserClanMembership(userId);
      
      res.json({
        level: user.level || 1,
        xp: user.xp || 0,
        postsCount: posts.length,
        followersCount: followers.length,
        followingCount: following.length,
        clanMembership: clanMembership ? {
          id: clanMembership.clan.id,
          name: clanMembership.clan.name,
          role: clanMembership.role
        } : null
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  app.get('/api/users/clan-membership', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const membership = await storage.getUserClanMembership(userId);
      
      if (!membership) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(membership);
    } catch (error) {
      console.error("Error fetching clan membership:", error);
      res.status(500).json({ message: "Failed to fetch clan membership" });
    }
  });

  app.put('/api/users/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updateData = req.body;
      
      const user = await storage.upsertUser({
        id: userId,
        ...updateData,
      });
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Post routes
  app.get('/api/posts', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const posts = await storage.getPosts(limit, offset);
      
      // Get post authors
      const userIds = [...new Set(posts.map(p => p.userId))];
      const users = await storage.getUsersByIds(userIds);
      const userMap = new Map(users.map(u => [u.id, u]));
      
      const postsWithUsers = posts.map(post => ({
        ...post,
        user: userMap.get(post.userId),
      }));
      
      res.json(postsWithUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.post('/api/posts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postData = insertPostSchema.parse({ ...req.body, userId });
      
      // Generate hashtags if content is provided
      let hashtags = postData.hashtags || [];
      if (postData.content && Array.isArray(hashtags) && hashtags.length === 0) {
        const aiHashtags = await aiService.generateHashtags(postData.content);
        hashtags = aiHashtags.hashtags;
      }
      
      // Moderate content
      const moderation = await aiService.moderateContent(postData.content);
      
      const post = await storage.createPost({
        ...postData,
        hashtags,
        isModerated: moderation.isToxic,
        moderationScore: moderation.score.toString(),
      });
      
      // Award user XP for posting
      const user = await storage.getUser(userId);
      if (user) {
        await storage.updateUserLevel(userId, (user.xp || 0) + 10);
        
        // Award clan XP if user is in a clan
        const clanMembership = await storage.getUserClanMembership(userId);
        if (clanMembership) {
          await clanService.awardClanXP(clanMembership.clanId, 5, "member post");
        }
      }
      
      res.json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid post data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  app.get('/api/posts/:id', async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const post = await storage.getPostById(postId);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      const user = await storage.getUser(post.userId);
      res.json({ ...post, user });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch post" });
    }
  });

  app.post('/api/posts/:id/like', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postId = parseInt(req.params.id);
      
      const liked = await storage.toggleLike(userId, postId, 'post');
      
      // Create notification if liked
      if (liked) {
        const post = await storage.getPostById(postId);
        const user = await storage.getUser(userId);
        if (post && user && post.userId !== userId) {
          await notificationService.notifyPostLike(
            post.userId,
            user.username || 'Someone',
            postId
          );
        }
      }
      
      res.json({ liked });
    } catch (error) {
      res.status(500).json({ message: "Failed to toggle like" });
    }
  });

  // Comment routes
  app.get('/api/posts/:id/comments', async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const comments = await storage.getCommentsByPostId(postId);
      
      // Get comment authors
      const userIds = [...new Set(comments.map(c => c.userId))];
      const users = await storage.getUsersByIds(userIds);
      const userMap = new Map(users.map(u => [u.id, u]));
      
      const commentsWithUsers = comments.map(comment => ({
        ...comment,
        user: userMap.get(comment.userId),
      }));
      
      res.json(commentsWithUsers);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post('/api/posts/:id/comments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postId = parseInt(req.params.id);
      const commentData = insertCommentSchema.parse({
        ...req.body,
        postId,
        userId,
      });
      
      const comment = await storage.createComment(commentData);
      
      // Create notification for post owner
      const post = await storage.getPostById(postId);
      const user = await storage.getUser(userId);
      if (post && user && post.userId !== userId) {
        await notificationService.notifyPostComment(
          post.userId,
          user.username || 'Someone',
          postId
        );
      }
      
      res.json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid comment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // Clan routes
  app.get('/api/clans', async (req, res) => {
    try {
      const clans = await storage.getClans();
      res.json(clans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch clans" });
    }
  });

  app.post('/api/clans', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const clanData = insertClanSchema.parse({ ...req.body, leaderId: userId });
      
      const clan = await clanService.createClan(clanData, userId);
      res.json(clan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid clan data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create clan" });
    }
  });

  app.post('/api/clans/:id/join', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const clanId = parseInt(req.params.id);
      
      const membership = await clanService.joinClan(clanId, userId);
      res.json(membership);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get('/api/clans/:id', async (req, res) => {
    try {
      const clanId = parseInt(req.params.id);
      
      if (isNaN(clanId)) {
        return res.status(400).json({ message: "Invalid clan ID" });
      }
      
      const clan = await storage.getClanById(clanId);
      
      if (!clan) {
        return res.status(404).json({ message: "Clan not found" });
      }
      
      res.json(clan);
    } catch (error) {
      console.error("Error fetching clan:", error);
      res.status(500).json({ message: "Failed to fetch clan" });
    }
  });

  app.get('/api/clans/:id/members', async (req, res) => {
    try {
      const clanId = parseInt(req.params.id);
      
      if (isNaN(clanId)) {
        return res.status(400).json({ message: "Invalid clan ID" });
      }
      
      const members = await storage.getClanMembers(clanId);
      res.json(members);
    } catch (error) {
      console.error("Error fetching clan members:", error);
      res.status(500).json({ message: "Failed to fetch clan members" });
    }
  });

  // Tournament routes
  app.get('/api/tournaments', async (req, res) => {
    try {
      const tournaments = await storage.getTournaments();
      res.json(tournaments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tournaments" });
    }
  });

  app.post('/api/tournaments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tournamentData = insertTournamentSchema.parse(req.body);
      
      const tournament = await tournamentService.createTournament(tournamentData, userId);
      res.json(tournament);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid tournament data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create tournament" });
    }
  });

  app.post('/api/tournaments/:id/join', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tournamentId = parseInt(req.params.id);
      const { clanId } = req.body;
      
      const participant = await tournamentService.joinTournament(tournamentId, userId, clanId);
      res.json(participant);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Chat routes
  app.get('/api/chat/rooms', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const rooms = await storage.getChatRooms(userId);
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chat rooms" });
    }
  });

  app.get('/api/chat/rooms/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const roomId = parseInt(req.params.id);
      const limit = parseInt(req.query.limit as string) || 50;
      
      const messages = await storage.getMessages(roomId, limit);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Notification routes
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notifications = await storage.getUserNotifications(userId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.put('/api/notifications/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notificationId = parseInt(req.params.id);
      
      await storage.markNotificationAsRead(notificationId, userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.put('/api/notifications/read-all', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.markAllNotificationsAsRead(userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  // AI routes
  app.post('/api/ai/hashtags', isAuthenticated, async (req, res) => {
    try {
      const { content } = req.body;
      if (!content) {
        return res.status(400).json({ message: "Content is required" });
      }
      
      const hashtags = await aiService.generateHashtags(content);
      res.json(hashtags);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate hashtags" });
    }
  });

  app.post('/api/ai/bio', isAuthenticated, async (req, res) => {
    try {
      const { gamePreferences } = req.body;
      if (!gamePreferences || !Array.isArray(gamePreferences)) {
        return res.status(400).json({ message: "Game preferences array is required" });
      }
      
      const bio = await aiService.generateGamerBio(gamePreferences);
      res.json(bio);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate bio" });
    }
  });

  // Follow routes
  app.post('/api/users/:id/follow', isAuthenticated, async (req: any, res) => {
    try {
      const followerId = req.user.claims.sub;
      const followingId = req.params.id;
      
      if (followerId === followingId) {
        return res.status(400).json({ message: "Cannot follow yourself" });
      }
      
      const follow = await storage.followUser(followerId, followingId);
      
      // Create notification
      const follower = await storage.getUser(followerId);
      if (follower) {
        await notificationService.notifyFollowUser(
          followingId,
          follower.username || 'Someone'
        );
      }
      
      res.json(follow);
    } catch (error) {
      res.status(500).json({ message: "Failed to follow user" });
    }
  });

  app.delete('/api/users/:id/follow', isAuthenticated, async (req: any, res) => {
    try {
      const followerId = req.user.claims.sub;
      const followingId = req.params.id;
      
      await storage.unfollowUser(followerId, followingId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to unfollow user" });
    }
  });

  // Admin routes
  app.get('/api/admin/stats', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      // Get actual platform stats
      const posts = await storage.getPosts(1000, 0); // Get more posts for count
      const clans = await storage.getClans();
      const tournaments = await storage.getTournaments();
      
      // Count users by getting all user IDs from posts
      const userIds = new Set();
      posts.forEach(post => userIds.add(post.userId));
      
      res.json({
        users: userIds.size,
        posts: posts.length,
        tournaments: tournaments.length,
        clans: clans.length,
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  const httpServer = createServer(app);
  
  // Initialize WebSocket service
  createWebSocketService(httpServer);

  return httpServer;
}
