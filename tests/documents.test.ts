import { describe, expect, it } from 'vitest'
import { PDFDocument } from 'pdf-lib'
import { demoLeads, demoMeasurements } from '../lib/demo-data'
import { calculateTakeoff } from '../lib/pricing'
import { createProposalPdf } from '../lib/proposal-pdf'
import { createMaterialTakeoffPdf, createPricedTakeoffPdf } from '../lib/takeoff-pdf'
import type { Job } from '../lib/types'

describe('customer documents', () => {
  it('renders valid one-page proposal, material, and priced takeoff PDFs', async () => {
    const job: Job = { id: 'job-document-test', documentId: '8d697a67-3ee0-423e-a611-a624d29cad4f', lead: demoLeads[0], stage: 'proposal', measurements: demoMeasurements, takeoff: calculateTakeoff(demoMeasurements), priceSource: 'demo', proposalId: 'proposal-document-test', messages: [] }
    const [proposal, takeoff, priced] = await Promise.all([createProposalPdf(job), createMaterialTakeoffPdf(job), createPricedTakeoffPdf(job)])
    expect((await PDFDocument.load(proposal)).getPageCount()).toBe(1)
    expect((await PDFDocument.load(takeoff)).getPageCount()).toBe(1)
    expect((await PDFDocument.load(priced)).getPageCount()).toBe(1)
    expect(proposal.length).toBeGreaterThan(2_500)
    expect(takeoff.length).toBeGreaterThan(2_500)
    expect(priced.length).toBeGreaterThan(2_500)
  })
})
