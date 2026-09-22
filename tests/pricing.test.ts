import { describe, expect, it } from 'vitest'
import { calculateTakeoff } from '../lib/pricing'
import { demoMeasurements } from '../lib/demo-data'

describe('deterministic takeoff', () => {
  it('returns repeatable cents-based totals', () => {
    const first = calculateTakeoff(demoMeasurements)
    const second = calculateTakeoff(demoMeasurements)
    expect(first).toEqual(second)
    expect(first.lines[0].quantity).toBe(106)
    expect(first.totalCents).toBe(3776384)
  })
})
