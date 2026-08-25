-- Add last_seen_at and is_online columns to public.profiles for live user presence tracking
alter table public.profiles
  add column if not exists last_seen_at timestamptz default now(),
  add column if not exists is_online boolean default false;
