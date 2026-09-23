import { getJob } from '@/lib/demo-store'
import { createTakeoffPdf } from '@/lib/takeoff-pdf'

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params; const job = (await getJob(id.replace(/^takeoff-/, ''))) ?? (await getJob(id))
  if (!job) return Response.json({ error: 'Takeoff not found' }, { status: 404 })
  const pdf = await createTakeoffPdf(job)
  return new Response(Buffer.from(pdf), { headers: { 'content-type': 'application/pdf', 'content-disposition': `inline; filename="${job.id}-takeoff.pdf"` } })
}
