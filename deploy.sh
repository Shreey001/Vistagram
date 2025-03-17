#!/bin/bash

echo "🚀 Preparing to deploy Vistagram to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
  echo "⚠️ Vercel CLI not found. Installing..."
  npm install -g vercel
fi

# Run lint
echo "🔍 Running linter checks..."
npm run lint

# Check if environment variables are set
if [ ! -f .env ]; then
  echo "⚠️ No .env file found. Creating from example..."
  cp .env.example .env
  echo "⚠️ Please fill in your Supabase credentials in the .env file before deploying."
  exit 1
fi

# Test build locally
echo "🏗️ Testing build locally..."
npm run build

# If build was successful, deploy
if [ $? -eq 0 ]; then
  echo "✅ Build successful! Deploying to Vercel..."
  vercel --prod
else
  echo "❌ Build failed. Please fix the issues before deploying."
  exit 1
fi 