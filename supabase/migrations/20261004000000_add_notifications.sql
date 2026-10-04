create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  title text not null,
  message text not null,
  type text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.notifications enable row level security;

create policy "Users can view their own notifications"
  on public.notifications for select
  using ( auth.uid() = user_id );

create policy "Users can update their own notifications"
  on public.notifications for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own notifications"
  on public.notifications for delete
  using ( auth.uid() = user_id );
