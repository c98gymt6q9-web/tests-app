-- Выполни этот файл в Supabase: Project -> SQL Editor -> New query -> вставь и запусти.

create table if not exists kv_store (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

-- Включаем Row Level Security и разрешаем чтение/запись всем,
-- у кого есть anon-ключ (он и так публичный, "спрятан" только в .env
-- на этапе разработки). Для учебного MVP этого достаточно.
-- ВАЖНО: это значит, что теоретически любой человек с твоим anon-ключом
-- может прочитать и изменить данные напрямую через Supabase API,
-- в обход интерфейса сайта. Для реальных приватных данных позже
-- стоит сделать политики RLS по ролям пользователей.
alter table kv_store enable row level security;

create policy "public read" on kv_store
  for select using (true);

create policy "public write" on kv_store
  for insert with check (true);

create policy "public update" on kv_store
  for update using (true);
