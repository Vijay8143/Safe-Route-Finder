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

if /I "%~1"=="deploy-aks" (
    echo Deploying to AKS using az & kubectl (ensure AZ vars are set)...
    az login --service-principal -u %AZURE_CLIENT_ID% -p %AZURE_CLIENT_SECRET% --tenant %AZURE_TENANT_ID%
    az account set --subscription %AZURE_SUBSCRIPTION_ID%
    az aks get-credentials --resource-group %AKS_RESOURCE_GROUP% --name %AKS_CLUSTER_NAME% --admin
    REM create namespace and acr secret
    kubectl apply -f k8s/namespace.yaml
    kubectl create secret docker-registry acr-secret --docker-server=%ACR_LOGIN_SERVER% --docker-username=%ACR_USERNAME% --docker-password=%ACR_PASSWORD% --docker-email=ci@local -n saferoute --dry-run=client -o yaml | kubectl apply -f -
    REM render templates locally using envsubst if available (Windows may require WSL or Git Bash)
    echo Please use CI deployment for templating or run rendering in WSL/Git-Bash.
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