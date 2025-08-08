# GamingX - Gaming Social Platform

## Overview

GamingX is a comprehensive full-stack gaming social platform that combines real-time communication, tournament management, clan systems, and social features specifically designed for gamers. The platform provides a complete gaming community experience with features like live streaming integration, tournament brackets, clan management, real-time chat, user profiles with XP/leveling systems, and AI-powered content moderation.

The application serves as a centralized hub where gamers can connect, compete, share content, join communities, and track their gaming achievements across multiple games and platforms.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Monorepo Structure
The project follows a monorepo architecture with clear separation between frontend, backend, and shared components:
- **Client**: React-based frontend with Vite bundling
- **Server**: Express.js backend with TypeScript
- **Shared**: Common schemas, types, and utilities
- **Apps**: Separate NestJS backend and Next.js frontend applications (alternative architecture)

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Query (TanStack Query) for server state management and caching
- **Styling**: TailwindCSS with custom gaming theme variables and Shadcn/UI component library
- **Real-time**: Socket.IO client for WebSocket connections
- **Form Handling**: React Hook Form with Zod validation schemas
- **Build Tool**: Vite with custom configurations for development and production

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for full-stack type safety
- **API Design**: RESTful endpoints with comprehensive route handling
- **Real-time Communication**: Socket.IO server for WebSocket connections
- **Middleware**: Custom error handling, request logging, and validation middleware
- **Services Layer**: Modular service architecture for tournaments, clans, notifications, AI integration, and WebSocket management

### Database Architecture
- **Primary Database**: PostgreSQL via Neon cloud database
- **ORM**: Drizzle ORM for type-safe database operations with migrations
- **Schema Management**: Centralized schema definitions in shared directory
- **Data Models**: Comprehensive entities for users, posts, comments, clans, tournaments, chat, notifications, and social features
- **Relationships**: Complex relational data structure supporting many-to-many relationships for clans, tournaments, and social connections

### Authentication & Security
- **Authentication**: Replit OAuth integration with JWT tokens
- **Session Management**: Server-side session storage with PostgreSQL
- **Route Protection**: Authentication middleware for protected endpoints
- **Role-based Access**: User roles (user, mod, admin) with permission-based access control

### Real-time Features
- **WebSocket Service**: Custom WebSocket service handling room management, user connections, and real-time events
- **Chat System**: Multi-room chat support (global, clan, tournament, DM)
- **Live Updates**: Real-time notifications, bracket updates, and activity feeds
- **Online Presence**: User online status tracking and typing indicators

### AI Integration
- **OpenAI Integration**: GPT-4o model for content generation and moderation
- **Features**: Automated hashtag generation, content moderation, and bio enhancement
- **Content Safety**: AI-powered toxic content detection and filtering

## External Dependencies

### Core Infrastructure
- **Replit**: Development environment and deployment platform
- **Neon Database**: Managed PostgreSQL cloud database service
- **OpenAI API**: AI content generation and moderation services

### Frontend Dependencies
- **UI Components**: Radix UI primitives with custom theming
- **Icons**: Lucide React icon library
- **Date Handling**: date-fns for date formatting and manipulation
- **Image Handling**: Built-in React image optimization and compression utilities

### Backend Dependencies
- **Database**: @neondatabase/serverless for database connectivity
- **WebSocket**: ws library for WebSocket server implementation
- **Validation**: Zod schema validation library
- **File Processing**: Faker.js for development data seeding
- **Authentication**: Passport.js with OpenID Connect strategies

### Development Tools
- **Build System**: Vite for frontend bundling and development server
- **Database Migration**: Drizzle Kit for database schema management
- **Type Checking**: TypeScript compiler with strict configuration
- **Code Quality**: ESBuild for production bundling

### Optional Integrations
- **Cloud Storage**: Potential Cloudinary integration for media uploads
- **Analytics**: Built-in analytics dashboard for user engagement metrics
- **Streaming**: WebRTC or streaming service integration for live gaming streams

The architecture prioritizes scalability, real-time performance, and developer experience while maintaining clean separation of concerns between different system components.