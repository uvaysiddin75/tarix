@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo   Render — doimiy server sozlash
echo ========================================
echo.
echo 1. Brauzerda Render ochiladi
echo 2. GitHub orqali kiring
echo 3. Deploy tugmasini bosing
echo 4. Sozlamalarda ADMIN_PASSWORD kiriting (admin paroli)
echo 5. GEMINI_API_KEY — ixtiyoriy (AI uchun)
echo.
echo Deploy tugagach sayt doim ishlaydi:
echo   https://uvaysiddin75.github.io/tarix/
echo   https://tarix.onrender.com
echo.
echo ZAPUSK-INTERNET.bat endi kerak emas!
echo.
pause
start "" "https://render.com/deploy?repo=https://github.com/uvaysiddin75/tarix"
