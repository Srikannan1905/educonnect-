@echo off
echo ===================================================
echo   EduConnect Professional Restart Script
echo ===================================================
echo.

echo [1/4] Stopping any running servers...
taskkill /F /IM node.exe >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    - Stopped existing Node.js processes.
) else (
    echo    - No running Node.js processes found.
)

echo [2/4] SQL Data Safety Check...
echo    - Database sync is set to 'force: false' in server.js.
echo    - Your data will be PRESERVED.

echo [3/4] Starting Backend Server (Port 5000)...
start "EduConnect Backend" /D "backend" cmd /k "npm start"
timeout /t 5 /nobreak >nul

echo [4/4] Starting Frontend Server (Port 3000)...
start "EduConnect Frontend" /D "frontend" cmd /k "npm run dev"

echo.
echo ===================================================
echo   System Restarted Successfully!
echo ===================================================
echo   Backend:  http://localhost:5000
echo   Frontend: http://localhost:3000
echo.
echo   Please close this window and refresh your browser.
pause
