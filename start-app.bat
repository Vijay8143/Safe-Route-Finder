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

REM Dispatch based on first argument (use GOTO to avoid multi-line IF parsing issues)
if /I "%~1"=="docker-build" goto DOCKER_BUILD
if /I "%~1"=="docker-push"  goto DOCKER_PUSH
if /I "%~1"=="run-hub"      goto RUN_HUB
if /I "%~1"=="docker-push-local" goto DOCKER_PUSH_LOCAL
if /I "%~1"=="jenkins"      goto RUN_JENKINS

REM If no special args: show info and exit
echo Starting Safe Route Navigator Application (local dev)...
echo.
echo NOTE: This script will no longer run npm install on backend/frontend on the host to avoid native module issues.
echo Use: .\start-app.bat docker-build  to build local docker images and start containers.
echo.
pause
goto :EOF

:DOCKER_BUILD
echo Removing potentially-broken host node_modules (backend/frontend)...
if exist backend\node_modules (
    rd /s /q backend\node_modules
)
if exist frontend\node_modules (
    rd /s /q frontend\node_modules
)

echo Building backend image (native modules compiled inside container)...
docker build --pull --no-cache -t saferoute-backend:local -f backend\Dockerfile backend\

echo Skipping sqlite3 manual rebuild (using packaged binary or Postgres).
echo Building frontend image...
docker build --pull --no-cache -t saferoute-frontend:local -f frontend\Dockerfile frontend\

echo Done.
pause
exit /b 0

:DOCKER_PUSH
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
docker build -t %DOCKERHUB_USERNAME%/safroute-backend:%TAG% -f backend\Dockerfile backend\
echo Building frontend image...
docker build -t %DOCKERHUB_USERNAME%/safroute-frontend:%TAG% -f frontend\Dockerfile frontend\

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

:DOCKER_PUSH_LOCAL
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

:RUN_HUB
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
start "Jenkins" cmd /k "cd /d %~dp0 && java -jar jenkins.war --httpPort=8080"
echo Jenkins should be starting on http://localhost:8080
pause