@echo off
title IMovies — Launcher
echo ============================================================
echo Starting IMovies (MERN Stack Cinema Booking Application)
echo ============================================================
echo.
echo [1/2] Starting Express REST API Server on port 5000...
start "IMovies Server (Port 5000)" cmd /k "cd /d %~dp0server && npm.cmd start"
timeout /t 2 /nobreak >nul

echo [2/2] Starting React Vite Client on port 5173...
start "IMovies Client (Port 5173)" cmd /k "cd /d %~dp0client && npm.cmd run dev -- --host --port 5173"

echo.
echo Servers successfully launched!
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:5000/api/health
echo.
pause