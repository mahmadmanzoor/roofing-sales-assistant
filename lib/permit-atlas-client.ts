import { demoLeads } from './demo-data'
import type { Lead } from './types'

export async function getLatestLeads(location: string): Promise<Lead[]> {
  const base = process.env.PERMIT_ATLAS_API_URL
  if (!base || !process.env.PERMIT_ATLAS_API_KEY) return demoLeads.filter((lead) => lead.city.toLowerCase() === location.toLowerCase() || location.toLowerCase() === 'austin')
  const response = await fetch(`${base}/api/v1/leads?location=${encodeURIComponent(location)}`, { headers: { authorization: `Bearer ${process.env.PERMIT_ATLAS_API_KEY}` } })
  if (!response.ok) throw new Error(`Permit Atlas returned ${response.status}`)
  const data = await response.json()
  return data.data
}
