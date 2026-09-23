import { describe, expect, it } from 'vitest'
import { command } from '../lib/demo-store'

describe('golden mocked workflow', () => {
  it('moves from lead search to proposal delivery without external providers', async () => {
    const leads = await command({ command: 'latest leads' })
    expect(leads.leads).toHaveLength(4)
    await command({ command: 'qualify demo-1048', leadId: 'demo-1048' })
    const outreach = await command({ command: 'send outreach', scenario: 'interested' })
    expect(outreach.job?.emailStatus).toBe('replied')
    await command({ command: 'green light' })
    const waiting = await command({ command: 'upload report' })
    expect(waiting.job?.measurements).toBeUndefined()
    await command({ command: 'use demo report' })
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
