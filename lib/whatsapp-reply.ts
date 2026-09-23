import type { WhatsAppInteractive } from './meta'

export function formatReply(result: { message?: string; leads?: Array<{ address: string; city: string; state: string; zip: string; id: string }>; actions?: Array<{ id: string; title: string }>; eagleViewUrl?: string }): WhatsAppInteractive {
  if (result.leads?.length) return { type: 'interactive', interactive: { type: 'list', body: { text: `${result.message ?? ''}\nReply with a number (1-${Math.min(result.leads.length, 10)}) or choose a lead.`.slice(0, 1024) }, action: { button: 'Choose lead', sections: [{ title: 'Roofing leads', rows: result.leads.slice(0, 10).map((lead, index) => ({ id: `lead:${lead.id}:select`, title: `${index + 1}. ${lead.address}, ${lead.city}`.slice(0, 24), description: `${lead.address}, ${lead.city}, ${lead.state} ${lead.zip}`.slice(0, 72) })) }] } } }
  const buttons = (result.actions ?? []).slice(0, 3).map((item) => ({ type: 'reply' as const, reply: { id: item.id, title: item.title.slice(0, 20) } }))
  if (!buttons.length) buttons.push({ type: 'reply', reply: { id: 'latest-leads', title: 'New leads' } })
  return { type: 'interactive', interactive: { type: 'button', body: { text: `${result.message ?? 'Done.'}${result.eagleViewUrl ? `\n${result.eagleViewUrl}` : ''}`.slice(0, 1024) }, action: { buttons } } }
}
