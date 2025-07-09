# Smart Business Insights & Action Platform - Local Setup Guide

## Prerequisites

Before you begin, make sure you have the following installed on your system:

- **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
- **PostgreSQL** (version 12 or higher) - [Download here](https://www.postgresql.org/download/)
- **Git** - [Download here](https://git-scm.com/downloads)

## Step 1: Clone the Repository

```bash
git clone <your-repository-url>
cd smart-business-insights
```

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Database Setup

### Option A: Using Local PostgreSQL

1. **Start PostgreSQL service** on your system
2. **Create a new database and user:**

```sql
-- Connect to PostgreSQL as superuser (usually 'postgres')
psql -U postgres

-- Create database and user
CREATE DATABASE sbia_db;
CREATE USER sbia_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE sbia_db TO sbia_user;

-- Grant schema permissions
\c sbia_db
GRANT ALL ON SCHEMA public TO sbia_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO sbia_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO sbia_user;

-- Exit PostgreSQL
\q
```

### Option B: Using Docker PostgreSQL (Alternative)

If you prefer using Docker:

```bash
# Run PostgreSQL in Docker
docker run --name sbia-postgres \
  -e POSTGRES_DB=sbia_db \
  -e POSTGRES_USER=sbia_user \
  -e POSTGRES_PASSWORD=your_secure_password \
  -p 5432:5432 \
  -d postgres:15
```

## Step 4: Environment Configuration

Create a `.env` file in the root directory:

```bash
# Database Configuration
DATABASE_URL=postgresql://sbia_user:your_secure_password@localhost:5432/sbia_db

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-change-this-in-production-min-32-chars

# Environment
NODE_ENV=development

# Optional: If using different PostgreSQL settings
PGHOST=localhost
PGPORT=5432
PGUSER=sbia_user
PGPASSWORD=your_secure_password
PGDATABASE=sbia_db
```

**Important:** Replace `your_secure_password` with a strong password of your choice.

## Step 5: Database Schema Setup

Push the database schema to your PostgreSQL database:

```bash
npm run db:push
```

If the above command doesn't work, you can manually create the schema by running these SQL commands in your PostgreSQL database:

```sql
-- Connect to your database
psql -U sbia_user -d sbia_db

-- Create the tables (copy and paste the SQL from the commands below)
```

Or use the SQL tool to execute the schema creation directly.

## Step 6: Start the Application

### For Development (with hot reload):

```bash
npm run dev
```

### For Production Build:

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Step 7: Access the Application

Once the server is running, open your web browser and navigate to:

```
http://localhost:5000
```

You should see the Smart Business Insights & Action Platform login page.

## Platform-Specific Instructions

### Windows Users

If you encounter issues with environment variables on Windows, use one of these methods:

**Option A: Using cross-env (Recommended)**
```bash
npm install -g cross-env
cross-env NODE_ENV=development npm run dev
```

**Option B: Using PowerShell**
```powershell
$env:NODE_ENV="development"; npm run dev
```

**Option C: Using Command Prompt**
```cmd
set NODE_ENV=development && npm run dev
```

### macOS/Linux Users

The standard commands should work directly:
```bash
NODE_ENV=development npm run dev
```

## Troubleshooting

### Common Issues

1. **Port 5000 already in use:**
   - Kill the process using port 5000: `lsof -ti:5000 | xargs kill -9` (macOS/Linux)
   - Or change the port in the server configuration

2. **PostgreSQL connection errors:**
   - Ensure PostgreSQL service is running
   - Verify your DATABASE_URL is correct
   - Check that the user has proper permissions

3. **Database schema issues:**
   - Drop and recreate the database if needed
   - Ensure all tables are created properly

4. **Node.js version issues:**
   - Use Node.js version 18 or higher
   - Consider using `nvm` to manage Node.js versions

### Database Reset (if needed)

If you need to reset your database:

```sql
-- Drop and recreate database
DROP DATABASE IF EXISTS sbia_db;
CREATE DATABASE sbia_db;
GRANT ALL PRIVILEGES ON DATABASE sbia_db TO sbia_user;
```

Then run the schema setup again:
```bash
npm run db:push
```

## Development Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the application for production
- `npm start` - Start production server
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Drizzle Studio (database GUI)

## First Time Setup

1. Create a user account through the registration form
2. Create a company profile
3. Explore the dashboard and features

## Need Help?

If you encounter any issues during setup, check:
- All dependencies are installed correctly
- PostgreSQL is running and accessible
- Environment variables are set properly
- Database user has proper permissions

The application should now be running locally on your machine!