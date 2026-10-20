-- Migration: 20261019000000_push_notifications.sql
-- Description: Push notification tokens, notification metadata, RLS, and realtime publication

-- 1. Create table for device push tokens
create table if not exists public.user_push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  expo_push_token text not null,
  device_name text,
  device_platform text, -- 'android' | 'ios' | 'web'
  is_active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint user_push_tokens_user_token_unique unique(user_id, expo_push_token)
);

-- Index foreign keys and lookup queries (Supabase performance best practices)
create index if not exists idx_user_push_tokens_user_id_active on public.user_push_tokens(user_id, is_active);
create index if not exists idx_user_push_tokens_token on public.user_push_tokens(expo_push_token);

-- Enable RLS
alter table public.user_push_tokens enable row level security;

-- Policies for user_push_tokens
create policy "Users can view their own push tokens"
  on public.user_push_tokens for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own push tokens"
  on public.user_push_tokens for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own push tokens"
  on public.user_push_tokens for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own push tokens"
  on public.user_push_tokens for delete
  using ( auth.uid() = user_id );

-- 2. Enhance existing notifications table with category and data payload
alter table public.notifications
  add column if not exists category text default 'system',
  add column if not exists data jsonb default '{}'::jsonb;

-- Index notifications query patterns
create index if not exists idx_notifications_user_read_created 
  on public.notifications(user_id, is_read, created_at desc);

create index if not exists idx_notifications_user_created 
  on public.notifications(user_id, created_at desc);

-- 3. Ensure realtime publication includes notifications
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end $$;
