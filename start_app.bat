@echo off
echo Starting EduConnect...

echo Starting Backend...
start "EduConnect Backend" /D "backend" cmd /k "npm start"

echo Starting Frontend...
start "EduConnect Frontend" /D "frontend" cmd /k "npm run dev"

echo EduConnect is running!
echo Frontend: http://localhost:3000
echo Backend: http://localhost:5000
pause
