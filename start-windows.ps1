# PowerShell script to start the Smart Business Insights Platform
Write-Host "Starting Smart Business Insights Platform..." -ForegroundColor Green
Write-Host ""

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "ERROR: .env file not found!" -ForegroundColor Red
    Write-Host "Please create a .env file with your database configuration." -ForegroundColor Yellow
    Write-Host "See README.md for details." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Set environment variables
$env:NODE_ENV = "development"

Write-Host "Starting server..." -ForegroundColor Blue
Write-Host "The application will be available at: http://localhost:5000" -ForegroundColor Cyan
Write-Host ""

# Start the application
& npx tsx server/index.ts