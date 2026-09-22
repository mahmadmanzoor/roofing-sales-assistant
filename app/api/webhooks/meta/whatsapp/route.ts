import { createHmac, timingSafeEqual } from 'node:crypto'
import { command } from '@/lib/demo-store'

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
  if (message?.type === 'text') await command({ command: message.text.body })
  return Response.json({ received: true })
}

function validSignature(body: string, provided: string, secret: string) {
  const expected = `sha256=${createHmac('sha256', secret).update(body).digest('hex')}`
  return provided.length === expected.length && timingSafeEqual(Buffer.from(provided), Buffer.from(expected))
}
