@echo off
title CYBERSHIELD AI - Frontend Server
echo ========================================================
echo CYBERSHIELD AI - Starting Vite Frontend Server
echo ========================================================
set PATH=C:\Users\chara\nodejs;%PATH%
cd /d "%~dp0frontend"
npm run dev -- --host 0.0.0.0
pause

