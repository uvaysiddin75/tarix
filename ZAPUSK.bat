@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo   Nazorat ishi — Tarix testlari
echo ========================================
echo.

set "NODE_DIR=C:\Program Files\nodejs"
if exist "%NODE_DIR%\node.exe" (
  set "PATH=%NODE_DIR%;%PATH%"
)

where node >nul 2>&1
if errorlevel 1 (
  echo Node.js topilmadi!
  echo Yuklab oling: https://nodejs.org
  echo.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Kutubxonalar o'rnatilmoqda...
  call npm install
  if errorlevel 1 (
    echo npm install xato bilan tugadi.
    pause
    exit /b 1
  )
  echo.
)

if not exist .env (
  if exist .env.example (
    copy .env.example .env >nul
    echo .env yaratildi — .env.example dan nusxa olindi.
    echo Sozlamalarni tekshiring!
    echo.
  )
)

echo Brauzer ochilmoqda...
start "" http://localhost:3000

echo Server ishga tushmoqda... To'xtatish: Ctrl+C
echo.
call npm start

pause
