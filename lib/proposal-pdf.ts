import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import type { Job } from './types'
import { formatMoney } from './pricing'

export async function createProposalPdf(job: Job) {
  if (!job.takeoff) throw new Error('Takeoff is required')
  const pdf = await PDFDocument.create(); const page = pdf.addPage([612, 792]); const font = await pdf.embedFont(StandardFonts.Helvetica)
  page.drawText('Roofing proposal', { x: 54, y: 730, size: 28, font, color: rgb(0.07, 0.25, 0.17) })
  page.drawText(`${job.lead.address}, ${job.lead.city}, ${job.lead.state} ${job.lead.zip}`, { x: 54, y: 695, size: 12, font })
  let y = 640; for (const item of job.takeoff.lines) { page.drawText(`${item.name}  ${item.quantity} ${item.unit}`, { x: 54, y, size: 10, font }); page.drawText(formatMoney(item.amountCents), { x: 460, y, size: 10, font }); y -= 20 }
  page.drawText(`Proposal total: ${formatMoney(job.takeoff.totalCents)}`, { x: 54, y: y - 12, size: 16, font, color: rgb(0.07, 0.25, 0.17) })
  return pdf.save()
}
