@echo off
cd frontend
del node_modules\.vite\deps\_metadata.json 2>nul
npm run dev -- --host
pause
