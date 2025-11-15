#!/usr/bin/env pwsh

Write-Host "🚀 Starting Git reset + clean push fix..." -ForegroundColor Cyan

# Remove problematic env files
$envFiles = @(" - Copy.env", "- Copy.env", "Copy.env")
foreach ($file in $envFiles) {
    if (Test-Path $file) {
        Write-Host "🗑 Removing leaked env file: '$file'" -ForegroundColor Yellow
        Remove-Item -Force $file -ErrorAction SilentlyContinue
    }
}

# Remove existing Git history
if (Test-Path ".git") {
    Write-Host "🧹 Removing old .git directory..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force .git
}

# Re-init Git
Write-Host "📦 Initializing new Git repo..." -ForegroundColor Cyan
git init

# Write .gitignore safely
Write-Host "📝 Updating .gitignore..." -ForegroundColor Cyan
@"
.env
.env.*
*.env
*Copy.env
 - Copy.env
"@ | Out-File -FilePath .gitignore -Encoding utf8 -NoNewline

# Stage all files
Write-Host "📥 Adding all files..." -ForegroundColor Cyan
git add .

# Create initial commit with all files
Write-Host "📦 Creating initial commit..." -ForegroundColor Cyan
git commit -m "Initial clean commit"

# Rename branch to main
Write-Host "🔀 Setting branch to 'main'..." -ForegroundColor Cyan
git branch -M main

# Add remote (update URL to your repo)
Write-Host "🌐 Adding remote origin..." -ForegroundColor Cyan
git remote remove origin 2>$null
git remote add origin https://github.com/Baklaja25/ingrego.git

# Push to GitHub
Write-Host "📤 Pushing to GitHub..." -ForegroundColor Cyan
git push -u origin main --force

Write-Host "✅ DONE! Your repo is now clean and pushed successfully." -ForegroundColor Green

