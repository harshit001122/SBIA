# Smart Business Insights & Action Platform (SBIA)

## Overview

SBIA is a production-ready MERN stack web application designed for comprehensive business analytics and insights. The platform provides companies with integrated data analytics, team management, AI-powered recommendations, and multi-source data integration capabilities. Built with modern web technologies, it features a React frontend with shadcn/ui components, Express.js backend, PostgreSQL database with Drizzle ORM, and session-based authentication.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Authentication**: Passport.js with local strategy and session management
- **Session Store**: PostgreSQL-based session storage with connect-pg-simple
- **Password Security**: Node.js crypto module with scrypt hashing

### Database Architecture
- **Database**: PostgreSQL with Neon serverless driver
- **ORM**: Drizzle ORM with type-safe queries
- **Schema**: Shared TypeScript schema definitions with Zod validation
- **Migrations**: Drizzle Kit for database schema migrations

## Key Components

### Authentication System
- JWT-free session-based authentication using Passport.js
- Company-based user access control with role management
- Secure password hashing with salt using Node.js scrypt
- Protected routes with authentication middleware

### Database Schema
- **Users**: User profiles with company association and role-based access
- **Companies**: Multi-tenant company profiles with settings
- **Integrations**: Third-party service connections (analytics, CRM, e-commerce)
- **KPI Metrics**: Dynamic key performance indicators tracking
- **Chart Data**: Time-series data for visualization
- **AI Recommendations**: Machine learning-powered business insights
- **Activities**: System activity logging and audit trail
- **Notifications**: Real-time user notification system

### Frontend Components
- **Dashboard**: KPI cards, revenue charts, user analytics, AI recommendations
- **Integrations**: Third-party service management with categorized providers
- **Team Management**: User invitation system with role-based permissions
- **Company Profile**: Organization settings and information management
- **Notifications**: Real-time notification center with read/unread tracking
- **Settings**: User profile and system configuration management

### API Structure
- RESTful API design with consistent error handling
- Real-time data synchronization with configurable refresh intervals
- Comprehensive CRUD operations for all entities
- Input validation using Zod schemas
- Proper HTTP status codes and error responses

## Data Flow

### Authentication Flow
1. User submits credentials via login form
2. Passport.js validates against database using scrypt password comparison
3. Session created and stored in PostgreSQL
4. Protected routes verify session authentication
5. User context provided throughout application

### Data Synchronization
1. Frontend components query API endpoints using TanStack Query
2. Server-side storage layer interfaces with Drizzle ORM
3. Database operations execute against PostgreSQL
4. Real-time updates via configurable polling intervals
5. Optimistic updates with error rollback

### Integration Management
1. Users configure third-party service connections
2. Credentials securely stored with encryption
3. Background synchronization processes update data
4. Activity logging tracks all integration events
5. Error handling and retry mechanisms

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless driver
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **passport**: Authentication middleware
- **express-session**: Session management
- **react-hook-form**: Form handling and validation
- **zod**: Schema validation
- **wouter**: Lightweight routing

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library
- **recharts**: Chart visualization library

### Development Dependencies
- **vite**: Build tool and dev server
- **typescript**: Type safety
- **tsx**: TypeScript execution
- **esbuild**: Fast JavaScript bundler

## Deployment Strategy

### Build Process
- Frontend built with Vite to `dist/public` directory
- Backend compiled with esbuild to `dist/index.js`
- TypeScript type checking with `tsc`
- Environment-specific configuration management

### Production Configuration
- PostgreSQL database with connection pooling
- Session-based authentication with secure cookies
- Environment variables for all sensitive configuration
- Error handling middleware for production safety
- Static file serving for built frontend assets

### Development Workflow
- Hot module replacement with Vite dev server
- TypeScript compilation and type checking
- Database schema synchronization with Drizzle
- Development-specific error overlays and debugging tools

### Environment Requirements
- **NODE_ENV**: Development/production environment flag
- **DATABASE_URL**: PostgreSQL connection string
- **SESSION_SECRET**: Secure session signing key
- **REPL_ID**: Optional Replit-specific configuration

## Recent Changes (January 2025)

### Database Migration Completed
- **Date**: January 9, 2025
- **Change**: Successfully migrated from MongoDB/Mongoose to PostgreSQL/Drizzle ORM
- **Impact**: 
  - All database operations now use PostgreSQL with type-safe Drizzle queries
  - Improved performance and better integration with the existing tech stack
  - Database schema is now managed through Drizzle migrations
  - Storage layer completely rewritten for PostgreSQL compatibility
- **Status**: ✅ Complete and operational