create table if not exists assistant_contexts (
  contractor_phone text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);
