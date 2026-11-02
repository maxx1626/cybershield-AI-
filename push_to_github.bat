@echo off
title Push CYBERSHIELD AI to GitHub
cd /d "%~dp0"
echo ========================================================
echo Pushing CYBERSHIELD AI to https://github.com/maxx1626/cybershield-AI-
echo ========================================================
echo Staging and committing any recent changes...
git add .
git commit -m "update: latest changes" 2>nul
echo.
echo Pushing to GitHub main branch...
git push -u origin main
echo.
if %ERRORLEVEL% equ 0 (
    echo ========================================================
    echo SUCCESS! Repository updated:
    echo https://github.com/maxx1626/cybershield-AI-
    echo ========================================================
) else (
    echo ========================================================
    echo PUSH REQUIRES AUTHENTICATION.
    echo If a browser or login prompt appeared, complete sign-in.
    echo Or run: git push https://<PAT>@github.com/maxx1626/cybershield-AI-.git main
    echo ========================================================
)
pause
