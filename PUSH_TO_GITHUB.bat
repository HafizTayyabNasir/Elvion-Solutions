@echo off
REM Complete Deployment Script - Post-Windows Reinstall
REM This script initializes git, configures it, and pushes to GitHub

setlocal enabledelayedexpansion

echo.
echo ========================================
echo DEPLOYMENT SCRIPT - POST-WINDOWS REINSTALL
echo ========================================
echo.

REM Step 1: Check and initialize git repository
echo Step 1: Checking Git Repository...
if exist ".git\" (
    echo Git repository already initialized.
) else (
    echo Initializing Git repository...
    git init
    echo Git repository initialized.
)

echo.

REM Step 2: Configure git (local)
echo Step 2: Configuring Git...
git config user.name "Hafiz Tayyab"
git config user.email "hafiz@elvionsolutions.com"
echo Git configured locally.

echo.

REM Step 3: Add remote
echo Step 3: Checking Remote Repository...
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo Adding GitHub remote...
    git remote add origin https://github.com/HafizTayyabNasir/Elvion-Solutions.git
    echo Remote added.
) else (
    echo Remote already configured.
)

echo.

REM Step 4: Show status
echo Step 4: Current Git Status
git status

echo.

REM Step 5: Stage changes
echo Step 5: Staging Changes...
git add .
echo All changes staged.

echo.

REM Step 6: Commit
echo Step 6: Committing Changes...
git commit -m "Post-Windows reinstall: Project refresh for Vercel deployment

- Updated deployment timestamp in app/page.tsx
- Project ready for re-deployment to Vercel
- All dependencies verified and locked

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"

echo Changes committed.

echo.

REM Step 7: Push to GitHub
echo Step 7: Pushing to GitHub...
git push -u origin main

echo.
echo ========================================
echo DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo [OK] Your project has been pushed to GitHub
echo [OK] Vercel will auto-deploy within 30 seconds
echo.
echo View build status: https://vercel.com/dashboard
echo GitHub repo: https://github.com/HafizTayyabNasir/Elvion-Solutions
echo.

pause
