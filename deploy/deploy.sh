#!/bin/bash
# Safe Zero-Downtime Deployment Script
set -e

echo "Starting Safe Deployment..."

# Navigate to project root
cd "$(dirname "$0")/.." || exit

# Pull latest changes
echo "Pulling from git..."
git pull origin main || { echo "Git pull failed"; exit 1; }

# Install dependencies
echo "Installing dependencies..."
npm install || npm ci --legacy-peer-deps

# Generate Prisma Client & Push DB
echo "Updating Database..."
npx prisma generate
npx prisma db push

# Backup old build
echo "Backing up current build..."
if [ -d ".next" ]; then
  mv .next .next_backup
fi

# Build Next.js Application
echo "Building Next.js app..."
if npm run build; then
  echo "Build successful! Cleaning up backup..."
  rm -rf .next_backup
else
  echo "Build failed! Restoring backup..."
  rm -rf .next
  mv .next_backup .next
  echo "Deployment aborted due to build failure. Old version is still running."
  exit 1
fi

# Reload PM2 cleanly with zero-downtime
echo "Reloading PM2..."
pm2 reload starwebflow || pm2 start npm --name "starwebflow" -- start

# Save PM2 state
pm2 save

echo "✅ Safe Deployment Successful!"
