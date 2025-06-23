# GamingX - Gaming Social Platform

A comprehensive full-stack gaming social platform with real-time features, built with modern web technologies.

## 🚀 Features

- **User Profiles & Authentication** - Complete user management with JWT + OAuth
- **Real-time Messaging** - Chat rooms and direct messaging with WebSocket
- **Clan Management** - Create and manage gaming clans with hierarchical roles
- **Tournament System** - Organize tournaments with bracket generation
- **Social Features** - Follow users, activity feeds, friend requests
- **Gaming Integration** - Game library tracking, achievements, session monitoring
- **Content Discovery** - Trending content, recommendations, search
- **Live Streaming** - Stream management and chat integration
- **Notifications** - Real-time notifications with preferences
- **Settings & Preferences** - Comprehensive user customization

## 🛠️ Tech Stack

### Frontend
- **Next.js** - React framework with server-side rendering
- **TailwindCSS** - Utility-first CSS framework
- **Shadcn/UI** - Modern component library
- **React Query** - Data fetching and state management
- **Wouter** - Lightweight routing
- **Socket.IO Client** - Real-time communication

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web application framework
- **Drizzle ORM** - Type-safe database operations
- **PostgreSQL** - Primary database
- **Socket.IO** - WebSocket server
- **JWT** - Authentication tokens
- **Zod** - Schema validation

### Infrastructure
- **Replit** - Development and deployment platform
- **Neon/PostgreSQL** - Cloud database
- **TypeScript** - Type safety across the stack

## 📁 Project Structure

```
.
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions
│   │   └── types/         # TypeScript type definitions
├── server/                # Backend Express application
│   ├── services/          # Business logic services
│   ├── utils/             # Server utilities
│   ├── validators/        # Request validation
│   ├── routes.ts          # API route definitions
│   ├── storage.ts         # Database interface
│   └── index.ts           # Server entry point
├── shared/                # Shared code between frontend/backend
│   └── schema.ts          # Database schema and types
└── package.json           # Dependencies and scripts
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (or use Replit's built-in database)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gamingx
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in the required environment variables:
   - `DATABASE_URL` - PostgreSQL connection string
   - `JWT_SECRET` - Secret key for JWT tokens
   - `OPENAI_API_KEY` - OpenAI API key (optional)

4. **Set up the database**
   ```bash
   npm run db:push
   npm run db:seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

   This starts both frontend and backend servers:
   - Frontend: http://localhost:5000 (served by backend)
   - Backend API: http://localhost:5000/api
   - WebSocket: ws://localhost:5000

### Available Scripts

- `npm run dev` - Start development server (frontend + backend)
- `npm run dev:frontend` - Start only frontend development server
- `npm run dev:backend` - Start only backend development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push database schema changes
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Drizzle Studio for database management
- `npm run test` - Run tests
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🔐 Authentication

The platform supports multiple authentication methods:

1. **Development Mode** - Automatic login for development
2. **JWT Tokens** - Stateless authentication with Bearer tokens
3. **OAuth Integration** - Google and GitHub OAuth (configure in .env)

### API Authentication

Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 📡 API Endpoints

### Core Endpoints
- `GET /api/auth/user` - Get current user
- `GET/POST /api/posts` - Posts management
- `GET/POST /api/clans` - Clan operations
- `GET/POST /api/tournaments` - Tournament management
- `GET/POST /api/messages` - Chat messaging
- `GET /api/search` - Global search
- `GET /api/notifications` - User notifications

### WebSocket Events
- `user:join` - User joins the platform
- `message:send` - Send chat message
- `tournament:update` - Tournament bracket updates
- `notification:new` - Real-time notifications

## 🗄️ Database Schema

The application uses a comprehensive database schema with the following main entities:

- **Users** - User accounts and profiles
- **Posts** - Social media posts with likes/comments
- **Clans** - Gaming communities with memberships
- **Tournaments** - Tournament management with brackets
- **Chat Rooms & Messages** - Real-time messaging
- **Notifications** - User notification system
- **Gaming Data** - Game libraries, achievements, sessions
- **Streaming** - Live stream management
- **Content** - User-generated content

## 🎮 Features Deep Dive

### Clan System
- Hierarchical roles (Owner, Admin, Moderator, Member)
- Clan events and achievements
- Member management and applications
- XP tracking and leveling

### Tournament Management
- Single/double elimination brackets
- Real-time match updates
- Prize pool management
- Participant registration

### Real-time Features
- Live chat with typing indicators
- Real-time notifications
- Live tournament bracket updates
- Online user presence

### Gaming Integration
- Game library tracking across platforms
- Achievement system with progress tracking
- Gaming session monitoring
- Statistics and leaderboards

## 🧪 Testing

Run the test suite:
```bash
npm run test
```

For watch mode during development:
```bash
npm run test:watch
```

## 🚀 Deployment

### Replit Deployment
1. Push your code to the Replit repository
2. Set environment variables in Replit Secrets
3. The application will automatically deploy

### Manual Deployment
1. Build the application:
   ```bash
   npm run build
   ```

2. Set production environment variables

3. Start the production server:
   ```bash
   npm start
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code comments for implementation details

## 🔮 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced AI recommendations
- [ ] Video streaming integration
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Advanced moderation tools