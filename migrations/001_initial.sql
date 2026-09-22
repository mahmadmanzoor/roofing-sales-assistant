create extension if not exists pgcrypto;

create table if not exists organizations (id uuid primary key default gen_random_uuid(), name text not null, created_at timestamptz not null default now());
create table if not exists contractors (id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id), whatsapp_number text not null unique, created_at timestamptz not null default now());
create table if not exists lead_snapshots (id uuid primary key default gen_random_uuid(), contractor_id uuid not null references contractors(id), external_lead_id text not null, payload jsonb not null, created_at timestamptz not null default now());
create table if not exists jobs (id uuid primary key default gen_random_uuid(), contractor_id uuid not null references contractors(id), lead_snapshot_id uuid not null references lead_snapshots(id), stage text not null, report_source text, measurements jsonb, takeoff jsonb, proposal_version integer not null default 1, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists communications (id uuid primary key default gen_random_uuid(), job_id uuid references jobs(id), direction text not null, channel text not null, provider text not null, provider_message_id text, payload jsonb not null, created_at timestamptz not null default now());
create table if not exists outbox (id uuid primary key default gen_random_uuid(), topic text not null, payload jsonb not null, attempts integer not null default 0, available_at timestamptz not null default now(), processed_at timestamptz);
create unique index if not exists lead_snapshots_dedupe on lead_snapshots(contractor_id, external_lead_id);
