#!/bin/bash
# CodeVerse Quick Start Script
# This script sets up and starts the Docker execution system

set -e  # Exit on error

echo "🚀 CodeVerse Quick Start"
echo "========================"
echo ""

# Check if Docker is running
echo "1️⃣  Checking Docker..."
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running!"
    echo ""
    echo "Please start Docker:"
    echo "  - macOS/Windows: Open Docker Desktop"
    echo "  - Linux: sudo systemctl start docker"
    echo ""
    exit 1
fi
echo "✅ Docker is running"
echo ""

# Check if docker compose is available
echo "2️⃣  Checking Docker Compose..."
if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
elif docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    echo "❌ Docker Compose not found!"
    echo "Please install Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi
echo "✅ Docker Compose available ($COMPOSE_CMD)"
echo ""

# Navigate to docker directory
echo "3️⃣  Building Docker execution system..."
echo "   This will take 5-10 minutes on first run..."
echo ""

cd docker

# Build and start
$COMPOSE_CMD up --build -d

echo ""
echo "4️⃣  Waiting for server to start..."
sleep 5

# Check health
echo "5️⃣  Checking server health..."
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ Execution server is running!"
    echo ""
    echo "📊 Server status:"
    curl -s http://localhost:3001/health | jq '.'
else
    echo "⚠️  Server might still be starting. Check logs:"
    echo "   cd docker && $COMPOSE_CMD logs"
fi

echo ""
echo "========================"
echo "✅ Setup Complete!"
echo ""
echo "🎯 Next Steps:"
echo "   1. Open http://localhost:5173"
echo "   2. Sign in: demo@codeverse.dev / codeverse"
echo "   3. Go to Playground"
echo "   4. Change engine to 'self-hosted docker'"
echo "   5. Write code and click Run!"
echo ""
echo "📚 Documentation:"
echo "   - FIX_EXECUTION.md (troubleshooting)"
echo "   - DOCKER_SETUP.md (complete guide)"
echo "   - DOCKER_QUICKREF.md (quick reference)"
echo ""
echo "🔍 Check logs: cd docker && $COMPOSE_CMD logs -f"
echo "🛑 Stop server: cd docker && $COMPOSE_CMD down"
echo ""
