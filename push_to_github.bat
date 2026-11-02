@echo off
title Push CYBERSHIELD AI to GitHub
cd /d "%~dp0"
echo ========================================================
echo Pushing CYBERSHIELD AI to https://github.com/maxx1626/cybershield-AI-
echo ========================================================
git status
echo.
git push -u origin main
pause
