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
  format: varchar("format").notNull(), // "solo" or "team"
  maxParticipants: integer("max_participants").notNull(),
  currentParticipants: integer("current_participants").default(0),
  prizePool: decimal("prize_pool"),
  status: varchar("status").default("registering"), // registering, active, completed
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
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
  createdAt: timestamp("created_at").defaultNow(),
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
