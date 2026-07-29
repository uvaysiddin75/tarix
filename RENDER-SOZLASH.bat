@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo   ПОСТОЯННЫЙ СЕРВЕР (Render)
echo ========================================
echo.
echo Сайт НЕ работает без этого шага!
echo.
echo ЧТО ДЕЛАТЬ:
echo   1. Нажмите любую клавишу — откроется Render
echo   2. Войдите через GitHub (Sign in with GitHub)
echo   3. Нажмите синюю кнопку Deploy
echo   4. Подождите 3-5 минут (статус Live)
echo   5. Откройте Settings - Environment
echo   6. Добавьте: ADMIN_PASSWORD = ваш пароль
echo.
echo После этого работает ВСЕГДА:
echo   https://uvaysiddin75.github.io/tarix/
echo   https://tarix-do6q.onrender.com
echo.
echo Компьютер можно выключать!
echo.
pause
start "" "https://dashboard.render.com/select-repo?type=blueprint&repo=https://github.com/uvaysiddin75/tarix"
