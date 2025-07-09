@echo off
echo Starting Smart Business Insights Platform...
echo.

REM Check if .env exists
if not exist .env (
    echo ERROR: .env file not found!
    echo Please create a .env file with your database configuration.
    echo See README.md for details.
    pause
    exit /b 1
)

REM Set environment and start the application
set NODE_ENV=development
echo Starting server...
npx tsx server/index.ts