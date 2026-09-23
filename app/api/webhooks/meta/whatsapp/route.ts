import { createHmac, timingSafeEqual } from 'node:crypto'
import { handleChat } from '@/lib/chat-orchestrator'
import { downloadWhatsAppMedia, sendWhatsAppInteractive } from '@/lib/meta'
import { formatReply } from '@/lib/whatsapp-reply'
import { claimMessage } from '@/lib/persistence'

type IncomingMessage = { id?: string; from?: string; type?: string; text?: { body: string }; document?: { id: string }; interactive?: { button_reply?: { id: string }; list_reply?: { id: string } } }
type IncomingPayload = { entry?: Array<{ changes?: Array<{ value?: { messages?: IncomingMessage[] } }> }> }

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
  let payload: IncomingPayload
  try { payload = JSON.parse(raw) } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const message = payload.entry?.[0]?.changes?.[0]?.value?.messages?.[0]
  if (!message?.id || !(await claimMessage(message.id))) return Response.json({ received: true, duplicate: true })
  const from = message.from
  try {
    let result
    if (message.type === 'text' && message.text && from) result = await handleChat({ text: message.text.body, from })
    else if (message.type === 'interactive') {
      const actionId = message.interactive?.button_reply?.id ?? message.interactive?.list_reply?.id
      if (actionId && from) result = await handleChat({ actionId, from })
    }
    else if (message.type === 'document' && message.document && from) result = await handleChat({ from, mediaId: message.document.id, report: await downloadWhatsAppMedia(message.document.id) })
    else result = { message: 'Please use the buttons or ask for latest leads.' }
    if (result && from) {
      try {
        await sendWhatsAppInteractive(from, formatReply(result ?? { message: 'I could not understand that action.' }))
      } catch (sendError) {
        console.error('WhatsApp reply failed', sendError)
      }
    }
  } catch (error) {
    if (from) {
      try {
        await sendWhatsAppInteractive(from, { type: 'interactive', interactive: { type: 'button', body: { text: error instanceof Error ? error.message : 'I could not complete that request.' }, action: { buttons: [{ type: 'reply', reply: { id: 'latest-leads', title: 'New leads' } }] } } })
      } catch (sendError) {
        console.error('WhatsApp error reply failed', sendError)
      }
    }
  }
  return Response.json({ received: true })
}


function validSignature(body: string, provided: string, secret: string) {
  const expected = `sha256=${createHmac('sha256', secret).update(body).digest('hex')}`
  return provided.length === expected.length && timingSafeEqual(Buffer.from(provided), Buffer.from(expected))
}
