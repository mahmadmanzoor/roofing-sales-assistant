import { Pool } from 'pg'
import type { Job } from './types'

const pool = process.env.DATABASE_URL ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined }) : null
let ready: Promise<void> | undefined

async function init() {
  if (!pool || ready) return ready
  ready = pool.query(`create table if not exists assistant_jobs (id text primary key, contractor_phone text, payload jsonb not null, updated_at timestamptz not null default now()); create table if not exists assistant_messages (id text primary key, created_at timestamptz not null default now())`).then(() => undefined)
  return ready
}

export async function loadJobs(): Promise<Job[]> {
  if (!pool) return []
  await init()
  const result = await pool.query<{ payload: Job }>('select payload from assistant_jobs order by updated_at desc')
  return result.rows.map((row) => row.payload)
}

export async function saveJob(job: Job, contractorPhone = '') {
  if (!pool) return
  await init()
  await pool.query('insert into assistant_jobs (id, contractor_phone, payload) values ($1, $2, $3) on conflict (id) do update set contractor_phone = excluded.contractor_phone, payload = excluded.payload, updated_at = now()', [job.id, contractorPhone, job])
}

export function persistenceEnabled() { return Boolean(pool) }

export async function claimMessage(id: string) {
  if (!pool) return true
  await init()
  const result = await pool.query('insert into assistant_messages (id) values ($1) on conflict do nothing returning id', [id])
  return result.rowCount === 1
}
