@echo off
title CYBERSHIELD AI - Launcher
echo ========================================================
echo CYBERSHIELD AI - Predictive Cyber Defence Platform
echo Launching Backend (Port 8000) and Frontend (Port 5173)...
echo ========================================================
start "CYBERSHIELD Backend" "%~dp0run_backend.bat"
timeout /t 3 /nobreak >nul
start "CYBERSHIELD Frontend" "%~dp0run_frontend.bat"
echo.
echo Both servers are launching.
echo Backend API & Docs: http://localhost:8000/docs
echo Frontend Web App:   http://localhost:5173
echo ========================================================

