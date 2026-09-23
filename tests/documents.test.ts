import { describe, expect, it } from 'vitest'
import { PDFDocument } from 'pdf-lib'
import { demoLeads, demoMeasurements } from '../lib/demo-data'
import { calculateTakeoff } from '../lib/pricing'
import { createProposalPdf } from '../lib/proposal-pdf'
import { createTakeoffPdf } from '../lib/takeoff-pdf'
import type { Job } from '../lib/types'

describe('customer documents', () => {
  it('renders valid one-page proposal and takeoff PDFs', async () => {
    const job: Job = { id: 'job-document-test', lead: demoLeads[0], stage: 'proposal', measurements: demoMeasurements, takeoff: calculateTakeoff(demoMeasurements), priceSource: 'demo', proposalId: 'proposal-job-document-test', messages: [] }
    const [proposal, takeoff] = await Promise.all([createProposalPdf(job), createTakeoffPdf(job)])
    expect((await PDFDocument.load(proposal)).getPageCount()).toBe(1)
    expect((await PDFDocument.load(takeoff)).getPageCount()).toBe(1)
    expect(proposal.length).toBeGreaterThan(2_500)
    expect(takeoff.length).toBeGreaterThan(2_500)
  })
})
