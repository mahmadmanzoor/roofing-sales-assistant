import { Pool } from 'pg'
import type { Job } from './types'

export type AssistantContext = { displayedLeads: Job['lead'][]; displayedActions: Array<{ id: string; title: string }>; menuUpdatedAt: number; activeJobId?: string; history: Array<{ role: 'user' | 'assistant'; text: string }> }
const memoryContexts = new Map<string, AssistantContext>()

const pool = process.env.DATABASE_URL ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined }) : null
let ready: Promise<void> | undefined

async function init() {
  if (!pool || ready) return ready
  ready = pool.query(`create table if not exists assistant_jobs (id text primary key, contractor_phone text, payload jsonb not null, updated_at timestamptz not null default now()); create table if not exists assistant_messages (id text primary key, created_at timestamptz not null default now()); create table if not exists assistant_contexts (contractor_phone text primary key, payload jsonb not null, updated_at timestamptz not null default now())`).then(() => undefined)
  return ready
}

export async function loadJobs(): Promise<Job[]> {
  if (!pool) return []
  await init()
  const result = await pool.query<{ payload: Job; contractor_phone: string | null }>('select payload, contractor_phone from assistant_jobs order by updated_at desc')
  return result.rows.map((row) => ({ ...row.payload, contractorPhone: row.payload.contractorPhone ?? row.contractor_phone ?? undefined }))
}

export async function saveJob(job: Job, contractorPhone = '') {
  if (!pool) return
  await init()
  const payload = { ...job, contractorPhone: contractorPhone || job.contractorPhone }
  await pool.query('insert into assistant_jobs (id, contractor_phone, payload) values ($1, $2, $3) on conflict (id) do update set contractor_phone = excluded.contractor_phone, payload = excluded.payload, updated_at = now()', [job.id, contractorPhone || job.contractorPhone || '', payload])
}

export function persistenceEnabled() { return Boolean(pool) }

export async function claimMessage(id: string) {
  if (!pool) return true
  await init()
  const result = await pool.query('insert into assistant_messages (id) values ($1) on conflict do nothing returning id', [id])
  return result.rowCount === 1
}

export async function loadContext(phone: string): Promise<AssistantContext | undefined> {
  if (!pool) return memoryContexts.get(phone)
  await init()
  const result = await pool.query<{ payload: AssistantContext }>('select payload from assistant_contexts where contractor_phone = $1', [phone])
  return result.rows[0]?.payload
}
export async function saveContext(phone: string, context: AssistantContext) {
  const bounded = { ...context, displayedLeads: context.displayedLeads.slice(0, 10), displayedActions: context.displayedActions.slice(0, 3), history: context.history.slice(-12) }
  if (!pool) { memoryContexts.set(phone, bounded); return }
  await init()
  await pool.query('insert into assistant_contexts (contractor_phone, payload) values ($1, $2) on conflict (contractor_phone) do update set payload = excluded.payload, updated_at = now()', [phone, bounded])
}
