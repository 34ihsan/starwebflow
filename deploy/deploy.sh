#!/bin/bash
# Safe Zero-Downtime Deployment Script
set -e

echo "Starting Safe Deployment..."

# Navigate to project root
cd "$(dirname "$0")/.." || exit

# Pull latest changes
echo "Pulling from git..."
git fetch origin main
git reset --hard origin/main

# Install dependencies
echo "Installing dependencies..."
npm install || npm ci --legacy-peer-deps

# Generate Prisma Client & Safe DB Schema Sync
# WARNING: NEVER USE --accept-data-loss OR prisma migrate reset ON PRODUCTION!
echo "Updating Database Safely..."
npx prisma generate
npx prisma db push
node scripts/seed_sinan.js

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

# Reload PM2 cleanly with zero-downtime (Web & Cron)
echo "Reloading PM2 applications (StarWebFlow & Cron)..."
pm2 reload ecosystem.config.js || pm2 start ecosystem.config.js

# Save PM2 state
pm2 save

echo "✅ Safe Deployment Successful!"
