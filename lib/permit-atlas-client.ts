import { demoLeads } from './demo-data'
import type { Lead } from './types'

export async function getLatestLeads(location: string): Promise<Lead[]> {
  const base = process.env.PERMIT_ATLAS_API_URL
  if (!base || !process.env.PERMIT_ATLAS_API_KEY) return demoLeads.filter((lead) => lead.city.toLowerCase() === location.toLowerCase() || location.toLowerCase() === 'austin')
  const response = await fetch(`${base}/api/v1/leads?city=${encodeURIComponent(location)}&trade=Roofing&sort=newest`, { headers: { authorization: `Bearer ${process.env.PERMIT_ATLAS_API_KEY}` } })
  if (!response.ok) throw new Error(`Permit Atlas returned ${response.status}`)
  const data = await response.json()
  return data.items.map((lead: { id: string | number; address: { line1: string; city: string; state: string; postalCode: string }; permit: { description?: string; signalDate: string }; classification: { trade: string }; owner?: { name?: string }; contacts?: { suppressed?: boolean; email?: string } }) => ({
    id: String(lead.id),
    address: lead.address.line1,
    city: lead.address.city,
    state: lead.address.state,
    zip: lead.address.postalCode,
    permitType: lead.permit.description || lead.classification.trade,
    issuedAt: lead.permit.signalDate,
    contactName: lead.owner?.name || '',
    contactEmail: lead.contacts?.suppressed ? '' : (lead.contacts?.email || ''),
  }))
}
