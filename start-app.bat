@echo off
title Safe Route Navigator - Startup
echo ================================================
echo          Safe Route Navigator
echo ================================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM If script called with "jenkins" argument, run Jenkins directly
if /I "%~1"=="jenkins" goto RUN_JENKINS

REM Add helper commands for local Docker build and AKS deploy
if /I "%~1"=="docker-build" (
    echo Building backend Docker image locally...
    docker build -t saferoute-backend:local -f backend/Dockerfile backend/
    echo Building frontend Docker image locally...
    docker build -t saferoute-frontend:local -f frontend/Dockerfile frontend/
    echo Done.
    pause
    exit /b 0
)

REM <-- NEW: push built images to Docker Hub (builds then pushes). Usage: start-app.bat docker-push <tag>
if /I "%~1"=="docker-push" (
    REM require Docker Hub credentials as env vars
    if "%DOCKERHUB_USERNAME%"=="" (
        echo ERROR: Set DOCKERHUB_USERNAME environment variable before running.
        pause
        exit /b 1
    )
    if "%DOCKERHUB_PASSWORD%"=="" (
        echo ERROR: Set DOCKERHUB_PASSWORD environment variable before running.
        pause
        exit /b 1
    )
    set TAG=%~2
    if "%TAG%"=="" set TAG=latest

    echo Building backend image...
    docker build -t %DOCKERHUB_USERNAME%/safroute-backend:%TAG% -f backend/Dockerfile backend/
    echo Building frontend image...
    docker build -t %DOCKERHUB_USERNAME%/safroute-frontend:%TAG% -f frontend/Dockerfile frontend/

    echo Logging in to Docker Hub...
    echo %DOCKERHUB_PASSWORD% | docker login -u %DOCKERHUB_USERNAME% --password-stdin
    if errorlevel 1 (
        echo ERROR: Docker login failed.
        pause
        exit /b 1
    )

    echo Pushing backend image...
    docker push %DOCKERHUB_USERNAME%/safroute-backend:%TAG%
    echo Pushing frontend image...
    docker push %DOCKERHUB_USERNAME%/safroute-frontend:%TAG%

    echo Done. Images pushed as %DOCKERHUB_USERNAME%/safroute-backend:%TAG% and %DOCKERHUB_USERNAME%/safroute-frontend:%TAG%
    pause
    exit /b 0
)

REM <-- NEW: pull images from Docker Hub and run them. Usage: start-app.bat run-hub <tag>
if /I "%~1"=="run-hub" (
    set TAG=%~2
    if "%TAG%"=="" set TAG=latest
    if "%DOCKERHUB_USERNAME%"=="" (
        echo ERROR: Set DOCKERHUB_USERNAME environment variable before running.
        pause
        exit /b 1
    )

    echo Pulling backend image...
    docker pull %DOCKERHUB_USERNAME%/safroute-backend:%TAG%
    echo Pulling frontend image...
    docker pull %DOCKERHUB_USERNAME%/safroute-frontend:%TAG%

    echo Starting backend container...
    docker run -d --name sr-backend -p 5000:5000 %DOCKERHUB_USERNAME%/safroute-backend:%TAG%
    echo Waiting 5 seconds for backend to start...
    timeout /t 5 /nobreak >nul

    echo Starting frontend container...
    docker run -d --name sr-frontend -p 3000:80 --link sr-backend:backend %DOCKERHUB_USERNAME%/safroute-frontend:%TAG%

    echo.
    echo Frontend: http://localhost:3000
    echo Backend: http://localhost:5000
    pause
    exit /b 0
)

REM <-- NEW: tag & push existing local images to Docker Hub. Usage: start-app.bat docker-push-local <tag>
if /I "%~1"=="docker-push-local" (
    REM Usage: start-app.bat docker-push-local <tag>
    if "%DOCKERHUB_USERNAME%"=="" (
        echo ERROR: Set DOCKERHUB_USERNAME environment variable before running.
        pause
        exit /b 1
    )
    set TAG=%~2
    if "%TAG%"=="" set TAG=latest

    echo Tagging existing local images...
    docker tag saferoute-backend:local %DOCKERHUB_USERNAME%/safroute-backend:%TAG% 2>nul || (
        echo WARN: local image saferoute-backend:local not found
    )
    docker tag saferoute-frontend:local %DOCKERHUB_USERNAME%/safroute-frontend:%TAG% 2>nul || (
        echo WARN: local image saferoute-frontend:local not found
    )

    echo Logging in to Docker Hub...
    if "%DOCKERHUB_PASSWORD%"=="" (
        echo Please enter Docker Hub password for %DOCKERHUB_USERNAME%
        docker login -u %DOCKERHUB_USERNAME%
    ) else (
        echo %DOCKERHUB_PASSWORD% | docker login -u %DOCKERHUB_USERNAME% --password-stdin
    )

    echo Pushing images...
    docker push %DOCKERHUB_USERNAME%/safroute-backend:%TAG% || echo Push backend failed
    docker push %DOCKERHUB_USERNAME%/safroute-frontend:%TAG% || echo Push frontend failed

    echo Done.
    pause
    exit /b 0
)

echo Starting Safe Route Navigator Application...
echo.
echo This will start both the backend API server and frontend application
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.

REM Install dependencies if needed
if not exist "node_modules" (
    echo Installing root dependencies...
    npm install
)

if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend
    npm install
    cd ..
)

if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    npm install
    cd ..
)

REM Setup database if needed
if not exist "backend\safe_route_navigator.sqlite" (
    echo Setting up database...
    cd backend
    node scripts\setupDatabase.js
    node seedDatabase.js
    cd ..
)

REM Start backend in a new window
echo Starting backend server...
start "Safe Route Backend" cmd /k "cd /d "%~dp0\backend" && npm start"

REM Wait a moment for backend to start
timeout /t 5 /nobreak >nul

REM Start frontend in a new window
echo Starting frontend application...
start "Safe Route Frontend" cmd /k "cd /d "%~dp0\frontend" && npm start"

echo.
echo ================================================
echo Both servers are starting in separate windows:
echo.
echo 1. Backend API Server (Port 5000)
echo 2. Frontend Application (Port 3000)
echo.
echo The application will open automatically in your browser
echo.
echo Demo Login Credentials:
echo Email: demo@saferoute.com
echo Password: Demo123!
echo.
echo To stop the servers, close both terminal windows
echo or press Ctrl+C in each window
echo ================================================

echo.
echo Opening browser in 10 seconds...
timeout /t 10 /nobreak >nul
start http://localhost:3000

pause
goto :EOF

:RUN_JENKINS
echo Starting Jenkins (from local jenkins.war)...
REM Check Java
java -version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Java is not installed or not in PATH
    pause
    exit /b 1
)
if not exist "%~dp0jenkins.war" (
    echo ERROR: jenkins.war not found in project root (%~dp0)
    pause
    exit /b 1
)
start "Jenkins" cmd /k "cd /d "%~dp0" && java -jar jenkins.war --httpPort=8080"
echo Jenkins should be starting on http://localhost:8080
pause