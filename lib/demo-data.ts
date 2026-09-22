import type { Lead, RoofMeasurements } from './types'

export const demoLeads: Lead[] = [
  { id: 'permit-1001', address: '1428 Oak Ridge Drive', city: 'Austin', state: 'TX', zip: '78704', permitType: 'Roof replacement', issuedAt: '2026-09-18', contactName: 'Jordan Miller', contactEmail: 'jordan.miller@example.test' },
  { id: 'permit-1002', address: '803 Willow Creek Lane', city: 'Austin', state: 'TX', zip: '78745', permitType: 'Re-roof', issuedAt: '2026-09-16', contactName: 'Taylor Brooks', contactEmail: 'taylor.brooks@example.test' },
  { id: 'permit-1003', address: '55 Meadow View Court', city: 'Round Rock', state: 'TX', zip: '78664', permitType: 'Roof repair', issuedAt: '2026-09-12', contactName: 'Casey Nguyen', contactEmail: 'casey.nguyen@example.test' },
]

export const demoMeasurements: RoofMeasurements = {
  totalAreaSqFt: 2480, ridgeFt: 86, hipFt: 42, valleyFt: 28, eaveFt: 164, rakeFt: 118,
  dominantPitch: '6/12', confidence: 0.94, warnings: [],
}
