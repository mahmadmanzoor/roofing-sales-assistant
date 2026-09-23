export type Lead = {
  id: string
  address: string
  city: string
  state: string
  zip: string
  permitType: string
  issuedAt: string
  contactName: string
  contactEmail: string
}

export type RoofMeasurements = {
  totalAreaSqFt: number
  ridgeFt: number
  hipFt: number
  valleyFt: number
  eaveFt: number
  rakeFt: number
  dominantPitch: string | null
  confidence: number
  warnings: string[]
}

export type JobStage = 'lead' | 'outreach' | 'green-light' | 'report' | 'measurements' | 'takeoff' | 'proposal' | 'sent'

export type Job = {
  id: string
  documentId: string
  contractorPhone?: string
  lead: Lead
  stage: JobStage
  reportSource?: 'homeowner' | 'upload' | 'eagleview'
  measurements?: RoofMeasurements
  takeoff?: Takeoff
  proposalId?: string
  emailStatus?: 'draft' | 'pending_confirmation' | 'sent' | 'delivered' | 'replied'
  priceSource?: 'saved' | 'demo' | 'distributor'
  pendingEmail?: { purpose: 'outreach' | 'distributor' | 'proposal'; to: string; subject: string; body: string; attachmentUrl?: string }
  distributor?: { name: string; email: string }
  homeownerReply?: string
  messages: string[]
}

export type TakeoffLine = {
  name: string
  quantity: number
  unit: string
  unitPriceCents: number
  amountCents: number
  formula: string
  waste: number
}

export type Takeoff = {
  lines: TakeoffLine[]
  subtotalCents: number
  markupCents: number
  taxCents: number
  totalCents: number
  priceBookVersion: string
}
