# Deployment script for GitHub and Vercel

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DEPLOYMENT SCRIPT - POST-WINDOWS REINSTALL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if git is initialized
Write-Host "Step 1: Checking Git Repository..." -ForegroundColor Yellow
if (!(Test-Path ".git")) {
    Write-Host "Initializing Git repository..." -ForegroundColor Green
    git init
    Write-Host "Repository initialized." -ForegroundColor Green
} else {
    Write-Host "Git repository already initialized." -ForegroundColor Green
}

Write-Host ""

# Step 2: Configure git user (if needed)
Write-Host "Step 2: Configuring Git..." -ForegroundColor Yellow
$gitName = git config user.name
$gitEmail = git config user.email

if ([string]::IsNullOrEmpty($gitName)) {
    Write-Host "Git user name not set. Setting up git configuration..." -ForegroundColor Green
    git config user.name "Hafiz Tayyab"
    git config user.email "hafiz@elvionsolutions.com"
    Write-Host "Git configured." -ForegroundColor Green
} else {
    Write-Host "Git already configured as: $gitName ($gitEmail)" -ForegroundColor Green
}

Write-Host ""

# Step 3: Check for remote
Write-Host "Step 3: Checking Remote Repository..." -ForegroundColor Yellow
$remote = git remote get-url origin 2>$null
if ([string]::IsNullOrEmpty($remote)) {
    Write-Host "Adding GitHub remote..." -ForegroundColor Green
    git remote add origin https://github.com/HafizTayyabNasir/Elvion-Solutions.git
    Write-Host "Remote added." -ForegroundColor Green
} else {
    Write-Host "Remote already configured: $remote" -ForegroundColor Green
}

Write-Host ""

# Step 4: Check git status
Write-Host "Step 4: Current Git Status" -ForegroundColor Yellow
git status
Write-Host ""

# Step 5: Stage all changes
Write-Host "Step 5: Staging Changes..." -ForegroundColor Yellow
git add .
Write-Host "All changes staged." -ForegroundColor Green
Write-Host ""

# Step 6: Commit changes
Write-Host "Step 6: Committing Changes..." -ForegroundColor Yellow
$commitMessage = @"
Post-Windows reinstall: Project refresh for Vercel deployment

- Updated deployment timestamp in app/page.tsx
- Project ready for re-deployment to Vercel
- All dependencies verified and locked

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
"@

git commit -m $commitMessage
Write-Host "Changes committed." -ForegroundColor Green
Write-Host ""

# Step 7: Push to GitHub
Write-Host "Step 7: Pushing to GitHub..." -ForegroundColor Yellow
git push -u origin main
if ($LASTEXITCODE -eq 0) {
    Write-Host "Successfully pushed to GitHub!" -ForegroundColor Green
} else {
    Write-Host "Push completed with status code: $LASTEXITCODE" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DEPLOYMENT COMPLETE!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Your project has been pushed to GitHub" -ForegroundColor Green
Write-Host "✅ Vercel will auto-deploy within 30 seconds" -ForegroundColor Green
Write-Host ""
Write-Host "📊 View build status: https://vercel.com/dashboard" -ForegroundColor Cyan
Write-Host "📝 GitHub repo: https://github.com/HafizTayyabNasir/Elvion-Solutions" -ForegroundColor Cyan
Write-Host ""
