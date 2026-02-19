@echo off
echo Starting EduConnect...

cd backend
start "EduConnect Backend" npm start
cd ..

cd frontend
start "EduConnect Frontend" npm run dev
cd ..

echo Servers starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
pause
