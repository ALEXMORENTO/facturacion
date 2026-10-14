@echo off
rem Arranca Facturin (backend + frontend) con doble clic.
title Facturin
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo No se ha encontrado Node.js. Instalalo desde https://nodejs.org/ y vuelve a intentarlo.
  pause
  exit /b 1
)

rem La primera vez instala las dependencias que falten.
if not exist "node_modules" call npm install
if not exist "backend\node_modules" call npm install --prefix backend
if not exist "frontend\node_modules" call npm install --prefix frontend

echo.
echo Arrancando Facturin... El navegador se abrira solo.
echo Para pararlo, cierra esta ventana o pulsa Ctrl + C.
echo.
call npm run dev

pause
