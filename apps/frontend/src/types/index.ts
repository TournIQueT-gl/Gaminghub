export interface User {
  id: string
  email: string | null
  firstName: string | null
  lastName: string | null
  profileImageUrl: string | null
  username: string | null
  bio: string | null
  level: number | null
  xp: number | null
  totalPosts: number | null
  totalWins: number | null
  createdAt: Date | null
  updatedAt: Date | null
}

export interface Post {
  id: number
  userId: string
  content: string
  imageUrl: string | null
  hashtags: string[] | null
  likeCount: number | null
  commentCount: number | null
  shareCount: number | null
  isModerated: boolean | null
  createdAt: Date | null
  user?: User
  isLiked?: boolean
}

export interface Comment {
  id: number
  postId: number
  userId: string
  content: string
  likeCount: number | null
  createdAt: Date | null
  user?: User
}

export interface Clan {
  id: number
  name: string
  description: string | null
  imageUrl: string | null
  leaderId: string
  memberCount: number | null
  xp: number | null
  isPublic: boolean | null
  createdAt: Date | null
}

export interface ClanMembership {
  id: number
  clanId: number
  userId: string
  role: string | null
  joinedAt: Date | null
  clan?: Clan
  user?: User
}

export interface Tournament {
  id: number
  name: string
  description: string | null
  game: string
  maxParticipants: number
  entryFee: number | null
  prizePool: number | null
  status: string
  startDate: Date
  endDate: Date | null
  createdBy: string
  createdAt: Date | null
}

export interface TournamentParticipant {
  id: number
  tournamentId: number
  userId: string
  clanId: number | null
  status: string
  joinedAt: Date | null
  user?: User
  clan?: Clan
}

export interface ChatRoom {
  id: number
  name: string | null
  type: string
  isActive: boolean | null
  createdBy: string | null
  createdAt: Date | null
}

export interface ChatMessage {
  id: number
  roomId: number
  userId: string
  content: string
  messageType: string | null
  metadata: unknown
  createdAt: Date | null
  user?: User
}

export interface Notification {
  id: number
  userId: string
  type: string
  title: string
  message: string
  isRead: boolean | null
  metadata: unknown
  createdAt: Date | null
}