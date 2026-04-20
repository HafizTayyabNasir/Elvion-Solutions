@echo off
REM Financial Dashboard Setup Script for Windows
REM Run this after checking out the code

echo.
echo Booting up Advanced Financial Dashboard Setup...
echo.

REM Create directory structure
echo Creating directory structure...
if not exist "app\admin\finance" mkdir app\admin\finance

REM Move the finance page to proper location
if exist "app\admin\finance.tsx" (
    echo Moving finance.tsx to app\admin\finance\page.tsx...
    move /Y "app\admin\finance.tsx" "app\admin\finance\page.tsx"
) else (
    echo Note: finance.tsx not found - may already be in correct location
)

REM Run Prisma migrations
echo.
echo Running database migrations...
call npx prisma db push --accept-data-loss
if %errorlevel% neq 0 (
    echo Error during migration
    exit /b 1
)

REM Seed financial data
echo.
echo Seeding financial data...
call npx prisma db seed
if %errorlevel% neq 0 (
    echo Error during seeding
    exit /b 1
)

REM Install Recharts (charting library)
echo.
echo Installing Recharts...
call npm install recharts

REM Build the project
echo.
echo Building project...
call npm run build
if %errorlevel% neq 0 (
    echo Error during build
    exit /b 1
)

echo.
echo ======================================
echo   Financial Dashboard Setup Complete!
echo ======================================
echo.
echo Dashboard available at: http://localhost:3000/admin/finance
echo Admin-only access - login required
echo.
echo Next Steps:
echo 1. Run: npm run dev
echo 2. Navigate to admin dashboard
echo 3. Click 'Finance' in sidebar menu
echo.
echo Congratulations - Your Financial Dashboard is Ready!
echo.
pause
