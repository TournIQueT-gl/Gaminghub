# GamingX Backend API

A comprehensive NestJS backend for the GamingX gaming social platform featuring authentication, real-time chat, tournaments, clans, and social features.

## Features

### 🔐 Authentication & Authorization
- JWT-based authentication with refresh tokens
- Replit OAuth integration
- Role-based access control
- Session management

### 👥 User Management
- User profiles with XP/leveling system
- Follow/unfollow functionality
- Profile customization
- User statistics and achievements

### 📱 Social Features
- Post creation with hashtags and media
- Like and comment system
- Real-time feed with personalized content
- Social interactions and notifications

### 🏆 Tournament System
- Tournament creation and management
- Bracket generation (single/double elimination)
- Participant registration
- Match result submission
- Automated progression and winner calculation

### ⚔️ Clan System
- Clan creation and management
- Role-based permissions (Leader, Co-Leader, Member)
- Clan XP and leveling
- Member management and invitations

### 💬 Real-time Chat
- WebSocket-powered messaging
- Multiple room types (Public, Private, Clan, Tournament, DM)
- Typing indicators
- Online user tracking
- Message history

### 🔔 Notification System
- Real-time notifications via WebSocket
- Multiple notification types
- Read/unread status
- Bulk operations

## Tech Stack

- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + Passport
- **Real-time**: Socket.IO WebSocket Gateway
- **Validation**: class-validator + class-transformer
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest + Supertest
- **Logging**: Winston

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Environment setup:**
```bash
cp .env.example .env
```

3. **Configure environment variables:**
```env
DATABASE_URL="postgresql://username:password@localhost:5432/gamingx"
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-refresh-secret"
REPL_ID="your-repl-id"
REPLIT_CLIENT_SECRET="your-replit-secret"
FRONTEND_URL="http://localhost:3000"
```

4. **Database setup:**
```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

5. **Start development server:**
```bash
npm run start:dev
```

The API will be available at `http://localhost:5000`  
API Documentation: `http://localhost:5000/api/docs`

## Project Structure

```
src/
├── auth/                 # Authentication module
│   ├── decorators/      # Custom decorators (@GetUser, @Public)
│   ├── guards/          # JWT auth guard
│   ├── strategies/      # Passport strategies
│   └── dto/             # Auth DTOs
├── users/               # User management
├── posts/               # Social posts & comments
├── clans/               # Clan system
├── tournaments/         # Tournament management
├── chat/                # Real-time messaging
│   ├── chat.gateway.ts  # WebSocket gateway
│   └── chat.service.ts  # Chat business logic
├── notifications/       # Notification system
├── prisma/             # Database service
├── health/             # Health check endpoint
└── main.ts             # Application bootstrap
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login with credentials
- `GET /auth/replit` - Replit OAuth login
- `GET /auth/me` - Get current user
- `POST /auth/refresh` - Refresh access token

### Users
- `GET /users/me` - Get current user profile
- `PUT /users/me` - Update profile
- `GET /users/search` - Search users
- `POST /users/:id/follow` - Follow user
- `GET /users/:id/followers` - Get followers

### Posts
- `POST /posts` - Create post
- `GET /posts/feed` - Get personalized feed
- `GET /posts/:id` - Get post details
- `POST /posts/:id/like` - Like/unlike post
- `POST /posts/:id/comments` - Add comment

### Clans
- `POST /clans` - Create clan
- `GET /clans` - List clans
- `POST /clans/:id/join` - Join clan
- `PUT /clans/:id/members/:memberId/role` - Update member role

### Tournaments
- `POST /tournaments` - Create tournament
- `GET /tournaments` - List tournaments
- `POST /tournaments/:id/join` - Join tournament
- `POST /tournaments/:id/start` - Start tournament
- `GET /tournaments/:id/bracket` - Get bracket

### Chat
- `POST /chat/rooms` - Create chat room
- `GET /chat/rooms` - Get user rooms
- `POST /chat/rooms/:id/messages` - Send message
- `GET /chat/rooms/:id/messages` - Get messages

### Notifications
- `GET /notifications` - Get notifications
- `PUT /notifications/:id/read` - Mark as read
- `GET /notifications/unread-count` - Get unread count

## WebSocket Events

### Connection
- `connect` - User connects
- `disconnect` - User disconnects

### Chat
- `join_room` - Join chat room
- `leave_room` - Leave chat room
- `send_message` - Send message
- `typing_start` - Start typing
- `typing_stop` - Stop typing

### Real-time Updates
- `new_message` - New chat message
- `user_online` - User comes online
- `user_offline` - User goes offline
- `notification` - New notification

## Database Schema

The application uses Prisma with PostgreSQL. Key entities:

- **User** - User accounts with XP/leveling
- **Post** - Social posts with hashtags
- **Comment** - Post comments
- **Like** - Like system for posts/comments
- **Clan** - Gaming clans with roles
- **Tournament** - Tournament system with brackets
- **ChatRoom** - Chat rooms (public/private/clan/tournament)
- **Notification** - User notifications

## Testing

### Unit Tests
```bash
npm test
```

### E2E Tests
```bash
npm run test:e2e
```

### Test Coverage
```bash
npm run test:cov
```

## Development

### Database Operations
```bash
# Generate Prisma client
npx prisma generate

# Push schema changes
npx prisma db push

# View database
npx prisma studio

# Reset and seed database
npm run db:seed
```

### Code Generation
```bash
# Generate new module
nest g module feature-name

# Generate service
nest g service feature-name

# Generate controller
nest g controller feature-name
```

## Production Deployment

1. **Build the application:**
```bash
npm run build
```

2. **Set production environment variables**

3. **Run database migrations:**
```bash
npx prisma migrate deploy
```

4. **Start production server:**
```bash
npm run start:prod
```

## Health Monitoring

Health check endpoint: `GET /health`

Returns:
- Application status
- Database connectivity
- Service response times
- Environment information

## Security Features

- JWT token authentication
- Request rate limiting
- Input validation and sanitization
- SQL injection prevention (Prisma)
- CORS configuration
- Secure session management

## Contributing

1. Follow NestJS best practices
2. Write comprehensive tests
3. Use TypeScript strictly
4. Document API changes
5. Follow conventional commits

## License

MIT License - see LICENSE file for details.