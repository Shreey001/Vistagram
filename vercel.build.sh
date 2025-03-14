#!/bin/bash

# Exit on error
set -e

echo "🔧 Setting up build environment..."

# Clean install dependencies
echo "📦 Installing dependencies..."
rm -rf node_modules package-lock.json
npm install

# Run TypeScript compilation
echo "🔍 Running TypeScript compilation..."
npx tsc

# Build the application
echo "🏗️ Building the application..."
npm run build 