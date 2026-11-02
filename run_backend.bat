@echo off
title CYBERSHIELD AI - Backend Server
echo ========================================================
echo CYBERSHIELD AI - Starting FastAPI Backend Server
echo ========================================================
set PATH=C:\Users\chara\Python311;C:\Users\chara\Python311\Scripts;%PATH%
set PYTHONPATH=%~dp0
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
pause

