import { getJobByDocumentId } from '@/lib/demo-store'
import { createPricedTakeoffPdf } from '@/lib/takeoff-pdf'
export async function GET(_r: Request, c: { params: Promise<{ id: string }> }) { const job = await getJobByDocumentId((await c.params).id); if (!job) return new Response('Not found', { status: 404 }); return new Response(Buffer.from(await createPricedTakeoffPdf(job)), { headers: { 'content-type': 'application/pdf', 'content-disposition': 'inline; filename="priced-takeoff.pdf"' } }) }
