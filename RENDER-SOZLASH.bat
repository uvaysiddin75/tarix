@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo   RENDER — sozlash (1 marta)
echo ========================================
echo.
echo Render Dashboard ochiladi.
echo Environment bo'limiga quyidagilarni qo'shing:
echo.
echo   ADMIN_EMAIL          = uvaysiddin75@gmail.com
echo   ADMIN_PASSWORD       = sizning parolingiz
echo   ADMIN_NAME           = Uvaysiddin
echo   REGISTRATION_ENABLED = true
echo   GEMINI_API_KEY       = (ixtiyoriy, AI uchun)
echo.
echo Save Changes tugmasini bosing.
echo 2-3 daqiqa kuting, keyin sayt ishlaydi:
echo   https://uvaysiddin75.github.io/tarix/
echo   https://tarix-do6q.onrender.com
echo.
echo Admin kirish: uvaysiddin75@gmail.com + ADMIN_PASSWORD
echo Agar ADMIN_PASSWORD yo'q bo'lsa: admin123
echo.
pause
start "" "https://dashboard.render.com/web/srv-d9l5qg3m8hqs739ajhj0/env"
