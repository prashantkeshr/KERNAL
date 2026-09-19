@echo off
title KERNAL Dev
cd /d "%~dp0"

echo.
echo  ^>_ KERNAL Dev Environment
echo  ================================
echo  [1] Start dev server  (npm run dev)
echo  [2] Open folder in Explorer
echo  [3] Open in VS Code
echo  [4] Run type-check
echo  [Q] Quit
echo.

:menu
set /p choice= Choose [1/2/3/4/Q]:

if /i "%choice%"=="1" goto dev
if /i "%choice%"=="2" goto explorer
if /i "%choice%"=="3" goto vscode
if /i "%choice%"=="4" goto typecheck
if /i "%choice%"=="q" goto end
echo Invalid choice, try again.
goto menu

:dev
echo.
echo Starting Vite dev server at http://localhost:5175 ...
npm run dev
goto end

:explorer
explorer "%~dp0"
goto menu

:vscode
code "%~dp0"
goto menu

:typecheck
echo.
npx tsc -p tsconfig.app.json --noEmit
echo.
pause
goto menu

:end
exit
