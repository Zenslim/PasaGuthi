```sql
-- Enable extensions (usually on by default in Supabase)
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;


-- Profiles table assumed to exist. If not, create a minimal one:
-- create table if not exists profiles (
-- id uuid primary key default auth.uid(),
-- name text,
-- thar text,
-- region text,
-- skills text[] default '{}',
-- avatar_url text,
-- created_at timestamp with time zone default now()
-- );


create table if not exists posts (
id uuid primary key default gen_random_uuid(),
author_id uuid references profiles(id) on delete set null,
title text not null,
slug text generated always as (
regexp_replace(lower(trim(title)), '[^a-z0-9]+', '-', 'g')
) stored,
excerpt text,
content jsonb not null, -- TipTap/Editor.js JSON
cover_image_url text,
tags text[] default '{}',
published boolean default false,
published_at timestamp with time zone,
created_at timestamp with time zone default now(),
updated_at timestamp with time zone default now()
);


create index if not exists posts_slug_idx on posts(slug);
create index if not exists posts_published_idx on posts(published, published_at desc);


-- Triggers to auto-update updated_at
create or replace function set_updated_at()
returns trigger as $$
begin
new.updated_at = now();
return new;
end;
$$ language plpgsql;


create trigger trg_posts_updated
before update on posts
for each row execute procedure set_updated_at();


-- RLS
alter table posts enable row level security;


-- Anyone can read published posts
create policy "read published"
on posts for select
using (published = true);


-- Authors can read their own drafts
create policy "author read own drafts"
```
