
create table reflections (
  id uuid primary key default gen_random_uuid(),
  guthiKey text not null,
  message text not null,
  createdAt timestamp with time zone default now(),
  mood text,
  tags text[]
);
