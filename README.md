# Тесты — личный кабинет

## Структура проекта

```
tests-app/
├─ index.html
├─ package.json
├─ vite.config.js
├─ .env.example        ← сюда ключи Supabase (скопируй в .env)
├─ supabase/
│  └─ schema.sql        ← выполнить один раз в Supabase SQL Editor
└─ src/
   ├─ main.jsx          ← точка входа
   ├─ App.jsx            ← всё приложение (экраны, логика, стили)
   └─ lib/
      ├─ supabaseClient.js  ← подключение к Supabase
      └─ store.js            ← замена window.storage на запросы к Supabase
```

## Запуск локально (проверить, что всё работает)

1. Установи Node.js (18+), если ещё нет: https://nodejs.org
2. В папке проекта:
   ```bash
   npm install
   ```
3. Зарегистрируйся на https://supabase.com, создай новый проект (бесплатно).
4. В Supabase зайди в **SQL Editor** → New query → вставь содержимое `supabase/schema.sql` → Run.
5. В Supabase зайди в **Project Settings → API** — скопируй `Project URL` и `anon public` ключ.
6. Скопируй `.env.example` в `.env` и вставь туда эти два значения:
   ```bash
   cp .env.example .env
   ```
7. Запусти:
   ```bash
   npm run dev
   ```
8. Открой адрес, который покажет терминал (обычно `http://localhost:5173`).

## Деплой на Vercel (бесплатно)

1. Залей папку проекта в репозиторий на GitHub.
2. Зайди на https://vercel.com → New Project → выбери репозиторий.
3. В настройках проекта на Vercel добавь те же переменные, что в `.env`:
   `VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY` (Settings → Environment Variables).
4. Deploy — Vercel сам соберёт и выложит сайт, даст адрес вида `твой-проект.vercel.app`.

## Важно

- Пароли пользователей сейчас хранятся как обычный текст в базе — нормально
  для пилота с малым числом студентов, но не для боевого продукта с
  чувствительными данными. Со временем стоит перейти на Supabase Auth
  или хотя бы хэшировать пароли (например, через `bcryptjs`) перед сохранением.
- Код преподавателя для регистрации задан в `App.jsx` — ищи `TEACHER_CODE`,
  смени на свой перед запуском.
- Таблица `kv_store` в Supabase сейчас открыта на чтение/запись всем, у кого
  есть anon-ключ (он и так публичный, попадает в собранный сайт). Это нормально
  для MVP, но не для хранения по-настоящему приватных данных — тогда нужны
  политики RLS по ролям, это отдельная задача на будущее.
