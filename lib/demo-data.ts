import type { Lead, RoofMeasurements } from './types'

export const demoLeads: Lead[] = [
  { id: 'demo-1048', address: '1048 Wild Prairie Drive', city: 'Iowa City', state: 'IA', zip: '52246', permitType: 'Roof replacement', issuedAt: '2026-09-23', contactName: 'Demo Homeowner', contactEmail: 'demo@example.test' },
  { id: 'permit-1001', address: '1428 Oak Ridge Drive', city: 'Austin', state: 'TX', zip: '78704', permitType: 'Roof replacement', issuedAt: '2026-09-18', contactName: 'Jordan Miller', contactEmail: 'jordan.miller@example.test' },
  { id: 'permit-1002', address: '803 Willow Creek Lane', city: 'Austin', state: 'TX', zip: '78745', permitType: 'Re-roof', issuedAt: '2026-09-16', contactName: 'Taylor Brooks', contactEmail: 'taylor.brooks@example.test' },
  { id: 'permit-1003', address: '55 Meadow View Court', city: 'Round Rock', state: 'TX', zip: '78664', permitType: 'Roof repair', issuedAt: '2026-09-12', contactName: 'Casey Nguyen', contactEmail: 'casey.nguyen@example.test' },
]

export const demoMeasurements: RoofMeasurements = {
  // EagleView demo report: 1048 Wild Prairie Drive, Iowa City, IA.
  totalAreaSqFt: 9572, ridgeFt: 230, hipFt: 228, valleyFt: 294, eaveFt: 423, rakeFt: 287,
  dominantPitch: '12/12', confidence: 0.99, warnings: ['Combined ridge and hip length reported as 458 ft.'],
}
