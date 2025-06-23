import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { aiService } from "./services/ai";
import { tournamentService } from "./services/tournaments";
import { clanService } from "./services/clans";
import { notificationService } from "./services/notifications";
import { createWebSocketService } from "./services/websocket";
import { insertPostSchema, insertCommentSchema, insertClanSchema, insertClanApplicationSchema, insertClanEventSchema, insertTournamentSchema, insertTournamentParticipantSchema, insertTournamentMatchSchema, insertChatRoomSchema, insertChatMessageSchema, insertUserSocialSchema, insertFriendRequestSchema, insertUserPreferencesSchema, insertUserGameSchema, insertGameSessionSchema, insertGameAchievementSchema, insertGameReviewSchema, insertNotificationSchema, insertNotificationSettingsSchema, insertPushSubscriptionSchema, insertStreamSchema, insertStreamFollowSchema, insertStreamChatSchema, insertContentPieceSchema } from "@shared/schema";
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
      let user = await storage.getUser(userId);
      
      if (!user) {
        // Auto-create user if accessing their own stats
        if (req.headers.authorization || req.user?.claims?.sub === userId) {
          user = await storage.upsertUser({
            id: userId,
            email: req.user?.claims?.email || `user${userId}@example.com`,
            firstName: req.user?.claims?.first_name || "User",
            lastName: req.user?.claims?.last_name || "",
            profileImageUrl: req.user?.claims?.profile_image_url || null,
          });
        } else {
          // Auto-create user if they don't exist
          user = await storage.upsertUser({
            id: userId,
            email: `user${userId}@example.com`,
            firstName: "User",
            lastName: "",
            profileImageUrl: null,
          });
        }
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
      
      // User should already exist from isAuthenticated middleware
      
      const membership = await storage.getUserClanMembership(userId);
      
      // Return null for no membership instead of error
      res.json(membership);
    } catch (error) {
      console.error("Error fetching clan membership:", error);
      res.status(500).json({ message: "Failed to fetch clan membership" });
    }
  });

  // Get specific user by ID
  app.get('/api/users/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.params.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Remove sensitive information for non-own profiles
      const requestingUserId = req.user.claims.sub;
      if (userId !== requestingUserId) {
        const { email, ...publicUserData } = user;
        res.json(publicUserData);
      } else {
        res.json(user);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user profile
  app.patch('/api/users/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updateData = req.body;
      
      // Validate required data
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      // Basic validation
      if (updateData.username && (updateData.username.length < 3 || updateData.username.length > 20)) {
        return res.status(400).json({ message: "Username must be between 3 and 20 characters" });
      }

      if (updateData.bio && updateData.bio.length > 500) {
        return res.status(400).json({ message: "Bio must be less than 500 characters" });
      }

      if (updateData.website && updateData.website.length > 0) {
        try {
          new URL(updateData.website);
        } catch {
          return res.status(400).json({ message: "Please enter a valid website URL" });
        }
      }

      if (updateData.favoriteGames && updateData.favoriteGames.length > 10) {
        return res.status(400).json({ message: "You can only have up to 10 favorite games" });
      }
      
      // Get current user
      let currentUser = await storage.getUser(userId);
      if (!currentUser) {
        // Auto-create user if they don't exist
        currentUser = await storage.upsertUser({
          id: userId,
          email: req.user.claims.email,
          firstName: req.user.claims.first_name,
          lastName: req.user.claims.last_name,
          profileImageUrl: req.user.claims.profile_image_url,
        });
      }
      
      // Update user with new data
      const updatedUser = await storage.upsertUser({
        id: userId,
        ...updateData,
        updatedAt: new Date(),
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Get user achievements
  app.get('/api/users/:id/achievements', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.params.id;
      
      // Get current user for dynamic achievements
      const currentUser = await storage.getUser(userId);
      const userPosts = await storage.getPostsByUserId(userId);
      const followers = await storage.getUserFollowers(userId);
      const following = await storage.getUserFollowing(userId);

      function calculateProfileCompletion(user: any): number {
        if (!user) return 0;
        let completion = 0;
        const checks = [
          { field: 'profileImageUrl', weight: 15 },
          { field: 'bio', weight: 20, condition: (val: string) => val && val.length > 10 },
          { field: 'location', weight: 15 },
          { field: 'website', weight: 15 },
          { field: 'favoriteGames', weight: 20, condition: (val: any[]) => val && val.length >= 3 },
          { field: 'socialLinks', weight: 15, condition: (val: any[]) => val && val.length > 0 },
        ];
        
        checks.forEach(check => {
          const value = user[check.field];
          if (check.condition) {
            if (check.condition(value)) completion += check.weight;
          } else if (value) {
            completion += check.weight;
          }
        });
        
        return completion;
      }

      // Dynamic achievements based on actual user data
      const userAchievements = [
        {
          id: 'first_post',
          title: 'First Steps',
          description: 'Share your first gaming experience',
          rarity: 'common',
          unlockedAt: userPosts.length > 0 ? userPosts[0].createdAt : null,
          progress: userPosts.length > 0 ? 1 : 0,
          maxProgress: 1,
        },
        {
          id: 'prolific_poster',
          title: 'Content Creator',
          description: 'Share 10 gaming posts',
          rarity: 'rare',
          unlockedAt: userPosts.length >= 10 ? userPosts[9]?.createdAt : null,
          progress: userPosts.length,
          maxProgress: 10,
        },
        {
          id: 'level_5',
          title: 'Rising Gamer',
          description: 'Reach level 5',
          rarity: 'common',
          unlockedAt: (currentUser?.level || 1) >= 5 ? new Date() : null,
          progress: currentUser?.level || 1,
          maxProgress: 5,
        },
        {
          id: 'level_10',
          title: 'Veteran Gamer',
          description: 'Reach level 10',
          rarity: 'rare',
          unlockedAt: (currentUser?.level || 1) >= 10 ? new Date() : null,
          progress: currentUser?.level || 1,
          maxProgress: 10,
        },
        {
          id: 'level_25',
          title: 'Elite Player',
          description: 'Reach level 25',
          rarity: 'epic',
          unlockedAt: (currentUser?.level || 1) >= 25 ? new Date() : null,
          progress: currentUser?.level || 1,
          maxProgress: 25,
        },
        {
          id: 'level_50',
          title: 'Gaming Legend',
          description: 'Reach level 50',
          rarity: 'legendary',
          unlockedAt: (currentUser?.level || 1) >= 50 ? new Date() : null,
          progress: currentUser?.level || 1,
          maxProgress: 50,
        },
        {
          id: 'social_starter',
          title: 'Making Friends',
          description: 'Follow 5 users',
          rarity: 'common',
          unlockedAt: following.length >= 5 ? new Date() : null,
          progress: following.length,
          maxProgress: 5,
        },
        {
          id: 'social_butterfly',
          title: 'Social Butterfly',
          description: 'Follow 25 users',
          rarity: 'rare',
          unlockedAt: following.length >= 25 ? new Date() : null,
          progress: following.length,
          maxProgress: 25,
        },
        {
          id: 'popular',
          title: 'Popular Gamer',
          description: 'Gain 10 followers',
          rarity: 'rare',
          unlockedAt: followers.length >= 10 ? new Date() : null,
          progress: followers.length,
          maxProgress: 10,
        },
        {
          id: 'influencer',
          title: 'Gaming Influencer',
          description: 'Gain 50 followers',
          rarity: 'epic',
          unlockedAt: followers.length >= 50 ? new Date() : null,
          progress: followers.length,
          maxProgress: 50,
        },
        {
          id: 'profile_complete',
          title: 'Profile Master',
          description: 'Complete your profile 100%',
          rarity: 'rare',
          unlockedAt: currentUser?.bio && currentUser?.location && currentUser?.website && 
                      currentUser?.favoriteGames?.length >= 3 && currentUser?.socialLinks?.length > 0 ? 
                      new Date() : null,
          progress: calculateProfileCompletion(currentUser),
          maxProgress: 100,
        },
        {
          id: 'xp_collector',
          title: 'XP Collector',
          description: 'Earn 1000 XP',
          rarity: 'rare',
          unlockedAt: (currentUser?.xp || 0) >= 1000 ? new Date() : null,
          progress: currentUser?.xp || 0,
          maxProgress: 1000,
        },
      ];
      
      res.json(userAchievements);
    } catch (error) {
      console.error("Error fetching user achievements:", error);
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });

  // Get user game statistics
  app.get('/api/users/:id/game-stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.params.id;
      
      // Mock game stats - in a real app, this would come from the database or external APIs
      const mockGameStats = [
        {
          game: 'Valorant',
          hoursPlayed: 245,
          rank: 'Diamond',
          level: 85,
          winRate: 67,
          lastPlayed: new Date('2024-01-20'),
        },
        {
          game: 'League of Legends',
          hoursPlayed: 182,
          rank: 'Gold II',
          level: 45,
          winRate: 58,
          lastPlayed: new Date('2024-01-18'),
        },
        {
          game: 'CS2',
          hoursPlayed: 156,
          rank: 'Master Guardian',
          level: 32,
          winRate: 72,
          lastPlayed: new Date('2024-01-15'),
        },
      ];
      
      res.json(mockGameStats);
    } catch (error) {
      console.error("Error fetching user game stats:", error);
      res.status(500).json({ message: "Failed to fetch game stats" });
    }
  });

  // Follow/Unfollow user
  app.post('/api/users/:id/follow', isAuthenticated, async (req: any, res) => {
    try {
      const targetUserId = req.params.id;
      const followerId = req.user.claims.sub;
      
      if (targetUserId === followerId) {
        return res.status(400).json({ message: "You cannot follow yourself" });
      }
      
      const follow = await storage.followUser(followerId, targetUserId);
      res.json({ message: "User followed successfully", follow });
    } catch (error) {
      console.error("Error following user:", error);
      res.status(500).json({ message: "Failed to follow user" });
    }
  });

  app.post('/api/users/:id/unfollow', isAuthenticated, async (req: any, res) => {
    try {
      const targetUserId = req.params.id;
      const followerId = req.user.claims.sub;
      
      await storage.unfollowUser(followerId, targetUserId);
      res.json({ message: "User unfollowed successfully" });
    } catch (error) {
      console.error("Error unfollowing user:", error);
      res.status(500).json({ message: "Failed to unfollow user" });
    }
  });

  // Update user social links
  app.patch('/api/users/social-links', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { socialLinks } = req.body;
      
      // Get current user
      let currentUser = await storage.getUser(userId);
      if (!currentUser) {
        // Auto-create user if they don't exist
        currentUser = await storage.upsertUser({
          id: userId,
          email: req.user.claims.email,
          firstName: req.user.claims.first_name,
          lastName: req.user.claims.last_name,
          profileImageUrl: req.user.claims.profile_image_url,
        });
      }
      
      // Update user with social links
      const updatedUser = await storage.upsertUser({
        id: userId,
        socialLinks: socialLinks,
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating social links:", error);
      res.status(500).json({ message: "Failed to update social links" });
    }
  });

  // Get detailed user statistics
  app.get('/api/users/:id/detailed-stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.params.id;
      
      // Mock detailed stats - in a real app, this would come from analytics database
      const mockDetailedStats = {
        totalViews: 2847,
        totalLikes: 127,
        totalComments: 45,
        winRate: 67,
        hoursPlayed: 245,
        gamesPlayed: 3,
        streakDays: 7,
        rankPosition: 1247,
        monthlyGrowth: 12.5,
        engagementRate: 76,
      };
      
      res.json(mockDetailedStats);
    } catch (error) {
      console.error("Error fetching detailed stats:", error);
      res.status(500).json({ message: "Failed to fetch detailed stats" });
    }
  });

  // Get user followers
  app.get('/api/users/:id/followers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.params.id;
      
      // Mock followers data
      const mockFollowers = [
        {
          id: "user1",
          username: "GamerPro123",
          email: "gamer@example.com",
          profileImageUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face",
          isVerified: true,
          level: 25,
          followersCount: 1540,
          isFollowing: false
        },
        {
          id: "user2", 
          username: "EsportsLegend",
          email: "legend@example.com",
          profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
          isVerified: true,
          level: 42,
          followersCount: 8920,
          isFollowing: true
        }
      ];
      
      res.json(mockFollowers);
    } catch (error) {
      console.error("Error fetching followers:", error);
      res.status(500).json({ message: "Failed to fetch followers" });
    }
  });

  // Get user following
  app.get('/api/users/:id/following', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.params.id;
      
      // Mock following data
      const mockFollowing = [
        {
          id: "user3",
          username: "StreamQueen",
          email: "queen@example.com",
          profileImageUrl: "https://images.unsplash.com/photo-1494790108755-2616b6fa9e16?w=100&h=100&fit=crop&crop=face",
          level: 18,
          followersCount: 3200,
          isFollowing: true
        }
      ];
      
      res.json(mockFollowing);
    } catch (error) {
      console.error("Error fetching following:", error);
      res.status(500).json({ message: "Failed to fetch following" });
    }
  });

  // Get user activity feed
  app.get('/api/users/:id/activity', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.params.id;
      
      // Mock activity data
      const mockActivities = [
        {
          id: '1',
          type: 'achievement',
          title: 'New Achievement Unlocked!',
          description: 'Earned "First Victory" achievement',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          metadata: { achievement: 'First Victory', rarity: 'common' }
        },
        {
          id: '2',
          type: 'level_up',
          title: 'Level Up!',
          description: 'Reached level 15',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
          metadata: { level: 15, xp: 1500 }
        }
      ];
      
      res.json(mockActivities);
    } catch (error) {
      console.error("Error fetching activity:", error);
      res.status(500).json({ message: "Failed to fetch activity" });
    }
  });

  // Get user analytics (profile owner only)
  app.get('/api/users/:id/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.params.id;
      const requesterId = req.user.claims.sub;
      
      // Only allow users to view their own analytics
      if (userId !== requesterId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Mock analytics data - in a real app, this would come from the database
      const mockAnalytics = {
        totalViews: 2847,
        viewsChange: 12.5,
        engagement: 76,
        engagementChange: -2.3,
        followersGained: 45,
        followersChange: 8.1,
        postsThisWeek: 7,
        postsChange: 16.7,
        topPerformingPost: {
          id: 1,
          title: "My epic Valorant clutch!",
          likes: 156,
          views: 892,
        },
        monthlyStats: [
          { month: "January", posts: 23, likes: 456, views: 1234 },
          { month: "December", posts: 18, likes: 389, views: 1089 },
          { month: "November", posts: 25, likes: 512, views: 1456 },
        ]
      };
      
      res.json(mockAnalytics);
    } catch (error) {
      console.error("Error fetching user analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Update user notification settings (placeholder)
  app.patch('/api/users/notifications', isAuthenticated, async (req: any, res) => {
    try {
      // In a real app, you'd store notification preferences
      res.json({ message: "Notification settings updated" });
    } catch (error) {
      console.error("Error updating notification settings:", error);
      res.status(500).json({ message: "Failed to update notification settings" });
    }
  });

  // Post routes - Allow guests with limitations
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
      
      // Check if user is already in a clan
      const existingMembership = await storage.getUserClanMembership(userId);
      if (existingMembership) {
        return res.status(400).json({ message: "You are already a member of a clan. Leave your current clan first." });
      }
      
      const clanData = insertClanSchema.parse({ ...req.body, leaderId: userId });
      const clan = await clanService.createClan(clanData, userId);
      res.json(clan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid clan data", errors: error.errors });
      }
      console.error("Error creating clan:", error);
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
      const members = await storage.getClanMembers(clanId);
      res.json(members);
    } catch (error) {
      console.error("Error fetching clan members:", error);
      res.status(500).json({ message: "Failed to fetch clan members" });
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
      
      // Process the tournament data
      const processedData = {
        ...req.body,
        createdBy: userId,
        startDate: req.body.startDate ? new Date(req.body.startDate) : new Date(),
        endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
      };
      
      const tournamentData = insertTournamentSchema.parse(processedData);
      const tournament = await tournamentService.createTournament(tournamentData, userId);
      res.json(tournament);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Tournament validation errors:", error.errors);
        return res.status(400).json({ message: "Invalid tournament data", errors: error.errors });
      }
      console.error("Error creating tournament:", error);
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

  // Streaming routes
  app.get('/api/streams', async (req, res) => {
    try {
      const streams = await storage.getStreams();
      res.json(streams);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch streams" });
    }
  });

  app.post('/api/streams', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const streamData = { ...req.body, streamerId: userId };
      const stream = await storage.createStream(streamData);
      res.json(stream);
    } catch (error) {
      res.status(500).json({ message: "Failed to create stream" });
    }
  });

  app.post('/api/streams/:id/follow', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const streamerId = req.params.id;
      const follow = await storage.followStream(userId, streamerId);
      res.json(follow);
    } catch (error) {
      res.status(500).json({ message: "Failed to follow stream" });
    }
  });

  // Content routes
  app.get('/api/content', async (req, res) => {
    try {
      const content = await storage.getContent();
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch content" });
    }
  });

  app.post('/api/content', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const contentData = { ...req.body, creatorId: userId };
      const content = await storage.createContent(contentData);
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: "Failed to create content" });
    }
  });

  app.post('/api/content/:id/like', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const contentId = parseInt(req.params.id);
      await storage.likeContent(contentId, userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to like content" });
    }
  });

  // User game routes
  app.get('/api/users/games', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // User should already exist from isAuthenticated middleware
      
      const games = await storage.getUserGameLibrary(userId);
      res.json(games);
    } catch (error) {
      console.error("Error fetching game library:", error);
      res.status(500).json({ message: "Failed to fetch game library" });
    }
  });

  app.post('/api/users/games', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const gameData = { ...req.body, userId };
      const game = await storage.addGameToLibrary(gameData);
      res.json(game);
    } catch (error) {
      res.status(500).json({ message: "Failed to add game to library" });
    }
  });

  app.get('/api/users/game-sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessions = await storage.getUserGameSessions(userId);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch game sessions" });
    }
  });

  app.get('/api/users/game-achievements', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const achievements = await storage.getUserGameAchievements(userId);
      res.json(achievements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });

  // Discover routes
  app.get('/api/discover/users', async (req, res) => {
    try {
      // Mock discovered users for now
      const mockUsers = [
        {
          id: "user1",
          username: "ProGamer123",
          displayName: "Pro Gamer",
          avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face",
          bio: "Competitive gamer and streamer",
          favoriteGames: ["Valorant", "League of Legends"],
          followers: 1250,
          level: 15
        },
        {
          id: "user2", 
          username: "StreamQueen",
          displayName: "Stream Queen",
          avatarUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&h=100&fit=crop&crop=face",
          bio: "Content creator and tournament organizer",
          favoriteGames: ["CS2", "Overwatch 2"],
          followers: 2840,
          level: 22
        }
      ];
      res.json(mockUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch discovered users" });
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

  // Seed route for development
  app.post('/api/seed', async (req, res) => {
    try {
      const { quickSeed } = await import('./quick-seed');
      const success = await quickSeed(storage);
      if (success) {
        res.json({ message: "Database seeded successfully" });
      } else {
        res.status(500).json({ message: "Seeding partially failed" });
      }
    } catch (error) {
      console.error("Seeding error:", error);
      res.status(500).json({ message: "Failed to seed database" });
    }
  });

  const httpServer = createServer(app);
  
  // Initialize WebSocket service
  createWebSocketService(httpServer);

  return httpServer;
}
