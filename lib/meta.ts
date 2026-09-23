export async function sendWhatsAppText(to: string, body: string) {
  const phoneNumberId = process.env.META_PHONE_NUMBER_ID
  const token = process.env.META_ACCESS_TOKEN
  if (!phoneNumberId || !token || process.env.DEMO_MODE !== '0') return { providerMessageId: `demo-wa-${Date.now()}`, status: 'simulated' as const }
  const response = await fetch(`https://graph.facebook.com/v22.0/${phoneNumberId}/messages`, { method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' }, body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body } }) })
  if (!response.ok) throw new Error(`Meta returned ${response.status}`)
  const data = await response.json()
  return { providerMessageId: data.messages?.[0]?.id ?? 'unknown', status: 'sent' as const }
}

export type WhatsAppInteractive = { type: 'interactive'; interactive: { type: 'button' | 'list'; body: { text: string }; action: { buttons?: Array<{ type: 'reply'; reply: { id: string; title: string } }>; button?: string; sections?: Array<{ title: string; rows: Array<{ id: string; title: string; description?: string }> }> } } }

export async function sendWhatsAppInteractive(to: string, interactive: WhatsAppInteractive) {
  const phoneNumberId = process.env.META_PHONE_NUMBER_ID; const token = process.env.META_ACCESS_TOKEN
  if (!phoneNumberId || !token || process.env.DEMO_MODE !== '0') return { providerMessageId: `demo-wa-${Date.now()}`, status: 'simulated' as const }
  const response = await fetch(`https://graph.facebook.com/v22.0/${phoneNumberId}/messages`, { method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' }, body: JSON.stringify({ messaging_product: 'whatsapp', to, ...interactive }) })
  if (!response.ok) throw new Error(`Meta returned ${response.status}`)
  const data = await response.json(); return { providerMessageId: data.messages?.[0]?.id ?? 'unknown', status: 'sent' as const }
}

export async function downloadWhatsAppMedia(mediaId: string) {
  const token = process.env.META_ACCESS_TOKEN
  if (!token) throw new Error('META_ACCESS_TOKEN is required to download WhatsApp reports')
  const metadata = await fetch(`https://graph.facebook.com/v22.0/${mediaId}`, { headers: { authorization: `Bearer ${token}` } })
  if (!metadata.ok) throw new Error(`Meta media metadata returned ${metadata.status}`)
  const { url } = await metadata.json() as { url?: string }
  if (!url) throw new Error('Meta did not return a media URL')
  const file = await fetch(url, { headers: { authorization: `Bearer ${token}` } })
  if (!file.ok) throw new Error(`Meta media download returned ${file.status}`)
  return Buffer.from(await file.arrayBuffer())
}
