# Настройка сервера на Render

Сайт на GitHub Pages: **https://uvaysiddin75.github.io/tarix/**  
Сервер (API): **https://tarix-do6q.onrender.com**

## Что даёт сервер

- Общий **прогресс** всех учеников на всех устройствах
- **Вход** с телефона и компьютера — один аккаунт
- **AI** (если добавите ключ API)
- Автосохранение базы пользователей в GitHub

Если Render «спит» — сайт всё равно работает локально в браузере.

---

## Шаг 1 — Создать Web Service на Render

1. Откройте [render.com](https://render.com) → **Sign In** (через GitHub)
2. **New +** → **Web Service**
3. Подключите репозиторий **`uvaysiddin75/tarix`**
4. Настройки:

| Поле | Значение |
|------|----------|
| Name | `tarix` |
| Region | Frankfurt (или ближайший) |
| Branch | `main` |
| Runtime | **Node** |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Plan | **Free** |

5. Нажмите **Create Web Service**

> Или используйте файл **`render.yaml`** в корне — Render подхватит настройки автоматически (Blueprint).

---

## Шаг 2 — Переменные окружения (Environment)

В Render → ваш сервис → **Environment** → добавьте:

| Key | Value | Зачем |
|-----|-------|-------|
| `NODE_ENV` | `production` | продакшен-режим |
| `JWT_SECRET` | *(случайная длинная строка)* | безопасность токенов |
| `REGISTRATION_ENABLED` | `true` | регистрация открыта |
| `ADMIN_EMAIL` | `uvaysiddin75@gmail.com` | главный админ |
| `ADMIN_PASSWORD` | `salmic1023` | пароль админа |
| `ADMIN_NAME` | `Uvaysiddin` | имя админа |
| `GITHUB_REPO` | `uvaysiddin75/tarix` | куда сохранять базу |
| `GITHUB_TOKEN` | *(ваш GitHub PAT)* | **важно для сохранения данных** |

### Как получить GITHUB_TOKEN

1. GitHub → **Settings** → **Developer settings** → **Personal access tokens**
2. **Generate new token (classic)**
3. Права: **`repo`** (полный доступ к репозиторию)
4. Скопируйте токен → вставьте в Render как `GITHUB_TOKEN`

Без этого токена данные на бесплатном Render могут пропасть после перезапуска.

---

## Шаг 3 — Проверка

После деплоя (2–5 мин) откройте:

- https://tarix-do6q.onrender.com/api/health → должно быть `{"ok":true,...}`
- https://tarix-do6q.onrender.com → откроется тот же сайт с сервером

Вход:
- Email: `uvaysiddin75@gmail.com`
- Пароль: `salmic1023`

---

## Шаг 4 — GitHub Pages + Render вместе

Сайт **https://uvaysiddin75.github.io/tarix/** автоматически:

1. Проверяет, жив ли Render
2. Если да — использует сервер (общий прогресс)
3. Если Render спит — работает локально в браузере

GitHub Actions уже настроены:
- **`keep-render-alive.yml`** — будит сервер каждые 14 минут
- **`backup-users.yml`** — сохраняет базу в `data/users.json` каждые 10 минут

---

## Полезные ссылки

- Render Dashboard: https://dashboard.render.com
- GitHub репозиторий: https://github.com/uvaysiddin75/tarix
- Live сайт: https://uvaysiddin75.github.io/tarix/

---

## Если что-то не работает

| Проблема | Решение |
|----------|---------|
| 503 на Render | Подождите 30–60 сек (free tier просыпается) |
| Вход не работает | Ctrl+F5 на сайте, проверьте email/пароль |
| Прогресс не синхронизируется | Добавьте `GITHUB_TOKEN` в Render |
| Render удалил данные | Восстановятся из `data/users.json` в GitHub |
