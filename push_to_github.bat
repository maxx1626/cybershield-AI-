@echo off
title Push CYBERSHIELD AI to GitHub
cd /d "%~dp0"
echo ========================================================
echo Pushing CYBERSHIELD AI to https://github.com/maxx1626/cybershield-AI-
echo ========================================================
echo Staging and committing any recent changes...
git add .
git commit -m "feat: complete CYBERSHIELD AI 3D cybersecurity platform" 2>nul
echo.
echo Pushing to remote main branch (overwriting initial blank GitHub README)...
git push -u origin main --force
echo.
echo ========================================================
echo Done! Check your repository at:
echo https://github.com/maxx1626/cybershield-AI-
echo ========================================================
pause
