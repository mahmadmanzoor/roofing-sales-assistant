import type { RoofMeasurements, Takeoff, TakeoffLine } from './types'

const priceBook = { version: 'demo-2026-09', shingle: 42_00, starter: 68_00, ridge: 92_00, underlayment: 58_00, iceWater: 115_00, dripEdge: 18_00, flashing: 125_00, fasteners: 35_00, labor: 185_00 }

const line = (name: string, quantity: number, unit: string, unitPriceCents: number, formula: string, waste = 0): TakeoffLine => ({ name, quantity, unit, unitPriceCents, amountCents: Math.round(quantity * unitPriceCents), formula, waste })

export function calculateTakeoff(m: RoofMeasurements): Takeoff {
  const squares = Math.ceil((m.totalAreaSqFt * 1.1) / 100)
  const lines = [
    line('Architectural shingles', squares, 'square', priceBook.shingle, 'ceil(area × 1.10 / 100)', 0.1),
    line('Starter strip', Math.ceil(m.eaveFt / 100), 'bundle', priceBook.starter, 'ceil(eave / 100)'),
    line('Ridge / hip cap', Math.ceil((m.ridgeFt + m.hipFt) / 25), 'bundle', priceBook.ridge, 'ceil((ridge + hip) / 25)'),
    line('Synthetic underlayment', Math.ceil(m.totalAreaSqFt / 1000), 'roll', priceBook.underlayment, 'ceil(area / 1000)'),
    line('Ice & water barrier', Math.ceil((m.eaveFt + m.valleyFt * 2) / 75), 'roll', priceBook.iceWater, 'ceil((eave + valley × 2) / 75)'),
    line('Drip edge', Math.ceil((m.eaveFt + m.rakeFt) / 10), 'piece', priceBook.dripEdge, 'ceil((eave + rake) / 10)'),
    line('Step / wall flashing', Math.max(1, Math.ceil(m.valleyFt / 30)), 'set', priceBook.flashing, 'max(1, ceil(valley / 30))'),
    line('Roofing fasteners', Math.max(1, Math.ceil(m.totalAreaSqFt / 1200)), 'box', priceBook.fasteners, 'max(1, ceil(area / 1200))'),
    line('Installation labor', squares, 'square', priceBook.labor, 'squares'),
  ]
  const subtotalCents = lines.reduce((sum, item) => sum + item.amountCents, 0)
  const markupCents = Math.round(subtotalCents * 0.12)
  const taxCents = Math.round((subtotalCents + markupCents) * 0.0825)
  return { lines, subtotalCents, markupCents, taxCents, totalCents: subtotalCents + markupCents + taxCents, priceBookVersion: priceBook.version }
}

export const formatMoney = (cents: number) => `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
