@echo off
REM Deploy Advanced Financial Dashboard to Vercel
REM Run this script to build and deploy to production

setlocal enabledelayedexpansion

cls
echo.
echo =========================================
echo   Financial Dashboard Deployment Script
echo =========================================
echo.

REM Step 1: Setup Finance Dashboard
echo [1/5] Setting up Financial Dashboard...
if exist "setup-finance-dashboard.bat" (
    call setup-finance-dashboard.bat
    echo [OK] Dashboard setup complete
) else (
    echo [ERROR] Setup script not found
    exit /b 1
)

REM Step 2: Build project
echo.
echo [2/5] Building project...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Build failed
    exit /b 1
)
echo [OK] Build successful

REM Step 3: Install Vercel CLI if not present
echo.
echo [3/5] Checking Vercel CLI...
where vercel >nul 2>nul
if %errorlevel% neq 0 (
    echo Installing Vercel CLI...
    call npm install -g vercel
)
echo [OK] Vercel CLI ready

REM Step 4: Deploy to Vercel
echo.
echo [4/5] Deploying to Vercel...
echo.
echo ============================================
echo Opening Vercel deployment interface...
echo ============================================
echo.
call vercel deploy --prod
if %errorlevel% neq 0 (
    echo [ERROR] Deployment failed
    exit /b 1
)

REM Step 5: Deployment complete
echo.
echo =========================================
echo   Deployment Complete!
echo =========================================
echo.
echo Your Financial Dashboard is now LIVE!
echo.
echo Dashboard URL: https://your-domain.com/admin/finance
echo Admin Dashboard: https://your-domain.com/admin/dashboard
echo.
echo Features:
echo   * 14 advanced financial modules
echo   * Real-time metrics calculation
echo   * USD ^& PKR currency support
echo   * Comprehensive financial analytics
echo.
pause
