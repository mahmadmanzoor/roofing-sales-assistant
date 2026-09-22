import { demoMeasurements } from './demo-data'
import type { RoofMeasurements } from './types'

export async function extractMeasurements(report: Uint8Array | Buffer): Promise<{ measurements: RoofMeasurements; source: 'openai' | 'fixture' }> {
  void report
  // ponytail: fixture fallback keeps the demo deterministic; live extraction is opt-in and never runs in demo mode.
  if (!process.env.OPENAI_API_KEY || process.env.DEMO_MODE !== '0') return { measurements: demoMeasurements, source: 'fixture' }
  const bytes = Buffer.from(report).toString('base64')
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST', headers: { authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({ model: process.env.OPENAI_MODEL ?? 'gpt-5-mini', input: [{ role: 'user', content: [{ type: 'input_file', filename: 'roof-report.pdf', file_data: `data:application/pdf;base64,${bytes}` }, { type: 'input_text', text: 'Extract normalized roof measurements. Use numbers only when supported by the report and include warnings for missing values.' }] }], text: { format: { type: 'json_schema', name: 'roof_measurements', strict: true, schema: { type: 'object', properties: { totalAreaSqFt: { type: 'number' }, ridgeFt: { type: 'number' }, hipFt: { type: 'number' }, valleyFt: { type: 'number' }, eaveFt: { type: 'number' }, rakeFt: { type: 'number' }, dominantPitch: { type: ['string', 'null'] }, confidence: { type: 'number' }, warnings: { type: 'array', items: { type: 'string' } } }, required: ['totalAreaSqFt', 'ridgeFt', 'hipFt', 'valleyFt', 'eaveFt', 'rakeFt', 'dominantPitch', 'confidence', 'warnings'], additionalProperties: false } } } }),
  })
  if (!response.ok) throw new Error(`OpenAI returned ${response.status}`)
  const data = await response.json() as { output_text?: string }
  const measurements = JSON.parse(data.output_text ?? '') as RoofMeasurements
  if (!Number.isFinite(measurements.totalAreaSqFt) || measurements.confidence < 0 || measurements.confidence > 1) throw new Error('OpenAI returned invalid roof measurements')
  return { measurements, source: 'openai' }
}
