import { getJob } from '@/lib/demo-store'
import { createProposalPdf } from '@/lib/proposal-pdf'

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const job = getJob(id.replace(/^proposal-/, '')) ?? getJob(id)
  if (!job) return Response.json({ error: 'Proposal not found' }, { status: 404 })
  const pdf = await createProposalPdf(job)
  return new Response(Buffer.from(pdf), { headers: { 'content-type': 'application/pdf', 'content-disposition': `inline; filename="${job.id}-proposal.pdf"` } })
}
