import { demoLeads, demoMeasurements } from './demo-data'
import { calculateTakeoff } from './pricing'
import { sendDemoEmail, type ReplyScenario } from './email-simulator'
import type { Job, Lead, RoofMeasurements } from './types'

const jobs = new Map<string, Job>()

export function getState() { return { leads: demoLeads, jobs: [...jobs.values()] } }
export function getJob(id: string) { return jobs.get(id) }

export async function command(input: { command: string; leadId?: string; scenario?: ReplyScenario; measurements?: RoofMeasurements }) {
  const text = input.command.trim().toLowerCase()
  if (text.includes('lead')) return { message: 'Latest roofing leads near Austin:', leads: demoLeads }
  if (text.startsWith('qualify') || text.startsWith('select')) {
    const lead = findLead(input.leadId ?? text.match(/permit-\d+/)?.[0])
    if (!lead) throw new Error('Select a valid lead first.')
    const job: Job = { id: `job-${lead.id}`, lead, stage: 'outreach', emailStatus: 'draft', messages: [`Lead qualified: ${lead.address}`] }
    jobs.set(job.id, job)
    return { message: `Qualified ${lead.address}. Outreach draft is ready.`, job }
  }
  const job = [...jobs.values()][0]
  if (!job) throw new Error('Ask for latest leads first.')
  if (text.includes('send') || text.includes('approve outreach')) {
    const email = await sendDemoEmail({ to: job.lead.contactEmail, subject: 'Roofing project estimate', body: `Hello ${job.lead.contactName}, we can help with your roofing project.`, scenario: input.scenario })
    job.emailStatus = 'replied'; job.homeownerReply = email.reply; job.messages.push(`Email sent and homeowner replied: ${email.reply}`)
    return { message: `Outreach sent. Homeowner replied: “${email.reply}”`, job }
  }
  if (text.includes('green')) { job.stage = 'report'; job.messages.push('Homeowner gave a green light. Choose a report source.'); return { message: 'Green light recorded. Choose upload, homeowner, or EagleView.', job } }
  if (text.includes('eagle')) { job.reportSource = 'eagleview'; job.stage = 'report'; job.messages.push('EagleView portal handoff prepared.'); return { message: `Open EagleView and search: ${job.lead.address}, ${job.lead.city}, ${job.lead.state} ${job.lead.zip}`, eagleViewUrl: 'https://www.eagleview.com/login', job } }
  if (text.includes('upload') || text.includes('homeowner')) { job.reportSource = text.includes('homeowner') ? 'homeowner' : 'upload'; job.stage = 'measurements'; job.messages.push('Roof report received.'); return extract(job, input.measurements) }
  if (text.includes('measure') || text.includes('approve measurement')) { return extract(job, input.measurements) }
  if (text.includes('takeoff') || text.includes('price')) { if (!job.measurements) throw new Error('Approve measurements first.'); job.takeoff = calculateTakeoff(job.measurements); job.stage = 'proposal'; job.messages.push(`Takeoff priced at ${job.takeoff.totalCents} cents.`); return { message: 'Deterministic takeoff and demo pricing are ready for proposal approval.', job } }
  if (text.includes('proposal')) { if (!job.takeoff) throw new Error('Calculate takeoff first.'); job.stage = 'sent'; job.proposalId = `proposal-${job.id}`; job.messages.push('Proposal PDF generated and simulated email delivered.'); return { message: 'Proposal generated and delivered to the homeowner (demo simulator).', job } }
  return { message: 'Try: latest leads, qualify permit-1001, send outreach, green light, upload report, approve measurements, calculate takeoff, generate proposal.' }
}

function findLead(id?: string) { return demoLeads.find((lead) => lead.id === id) }
function extract(job: Job, measurements = demoMeasurements) { job.measurements = measurements; job.stage = 'measurements'; job.messages.push(`Measurements extracted from ${job.reportSource ?? 'fixture'} with ${Math.round(measurements.confidence * 100)}% confidence.`); return { message: 'Measurements extracted. Review and approve them, then calculate the takeoff.', job } }
