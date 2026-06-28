#!/bin/bash
# Zero-Downtime Deployment Script
set -e

echo "Starting Deployment..."

# Navigate to project root
cd "$(dirname "$0")/.." || exit

# Install dependencies
echo "Installing dependencies..."
npm ci --legacy-peer-deps

# Generate Prisma Client
echo "Generating Prisma Client..."
npx prisma generate

# Build Next.js Application
echo "Building Next.js app..."
npm run build

# Reload PM2 cleanly with zero-downtime
echo "Reloading PM2 in cluster mode..."
pm2 reload starwebflow --update-env || pm2 start ecosystem.config.js

# Save PM2 state
pm2 save

echo "✅ Deployment Successful!"
