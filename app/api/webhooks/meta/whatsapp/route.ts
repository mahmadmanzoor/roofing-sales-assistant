import { createHmac, timingSafeEqual } from 'node:crypto'
import { command } from '@/lib/demo-store'
import { downloadWhatsAppMedia, sendWhatsAppText } from '@/lib/meta'
import { claimMessage } from '@/lib/persistence'

export async function GET(request: Request) {
  const url = new URL(request.url)
  if (url.searchParams.get('hub.verify_token') !== process.env.META_WEBHOOK_VERIFY_TOKEN) return new Response('Forbidden', { status: 403 })
  return new Response(url.searchParams.get('hub.challenge') ?? '', { status: 200 })
}

export async function POST(request: Request) {
  const raw = await request.text()
  const signature = request.headers.get('x-hub-signature-256')
  const secret = process.env.META_APP_SECRET
  if (secret && (!signature || !validSignature(raw, signature, secret))) return new Response('Invalid signature', { status: 401 })
  const payload = JSON.parse(raw)
  const message = payload.entry?.[0]?.changes?.[0]?.value?.messages?.[0]
  if (!message?.id || !(await claimMessage(message.id))) return Response.json({ received: true, duplicate: true })
  const from = message.from
  try {
    let result
    if (message.type === 'text') result = await command({ command: message.text.body, from })
    else if (message.type === 'document') result = await command({ command: 'upload report', from, mediaId: message.document.id, report: await downloadWhatsAppMedia(message.document.id) })
    if (result && from) {
      try {
        await sendWhatsAppText(from, formatReply(result))
      } catch (sendError) {
        console.error('WhatsApp reply failed', sendError)
      }
    }
  } catch (error) {
    if (from) {
      try {
        await sendWhatsAppText(from, error instanceof Error ? error.message : 'I could not complete that request.')
      } catch (sendError) {
        console.error('WhatsApp error reply failed', sendError)
      }
    }
  }
  return Response.json({ received: true })
}

function formatReply(result: { message?: string; leads?: Array<{ address: string; city: string; state: string; zip: string; id: string }>; job?: { proposalId?: string } }) {
  if (result.leads) return `${result.message ?? ''}\n${result.leads.slice(0, 10).map((lead, index) => `${index + 1}. ${lead.address}, ${lead.city}, ${lead.state} ${lead.zip}\n   ${lead.id}`).join('\n')}`
  if (result.job?.proposalId) return `${result.message}\nProposal: ${process.env.PUBLIC_APP_URL ?? ''}/api/proposals/${result.job.proposalId}`
  return result.message ?? 'Done.'
}

function validSignature(body: string, provided: string, secret: string) {
  const expected = `sha256=${createHmac('sha256', secret).update(body).digest('hex')}`
  return provided.length === expected.length && timingSafeEqual(Buffer.from(provided), Buffer.from(expected))
}
