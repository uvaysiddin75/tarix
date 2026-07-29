@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo   Nazorat ishi — Internet orqali
echo ========================================
echo.

set "NODE_DIR=C:\Program Files\nodejs"
if exist "%NODE_DIR%\node.exe" set "PATH=%NODE_DIR%;%PATH%"

set "CF=%TEMP%\cloudflared.exe"
if not exist "%CF%" (
  echo cloudflared yuklanmoqda...
  powershell -NoProfile -Command "Invoke-WebRequest -Uri 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe' -OutFile '%CF%' -UseBasicParsing"
)

where node >nul 2>&1
if errorlevel 1 (
  echo Node.js topilmadi! https://nodejs.org dan o'rnating.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Kutubxonalar o'rnatilmoqda...
  call npm install
)

if not exist .env (
  if exist .env.example copy .env.example .env >nul
)

echo Server ishga tushmoqda...
start "Nazorat Server" /MIN cmd /c "cd /d "%~dp0" && npm start"

timeout /t 3 /nobreak >nul

echo Internet tunnel ochilmoqda...
echo.
echo *** Quyidagi havolani do'stlaringizga yuboring ***
echo.

start "Nazorat Tunnel" cmd /k ""%CF%" tunnel --url http://localhost:3000 --no-autoupdate"

echo.
echo Oyna ochiladi — unda https://....trycloudflare.com havolasini ko'rasiz.
echo Bu oynani YOPMANG — yopilsa sayt ishlamaydi.
echo Server oynasini ham yopmang.
echo.
pause
