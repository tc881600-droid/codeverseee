@echo off
REM CodeVerse Quick Start Script for Windows
REM This script sets up and starts the Docker execution system

echo 🚀 CodeVerse Quick Start
echo ========================
echo.

REM Check if Docker is running
echo 1️⃣  Checking Docker...
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running!
    echo.
    echo Please start Docker Desktop
    echo.
    pause
    exit /b 1
)
echo ✅ Docker is running
echo.

REM Check if docker compose is available
echo 2️⃣  Checking Docker Compose...
docker compose version >nul 2>&1
if errorlevel 1 (
    docker-compose version >nul 2>&1
    if errorlevel 1 (
        echo ❌ Docker Compose not found!
        echo Please install Docker Desktop which includes Compose
        pause
        exit /b 1
    )
    set COMPOSE_CMD=docker-compose
) else (
    set COMPOSE_CMD=docker compose
)
echo ✅ Docker Compose available
echo.

REM Navigate to docker directory
echo 3️⃣  Building Docker execution system...
echo    This will take 5-10 minutes on first run...
echo.

cd docker

REM Build and start
%COMPOSE_CMD% up --build -d

echo.
echo 4️⃣  Waiting for server to start...
timeout /t 5 /nobreak >nul

REM Check health
echo 5️⃣  Checking server health...
curl -s http://localhost:3001/health >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Server might still be starting. Check logs:
    echo    cd docker ^&^& %COMPOSE_CMD% logs
) else (
    echo ✅ Execution server is running!
    echo.
    echo 📊 Server status:
    curl -s http://localhost:3001/health
)

echo.
echo ========================
echo ✅ Setup Complete!
echo.
echo 🎯 Next Steps:
echo    1. Open http://localhost:5173
echo    2. Sign in: demo@codeverse.dev / codeverse
echo    3. Go to Playground
echo    4. Change engine to "self-hosted docker"
echo    5. Write code and click Run!
echo.
echo 📚 Documentation:
echo    - FIX_EXECUTION.md (troubleshooting)
echo    - DOCKER_SETUP.md (complete guide)
echo    - DOCKER_QUICKREF.md (quick reference)
echo.
echo 🔍 Check logs: cd docker ^&^& %COMPOSE_CMD% logs -f
echo 🛑 Stop server: cd docker ^&^& %COMPOSE_CMD% down
echo.
pause
