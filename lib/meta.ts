export async function sendWhatsAppText(to: string, body: string) {
  const phoneNumberId = process.env.META_PHONE_NUMBER_ID
  const token = process.env.META_ACCESS_TOKEN
  if (!phoneNumberId || !token || process.env.DEMO_MODE !== '0') return { providerMessageId: `demo-wa-${Date.now()}`, status: 'simulated' as const }
  const response = await fetch(`https://graph.facebook.com/v22.0/${phoneNumberId}/messages`, { method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' }, body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body } }) })
  if (!response.ok) throw new Error(`Meta returned ${response.status}`)
  const data = await response.json()
  return { providerMessageId: data.messages?.[0]?.id ?? 'unknown', status: 'sent' as const }
}
