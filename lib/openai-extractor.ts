import { demoMeasurements } from './demo-data'
import type { RoofMeasurements } from './types'

export async function extractMeasurements(report: Uint8Array | Buffer): Promise<{ measurements: RoofMeasurements; source: 'openai' | 'fixture' }> {
  void report
  // ponytail: fixture fallback keeps the demo deterministic; add the Responses API call when a billed key is explicitly enabled.
  if (!process.env.OPENAI_API_KEY || process.env.DEMO_MODE !== '0') return { measurements: demoMeasurements, source: 'fixture' }
  throw new Error('Live OpenAI extraction adapter is intentionally disabled until provider billing is approved.')
}
