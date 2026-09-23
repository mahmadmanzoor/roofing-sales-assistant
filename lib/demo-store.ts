import { demoLeads, demoMeasurements } from './demo-data'
import { calculateTakeoff } from './pricing'
import { sendDemoEmail, type ReplyScenario } from './email-simulator'
import { getLatestLeads } from './permit-atlas-client'
import { loadJobs, saveJob } from './persistence'
import { extractMeasurements } from './openai-extractor'
import type { Job, RoofMeasurements } from './types'

const jobs = new Map<string, Job>()
let availableLeads = demoLeads
let hydrated = false

async function hydrate() {
  if (hydrated) return
  hydrated = true
  for (const job of await loadJobs()) jobs.set(job.id, job)
}

export async function getState() { await hydrate(); return { leads: process.env.DEMO_MODE === '0' ? await getLatestLeads('Austin') : demoLeads, jobs: [...jobs.values()] } }
export async function getJob(id: string) { await hydrate(); return jobs.get(id) }

export async function command(input: { command: string; leadId?: string; scenario?: ReplyScenario; measurements?: RoofMeasurements; from?: string; mediaId?: string; report?: Uint8Array }) {
  await hydrate()
  const rawText = input.command.trim()
  const text = rawText.toLowerCase()
  if (text.includes('lead')) {
    const leads = process.env.DEMO_MODE === '0' ? await getLatestLeads(rawText.match(/(?:near|in)\s+(.+)$/i)?.[1] ?? 'Austin') : demoLeads
    availableLeads = leads
    return { message: 'Latest roofing leads near Austin:', leads }
  }
  if (text.startsWith('qualify') || text.startsWith('select')) {
    const lead = findLead(input.leadId ?? text.match(/(?:permit-)?\d+/)?.[0])
    if (!lead) throw new Error('Select a valid lead first.')
    const job: Job = { id: `job-${lead.id}`, lead, stage: 'outreach', emailStatus: 'draft', messages: [`Lead qualified: ${lead.address}`] }
    jobs.set(job.id, job); await saveJob(job, input.from)
    return { message: `Qualified ${lead.address}. Outreach draft is ready.`, job }
  }
  const job = [...jobs.values()][0]
  if (!job) throw new Error('Ask for latest leads first.')
  if (text.includes('send') || text.includes('approve outreach')) {
    const email = await sendDemoEmail({ to: job.lead.contactEmail, subject: 'Roofing project estimate', body: `Hello ${job.lead.contactName}, we can help with your roofing project.`, scenario: input.scenario })
    job.emailStatus = 'replied'; job.homeownerReply = email.reply; job.messages.push(`Email sent and homeowner replied: ${email.reply}`); await saveJob(job, input.from)
    return { message: `Outreach sent. Homeowner replied: “${email.reply}”`, job }
  }
  if (text.includes('green')) { job.stage = 'report'; job.messages.push('Homeowner gave a green light. Choose a report source.'); await saveJob(job, input.from); return { message: 'Green light recorded. Choose upload, homeowner, or EagleView.', job } }
  if (text.includes('eagle')) { job.reportSource = 'eagleview'; job.stage = 'report'; job.messages.push('EagleView portal handoff prepared.'); await saveJob(job, input.from); return { message: `Open EagleView and search: ${job.lead.address}, ${job.lead.city}, ${job.lead.state} ${job.lead.zip}`, eagleViewUrl: 'https://www.eagleview.com/login', job } }
  if (text.includes('upload') || text.includes('homeowner') || input.mediaId) { job.reportSource = text.includes('homeowner') ? 'homeowner' : 'upload'; job.stage = 'measurements'; job.messages.push(input.mediaId ? `Roof report received from WhatsApp media ${input.mediaId}.` : 'Roof report received.'); return extract(job, input.measurements, input.from, input.report) }
  if (text.includes('measure') || text.includes('approve measurement')) { return extract(job, input.measurements, input.from) }
  if (text.includes('takeoff') || text.includes('price')) { if (!job.measurements) throw new Error('Approve measurements first.'); job.takeoff = calculateTakeoff(job.measurements); job.stage = 'proposal'; job.messages.push(`Takeoff priced at ${job.takeoff.totalCents} cents.`); await saveJob(job, input.from); return { message: 'Deterministic takeoff and demo pricing are ready for proposal approval.', job } }
  if (text.includes('proposal')) { if (!job.takeoff) throw new Error('Calculate takeoff first.'); job.stage = 'sent'; job.proposalId = `proposal-${job.id}`; job.messages.push('Proposal PDF generated and simulated email delivered.'); await saveJob(job, input.from); return { message: 'Proposal generated and delivered to the homeowner (demo simulator).', job } }
  return { message: 'Try: latest leads, qualify permit-1001, send outreach, green light, upload report, approve measurements, calculate takeoff, generate proposal.' }
}

function findLead(id?: string) { return availableLeads.find((lead) => lead.id === id || lead.id === `permit-${id}`) }
async function extract(job: Job, measurements = demoMeasurements, from?: string, report?: Uint8Array) { const extracted = report ? await extractMeasurements(report) : { measurements, source: 'fixture' as const }; job.measurements = extracted.measurements; job.stage = 'measurements'; job.messages.push(`Measurements extracted from ${extracted.source} with ${Math.round(extracted.measurements.confidence * 100)}% confidence.`); await saveJob(job, from); return { message: 'Measurements extracted. Review and approve them, then calculate the takeoff.', job } }
