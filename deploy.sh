#!/bin/bash

# 🚀 Production Deployment Script for Exclusive Villa Samui
# Run this script to deploy to production

set -e  # Exit on any error

echo "🏖️ Exclusive Villa Samui - Production Deployment"
echo "================================================="

# Check if required tools are installed
check_requirements() {
    echo "🔍 Checking requirements..."
    
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo "❌ npm is not installed"
        exit 1
    fi
    
    echo "✅ Requirements check passed"
}

# Install dependencies
install_dependencies() {
    echo "📦 Installing dependencies..."
    npm ci --only=production
    echo "✅ Dependencies installed"
}

# Build the application
build_application() {
    echo "🏗️ Building application..."
    npm run build
    echo "✅ Application built successfully"
}

# Run database migrations
run_migrations() {
    echo "🗄️ Running database migrations..."
    npx prisma migrate deploy
    echo "✅ Database migrations completed"
}

# Generate Prisma client
generate_prisma() {
    echo "🔧 Generating Prisma client..."
    npx prisma generate
    echo "✅ Prisma client generated"
}

# Seed database (optional)
seed_database() {
    echo "🌱 Seeding database..."
    if [ -f "prisma/seed.ts" ]; then
        npm run prisma:seed
        echo "✅ Database seeded"
    else
        echo "⚠️ No seed file found, skipping..."
    fi
}

# Start the application
start_application() {
    echo "🚀 Starting application..."
    npm start
}

# Main deployment process
main() {
    echo "Starting deployment process..."
    
    check_requirements
    install_dependencies
    generate_prisma
    build_application
    run_migrations
    seed_database
    
    echo ""
    echo "🎉 Deployment completed successfully!"
    echo "🌐 Your application is ready to start"
    echo ""
    echo "To start the application:"
    echo "npm start"
    echo ""
    echo "To start with PM2 (recommended for production):"
    echo "pm2 start npm --name 'villa-samui' -- start"
    echo ""
}

# Run the main function
main "$@"