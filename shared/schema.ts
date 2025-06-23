import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  coverImageUrl: varchar("cover_image_url"),
  username: varchar("username").unique(),
  bio: text("bio"),
  location: varchar("location"),
  website: varchar("website"),
  favoriteGames: text("favorite_games").array(),
  socialLinks: jsonb("social_links").default('[]'),
  level: integer("level").default(1),
  xp: integer("xp").default(0),
  role: varchar("role").default("user"), // user, mod, admin
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Posts table
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  mediaUrls: jsonb("media_urls"), // array of media URLs
  gameTag: varchar("game_tag"), // associated game
  hashtags: jsonb("hashtags"), // array of hashtags
  isModerated: boolean("is_moderated").default(false),
  moderationScore: decimal("moderation_score"),
  likeCount: integer("like_count").default(0),
  commentCount: integer("comment_count").default(0),
  shareCount: integer("share_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Comments table
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => posts.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  likeCount: integer("like_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Likes table (for posts and comments)
export const likes = pgTable("likes", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  targetId: integer("target_id").notNull(), // post or comment ID
  targetType: varchar("target_type").notNull(), // "post" or "comment"
  createdAt: timestamp("created_at").defaultNow(),
});

// Clans table
export const clans = pgTable("clans", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull().unique(),
  description: text("description"),
  imageUrl: varchar("image_url"),
  leaderId: varchar("leader_id").notNull().references(() => users.id),
  memberCount: integer("member_count").default(1),
  xp: integer("xp").default(0),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Clan memberships table
export const clanMemberships = pgTable("clan_memberships", {
  id: serial("id").primaryKey(),
  clanId: integer("clan_id").notNull().references(() => clans.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  role: varchar("role").default("member"), // leader, co-leader, member
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Tournaments table
export const tournaments = pgTable("tournaments", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  game: varchar("game").notNull(),
  format: varchar("format").notNull(), // "solo", "team", "clan"
  type: varchar("type").notNull(), // "single-elimination", "double-elimination", "round-robin", "swiss"
  maxParticipants: integer("max_participants").notNull(),
  currentParticipants: integer("current_participants").default(0),
  teamSize: integer("team_size").default(1), // for team tournaments
  prizePool: decimal("prize_pool"),
  entryFee: decimal("entry_fee").default('0'),
  region: varchar("region"),
  skill_level: varchar("skill_level"), // "beginner", "intermediate", "advanced", "professional"
  rules: jsonb("rules"),
  requirements: jsonb("requirements"), // level, rank, etc.
  bannerUrl: varchar("banner_url"),
  status: varchar("status").default("registering"), // registering, active, completed, cancelled
  registrationStart: timestamp("registration_start"),
  registrationEnd: timestamp("registration_end"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  actualStartDate: timestamp("actual_start_date"),
  actualEndDate: timestamp("actual_end_date"),
  winnerId: integer("winner_id"),
  runnerUpId: integer("runner_up_id"),
  thirdPlaceId: integer("third_place_id"),
  isPublic: boolean("is_public").default(true),
  isFeatured: boolean("is_featured").default(false),
  totalRounds: integer("total_rounds"),
  currentRound: integer("current_round").default(0),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tournament participants table
export const tournamentParticipants = pgTable("tournament_participants", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id").notNull().references(() => tournaments.id),
  userId: varchar("user_id").references(() => users.id),
  clanId: integer("clan_id").references(() => clans.id),
  status: varchar("status").default("registered"), // registered, eliminated, winner
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Tournament matches table
export const tournamentMatches = pgTable("tournament_matches", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id").notNull().references(() => tournaments.id),
  round: integer("round").notNull(),
  participant1Id: integer("participant1_id").references(() => tournamentParticipants.id),
  participant2Id: integer("participant2_id").references(() => tournamentParticipants.id),
  winnerId: integer("winner_id").references(() => tournamentParticipants.id),
  score: jsonb("score"), // match score data
  status: varchar("status").default("pending"), // pending, in_progress, completed
  scheduledAt: timestamp("scheduled_at"),
  completedAt: timestamp("completed_at"),
});

// Chat rooms table
export const chatRooms = pgTable("chat_rooms", {
  id: serial("id").primaryKey(),
  name: varchar("name"),
  type: varchar("type").notNull(), // "dm", "group", "global"
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Chat room memberships
export const chatRoomMemberships = pgTable("chat_room_memberships", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").notNull().references(() => chatRooms.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  role: varchar("role").default("member"), // admin, member
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Chat messages table
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").notNull().references(() => chatRooms.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  messageType: varchar("message_type").default("text"), // text, image, file
  metadata: jsonb("metadata"), // for typing indicators, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(), // like, comment, tournament, clan, etc.
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  data: jsonb("data"), // additional context data
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Follows table (user following system)
export const follows = pgTable("follows", {
  id: serial("id").primaryKey(),
  followerId: varchar("follower_id").notNull().references(() => users.id),
  followingId: varchar("following_id").notNull().references(() => users.id),
  isAccepted: boolean("is_accepted").default(true), // for private accounts
  createdAt: timestamp("created_at").defaultNow(),
});

// User activity feed
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(), // "post", "like", "comment", "follow", "achievement", "tournament_join", "clan_join"
  action: varchar("action").notNull(), // "created", "liked", "commented", "followed", "unlocked", "joined"
  targetType: varchar("target_type"), // "user", "post", "comment", "tournament", "clan", "achievement"
  targetId: varchar("target_id"), // ID of the target entity
  metadata: jsonb("metadata"), // additional context data
  visibility: varchar("visibility").default("public"), // "public", "followers", "private"
  createdAt: timestamp("created_at").defaultNow(),
});

// User social links and profiles
export const userSocials = pgTable("user_socials", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  platform: varchar("platform").notNull(), // "twitch", "youtube", "twitter", "discord", "steam"
  username: varchar("username").notNull(),
  url: varchar("url"),
  isVerified: boolean("is_verified").default(false),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User badges and achievements
export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  badgeId: varchar("badge_id").notNull(), // system-defined badge identifier
  title: varchar("title").notNull(),
  description: text("description"),
  iconUrl: varchar("icon_url"),
  color: varchar("color"), // hex color for badge
  rarity: varchar("rarity").default("common"), // "common", "rare", "epic", "legendary"
  category: varchar("category"), // "gaming", "social", "tournament", "clan", "special"
  progress: integer("progress").default(1),
  maxProgress: integer("max_progress").default(1),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
  isVisible: boolean("is_visible").default(true),
});

// Friend requests (separate from follows for explicit friendship)
export const friendRequests = pgTable("friend_requests", {
  id: serial("id").primaryKey(),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  receiverId: varchar("receiver_id").notNull().references(() => users.id),
  status: varchar("status").default("pending"), // "pending", "accepted", "rejected", "cancelled"
  message: text("message"), // optional message with request
  respondedAt: timestamp("responded_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User blocks (for blocking other users)
export const userBlocks = pgTable("user_blocks", {
  id: serial("id").primaryKey(),
  blockerId: varchar("blocker_id").notNull().references(() => users.id),
  blockedId: varchar("blocked_id").notNull().references(() => users.id),
  reason: varchar("reason"), // optional reason for blocking
  createdAt: timestamp("created_at").defaultNow(),
});

// User preferences and privacy settings
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  isProfilePublic: boolean("is_profile_public").default(true),
  allowFollowRequests: boolean("allow_follow_requests").default(true),
  allowFriendRequests: boolean("allow_friend_requests").default(true),
  allowMessages: varchar("allow_messages").default("everyone"), // "everyone", "friends", "none"
  showOnlineStatus: boolean("show_online_status").default(true),
  showGameActivity: boolean("show_game_activity").default(true),
  emailNotifications: boolean("email_notifications").default(true),
  pushNotifications: boolean("push_notifications").default(true),
  language: varchar("language").default("en"),
  timezone: varchar("timezone").default("UTC"),
  theme: varchar("theme").default("dark"), // "light", "dark", "auto"
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User game library
export const userGames = pgTable("user_games", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  gameId: varchar("game_id").notNull(), // system game identifier
  gameName: varchar("game_name").notNull(),
  platform: varchar("platform").notNull(), // "pc", "xbox", "playstation", "nintendo", "mobile"
  hoursPlayed: decimal("hours_played").default('0'),
  lastPlayed: timestamp("last_played"),
  isPlaying: boolean("is_playing").default(false),
  isFavorite: boolean("is_favorite").default(false),
  skillLevel: varchar("skill_level"), // "beginner", "intermediate", "advanced", "expert"
  rank: varchar("rank"), // game-specific rank
  accountId: varchar("account_id"), // external account ID for this game
  isPublic: boolean("is_public").default(true),
  addedAt: timestamp("added_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Game achievements
export const gameAchievements = pgTable("game_achievements", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  gameId: varchar("game_id").notNull(),
  achievementId: varchar("achievement_id").notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  iconUrl: varchar("icon_url"),
  rarity: varchar("rarity").default("common"), // "common", "uncommon", "rare", "epic", "legendary"
  points: integer("points").default(0),
  progress: integer("progress").default(1),
  maxProgress: integer("max_progress").default(1),
  isSecret: boolean("is_secret").default(false),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
});

// Game sessions
export const gameSessions = pgTable("game_sessions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  gameId: varchar("game_id").notNull(),
  gameName: varchar("game_name").notNull(),
  platform: varchar("platform").notNull(),
  sessionStart: timestamp("session_start").notNull(),
  sessionEnd: timestamp("session_end"),
  duration: integer("duration"), // in minutes
  score: integer("score"),
  kills: integer("kills"),
  deaths: integer("deaths"),
  assists: integer("assists"),
  wins: integer("wins").default(0),
  losses: integer("losses").default(0),
  xpGained: integer("xp_gained").default(0),
  notes: text("notes"),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Game statistics
export const gameStatistics = pgTable("game_statistics", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  gameId: varchar("game_id").notNull(),
  gameName: varchar("game_name").notNull(),
  totalHours: decimal("total_hours").default('0'),
  totalSessions: integer("total_sessions").default(0),
  totalKills: integer("total_kills").default(0),
  totalDeaths: integer("total_deaths").default(0),
  totalAssists: integer("total_assists").default(0),
  totalWins: integer("total_wins").default(0),
  totalLosses: integer("total_losses").default(0),
  totalScore: integer("total_score").default(0),
  averageScore: decimal("average_score").default('0'),
  bestScore: integer("best_score").default(0),
  killDeathRatio: decimal("kill_death_ratio").default('0'),
  winRate: decimal("win_rate").default('0'),
  currentStreak: integer("current_streak").default(0),
  bestStreak: integer("best_streak").default(0),
  lastPlayed: timestamp("last_played"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Game leaderboards
export const gameLeaderboards = pgTable("game_leaderboards", {
  id: serial("id").primaryKey(),
  gameId: varchar("game_id").notNull(),
  gameName: varchar("game_name").notNull(),
  leaderboardType: varchar("leaderboard_type").notNull(), // "hours", "score", "wins", "kdr", "winrate"
  period: varchar("period").default("all-time"), // "daily", "weekly", "monthly", "all-time"
  region: varchar("region"), // optional region filtering
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Game reviews
export const gameReviews = pgTable("game_reviews", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  gameId: varchar("game_id").notNull(),
  gameName: varchar("game_name").notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  title: varchar("title"),
  content: text("content"),
  hoursPlayed: decimal("hours_played"),
  isRecommended: boolean("is_recommended"),
  isVisible: boolean("is_visible").default(true),
  helpfulVotes: integer("helpful_votes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Game library tracking and sync
export const gameLibrarySync = pgTable("game_library_sync", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  platform: varchar("platform").notNull(), // "steam", "epic", "uplay", "battlenet", "origin"
  accountId: varchar("account_id").notNull(),
  accountName: varchar("account_name"),
  isConnected: boolean("is_connected").default(true),
  lastSync: timestamp("last_sync"),
  syncEnabled: boolean("sync_enabled").default(true),
  accessToken: varchar("access_token"), // encrypted
  refreshToken: varchar("refresh_token"), // encrypted
  tokenExpiry: timestamp("token_expiry"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Define relations
export const usersRelations = relations(users, ({ many, one }) => ({
  posts: many(posts),
  comments: many(comments),
  likes: many(likes),
  clanMemberships: many(clanMemberships),
  tournamentParticipants: many(tournamentParticipants),
  chatRoomMemberships: many(chatRoomMemberships),
  chatMessages: many(chatMessages),
  notifications: many(notifications),
  following: many(follows, { relationName: "follower" }),
  followers: many(follows, { relationName: "following" }),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(users, { fields: [posts.userId], references: [users.id] }),
  comments: many(comments),
  likes: many(likes),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  post: one(posts, { fields: [comments.postId], references: [posts.id] }),
  user: one(users, { fields: [comments.userId], references: [users.id] }),
  likes: many(likes),
}));

export const clansRelations = relations(clans, ({ one, many }) => ({
  leader: one(users, { fields: [clans.leaderId], references: [users.id] }),
  memberships: many(clanMemberships),
  tournamentParticipants: many(tournamentParticipants),
}));

export const clanMembershipsRelations = relations(clanMemberships, ({ one }) => ({
  clan: one(clans, { fields: [clanMemberships.clanId], references: [clans.id] }),
  user: one(users, { fields: [clanMemberships.userId], references: [users.id] }),
}));

export const tournamentsRelations = relations(tournaments, ({ one, many }) => ({
  creator: one(users, { fields: [tournaments.createdBy], references: [users.id] }),
  participants: many(tournamentParticipants),
  matches: many(tournamentMatches),
}));

export const tournamentParticipantsRelations = relations(tournamentParticipants, ({ one, many }) => ({
  tournament: one(tournaments, { fields: [tournamentParticipants.tournamentId], references: [tournaments.id] }),
  user: one(users, { fields: [tournamentParticipants.userId], references: [users.id] }),
  clan: one(clans, { fields: [tournamentParticipants.clanId], references: [clans.id] }),
  matches1: many(tournamentMatches, { relationName: "participant1" }),
  matches2: many(tournamentMatches, { relationName: "participant2" }),
  wins: many(tournamentMatches, { relationName: "winner" }),
}));

export const tournamentMatchesRelations = relations(tournamentMatches, ({ one }) => ({
  tournament: one(tournaments, { fields: [tournamentMatches.tournamentId], references: [tournaments.id] }),
  participant1: one(tournamentParticipants, { fields: [tournamentMatches.participant1Id], references: [tournamentParticipants.id], relationName: "participant1" }),
  participant2: one(tournamentParticipants, { fields: [tournamentMatches.participant2Id], references: [tournamentParticipants.id], relationName: "participant2" }),
  winner: one(tournamentParticipants, { fields: [tournamentMatches.winnerId], references: [tournamentParticipants.id], relationName: "winner" }),
}));

export const chatRoomsRelations = relations(chatRooms, ({ one, many }) => ({
  creator: one(users, { fields: [chatRooms.createdBy], references: [users.id] }),
  memberships: many(chatRoomMemberships),
  messages: many(chatMessages),
}));

export const chatRoomMembershipsRelations = relations(chatRoomMemberships, ({ one }) => ({
  room: one(chatRooms, { fields: [chatRoomMemberships.roomId], references: [chatRooms.id] }),
  user: one(users, { fields: [chatRoomMemberships.userId], references: [users.id] }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  room: one(chatRooms, { fields: [chatMessages.roomId], references: [chatRooms.id] }),
  user: one(users, { fields: [chatMessages.userId], references: [users.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, { fields: [follows.followerId], references: [users.id], relationName: "follower" }),
  following: one(users, { fields: [follows.followingId], references: [users.id], relationName: "following" }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  likeCount: true,
  commentCount: true,
  shareCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  likeCount: true,
  createdAt: true,
});

export const insertClanSchema = createInsertSchema(clans).omit({
  id: true,
  memberCount: true,
  xp: true,
  createdAt: true,
});

export const insertTournamentSchema = createInsertSchema(tournaments).omit({
  id: true,
  currentParticipants: true,
  createdAt: true,
}).extend({
  startDate: z.string().datetime().or(z.date()),
  endDate: z.string().datetime().or(z.date()).optional(),
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatRoomSchema = createInsertSchema(chatRooms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatRoomMembershipSchema = createInsertSchema(chatRoomMemberships).omit({
  id: true,
  joinedAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertClan = z.infer<typeof insertClanSchema>;
export type Clan = typeof clans.$inferSelect;
export type InsertClanMembership = z.infer<typeof insertClanMembershipSchema>;
export type ClanMembership = typeof clanMemberships.$inferSelect;
export type InsertClanApplication = z.infer<typeof insertClanApplicationSchema>;
export type ClanApplication = typeof clanApplications.$inferSelect;
export type InsertClanEvent = z.infer<typeof insertClanEventSchema>;
export type ClanEvent = typeof clanEvents.$inferSelect;
export type ClanEventParticipant = typeof clanEventParticipants.$inferSelect;
export type ClanAchievement = typeof clanAchievements.$inferSelect;
export type InsertTournament = z.infer<typeof insertTournamentSchema>;
export type Tournament = typeof tournaments.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatRoom = z.infer<typeof insertChatRoomSchema>;
export type ChatRoom = typeof chatRooms.$inferSelect;
export type InsertChatRoomMembership = z.infer<typeof insertChatRoomMembershipSchema>;
export type ChatRoomMembership = typeof chatRoomMemberships.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
export type ClanMembership = typeof clanMemberships.$inferSelect;
export type TournamentParticipant = typeof tournamentParticipants.$inferSelect;
export type TournamentMatch = typeof tournamentMatches.$inferSelect;
export type Like = typeof likes.$inferSelect;
export type Follow = typeof follows.$inferSelect;
