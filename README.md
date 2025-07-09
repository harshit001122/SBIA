# Smart Business Insights & Action Platform (SBIA)

A production-ready MERN stack web application for comprehensive business analytics and insights.

## Features

- **Authentication System**: Secure user registration and login with company-based access
- **Dynamic Dashboard**: Real-time KPI cards, revenue charts, user analytics, and AI recommendations
- **API Integrations**: Connect and manage third-party business tools
- **Team Management**: Role-based user permissions and team collaboration
- **Company Management**: Organization profiles and settings
- **Notifications**: Real-time notification system with read/unread tracking
- **Settings**: Comprehensive user and system configuration

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui components
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with session-based auth
- **State Management**: TanStack Query
- **Routing**: Wouter
- **Forms**: React Hook Form with Zod validation

## Prerequisites

- Node.js 18+ (recommended: Node.js 20)
- PostgreSQL database
- npm or yarn package manager

## Local Setup Instructions

### Step 1: Clone and Install Dependencies

```bash
git clone <your-repository-url>
cd DynamicBusinessInsights
npm install
```

### Step 2: Database Setup

1. **Install PostgreSQL** on your system if not already installed
2. **Create a new database** for the project:
   ```sql
   CREATE DATABASE sbia_db;
   CREATE USER sbia_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE sbia_db TO sbia_user;
   ```

### Step 3: Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DATABASE_URL=postgresql://sbia_user:your_password@localhost:5432/sbia_db
PGHOST=localhost
PGPORT=5432
PGUSER=sbia_user
PGPASSWORD=your_password
PGDATABASE=sbia_db

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# Environment
NODE_ENV=development
```

### Step 4: Database Schema Setup

Push the database schema to your PostgreSQL database:

```bash
npm run db:push
```

### Step 5: Running the Application

For **Windows** users, you need to handle environment variables differently:

#### Option A: Using cross-env (Recommended)

Install cross-env globally:
```bash
npm install -g cross-env
```

Then run:
```bash
cross-env NODE_ENV=development npx tsx server/index.ts
```

#### Option B: Using PowerShell

```powershell
$env:NODE_ENV="development"; npx tsx server/index.ts
```

#### Option C: Using Command Prompt

```cmd
set NODE_ENV=development && npx tsx server/index.ts
```

### Step 6: Access the Application

Once the server starts successfully, you'll see:
```
[express] serving on port 5000
```

Open your browser and navigate to:
- **Application**: http://localhost:5000
- **API**: http://localhost:5000/api

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions
├── server/                # Backend Express application
│   ├── index.ts          # Main server file
│   ├── routes.ts         # API routes
│   ├── auth.ts           # Authentication logic
│   ├── storage.ts        # Database operations
│   └── db.ts             # Database connection
├── shared/               # Shared types and schemas
│   └── schema.ts         # Database schema and types
└── package.json          # Project dependencies
```

## API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/user` - Get current user

### Dashboard
- `GET /api/dashboard/kpi-metrics` - Get KPI metrics
- `GET /api/dashboard/revenue-chart` - Get revenue chart data
- `GET /api/dashboard/user-chart` - Get user analytics data

### Company Management
- `GET /api/company` - Get company details
- `POST /api/company` - Create/update company
- `GET /api/team` - Get team members
- `POST /api/team/invite` - Invite team member

### Integrations
- `GET /api/integrations` - Get all integrations
- `POST /api/integrations` - Create new integration
- `PUT /api/integrations/:id` - Update integration
- `DELETE /api/integrations/:id` - Delete integration

### Notifications
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications` - Create notification
- `PUT /api/notifications/:id/read` - Mark as read
- `GET /api/notifications/unread-count` - Get unread count

## Development Guidelines

### Database Changes
- Always use Drizzle migrations: `npm run db:push`
- Never manually edit the database schema
- Update `shared/schema.ts` for any database changes

### Code Style
- Use TypeScript for all files
- Follow the existing component structure
- Use shadcn/ui components where possible
- Implement proper error handling

### Authentication
- All protected routes require authentication
- Use the `ProtectedRoute` component for frontend protection
- Backend routes use middleware for protection

## Troubleshooting

### Common Issues

1. **Port 5000 already in use**
   - Kill the process: `npx kill-port 5000`
   - Or change the port in `server/index.ts`

2. **Database connection errors**
   - Verify PostgreSQL is running
   - Check your DATABASE_URL is correct
   - Ensure the database and user exist

3. **Environment variable issues on Windows**
   - Use cross-env as shown in the setup instructions
   - Ensure all required environment variables are set

4. **Build errors**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check TypeScript errors: `npm run check`

### Getting Help

If you encounter issues:
1. Check the console logs for specific error messages
2. Verify all environment variables are set correctly
3. Ensure PostgreSQL is running and accessible
4. Check that all dependencies are installed correctly

## Production Deployment

For production deployment:
1. Set `NODE_ENV=production`
2. Use a production PostgreSQL database
3. Set a secure `SESSION_SECRET`
4. Build the application: `npm run build`
5. Start with: `npm start`

## License

MIT License - see LICENSE file for details.