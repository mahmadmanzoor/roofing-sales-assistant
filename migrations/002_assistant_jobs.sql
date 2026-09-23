create table if not exists assistant_jobs (
  id text primary key,
  contractor_phone text,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);
create table if not exists assistant_messages (id text primary key, created_at timestamptz not null default now());
