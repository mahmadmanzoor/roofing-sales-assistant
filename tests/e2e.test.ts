import { describe, expect, it } from 'vitest'
import { command } from '../lib/demo-store'

describe('golden mocked workflow', () => {
  it('moves from lead search to proposal delivery without external providers', async () => {
    const leads = await command({ command: 'latest leads' })
    expect(leads.leads).toHaveLength(3)
    await command({ command: 'qualify permit-1001', leadId: 'permit-1001' })
    const outreach = await command({ command: 'send outreach', scenario: 'interested' })
    expect(outreach.job?.emailStatus).toBe('replied')
    await command({ command: 'green light' })
    await command({ command: 'upload report' })
    const measurements = await command({ command: 'approve measurements' })
    expect(measurements.job?.measurements?.confidence).toBeGreaterThan(0.9)
    expect(measurements.job?.measurements?.totalAreaSqFt).toBe(9572)
    expect(measurements.job?.measurements?.dominantPitch).toBe('12/12')
    const takeoff = await command({ command: 'calculate takeoff' })
    expect(takeoff.job?.takeoff?.totalCents).toBeGreaterThan(0)
    const proposal = await command({ command: 'generate proposal' })
    expect(proposal.job?.stage).toBe('sent')
  })
})
