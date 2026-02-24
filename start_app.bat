@echo off
setlocal
title EduConnect Pro Startup

echo ===================================================
echo   EduConnect Professional Startup System
echo ===================================================
echo.

echo [1/3] Ensuring clean environment...
taskkill /F /IM node.exe >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    - Cleaned up existing processes.
)

echo [2/3] Initializing Backend (Port 5000)...
start "EduConnect Backend" /D "backend" cmd /k "node server.js"
timeout /t 5 /nobreak >nul

echo [3/3] Initializing Frontend (Port 3000)...
start "EduConnect Frontend" /D "frontend" cmd /k "npm run dev"

echo.
echo ===================================================
echo   System Started Successfully!
echo ===================================================
echo   Access the application at:
echo   - Local Portal:  http://localhost:3000
echo   - Backend API:   http://127.0.0.1:5000/api
echo.
echo   NOTE: Please keep this window and the terminal 
echo         windows open while using the app.
echo ==================
pause
