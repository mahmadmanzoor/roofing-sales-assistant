import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib'
import type { Job } from './types'
import { formatMoney } from './pricing'

const navy = rgb(0.035, 0.16, 0.24), teal = rgb(0.04, 0.48, 0.53), pale = rgb(0.92, 0.97, 0.97), ink = rgb(0.10, 0.16, 0.20), muted = rgb(0.39, 0.46, 0.50)
const right = (page: PDFPage, text: string, x: number, y: number, size: number, font: PDFFont, color = ink) => page.drawText(text, { x: x - font.widthOfTextAtSize(text, size), y, size, font, color })

export async function createProposalPdf(job: Job) {
  if (!job.takeoff) throw new Error('Takeoff is required')
  const pdf = await PDFDocument.create(), page = pdf.addPage([612, 792])
  const font = await pdf.embedFont(StandardFonts.Helvetica), bold = await pdf.embedFont(StandardFonts.HelveticaBold)
  page.drawRectangle({ x: 0, y: 694, width: 612, height: 98, color: navy }); page.drawRectangle({ x: 0, y: 688, width: 612, height: 6, color: teal })
  page.drawText('ROOFING PROJECT', { x: 48, y: 751, size: 9, font: bold, color: rgb(0.64, 0.89, 0.90) }); page.drawText('Proposal', { x: 48, y: 716, size: 29, font: bold, color: rgb(1, 1, 1) })
  right(page, formatMoney(job.takeoff.totalCents), 564, 727, 23, bold, rgb(1, 1, 1)); right(page, 'ESTIMATED PROJECT TOTAL', 564, 712, 7, bold, rgb(0.64, 0.89, 0.90))

  page.drawRectangle({ x: 42, y: 610, width: 528, height: 58, color: pale })
  page.drawText('PROJECT ADDRESS', { x: 56, y: 648, size: 7, font: bold, color: teal }); page.drawText(job.lead.address, { x: 56, y: 628, size: 14, font: bold, color: ink }); page.drawText(`${job.lead.city}, ${job.lead.state} ${job.lead.zip}`, { x: 56, y: 614, size: 9, font, color: muted })
  page.drawText('DOCUMENT', { x: 374, y: 648, size: 7, font: bold, color: teal }); page.drawText(`Proposal ${reference(job.documentId)}`, { x: 374, y: 631, size: 8, font, color: ink }); page.drawText(`${source(job)} · ${job.takeoff.priceBookVersion}`, { x: 374, y: 616, size: 8, font, color: muted })

  page.drawText('PROJECT BREAKDOWN', { x: 48, y: 576, size: 10, font: bold, color: navy }); page.drawRectangle({ x: 42, y: 540, width: 528, height: 24, color: navy })
  page.drawText('DESCRIPTION', { x: 54, y: 548, size: 8, font: bold, color: rgb(1, 1, 1) }); right(page, 'QTY', 408, 548, 8, bold, rgb(1, 1, 1)); right(page, 'UNIT PRICE', 488, 548, 8, bold, rgb(1, 1, 1)); right(page, 'AMOUNT', 558, 548, 8, bold, rgb(1, 1, 1))
  let y = 516
  job.takeoff.lines.forEach((item, index) => {
    if (index % 2 === 0) page.drawRectangle({ x: 42, y: y - 6, width: 528, height: 24, color: rgb(0.965, 0.98, 0.98) })
    page.drawText(item.name, { x: 54, y, size: 8.5, font, color: ink }); right(page, `${item.quantity} ${item.unit}`, 408, y, 8.5, font); right(page, formatMoney(item.unitPriceCents), 488, y, 8.5, font); right(page, formatMoney(item.amountCents), 558, y, 8.5, font); y -= 26
  })

  const boxY = 142
  page.drawRectangle({ x: 338, y: boxY, width: 232, height: 112, color: pale }); summary(page, 'Materials & labor', job.takeoff.subtotalCents, boxY + 88, font); summary(page, 'Contractor margin', job.takeoff.markupCents, boxY + 66, font); summary(page, 'Tax', job.takeoff.taxCents, boxY + 44, font)
  page.drawLine({ start: { x: 352, y: boxY + 34 }, end: { x: 556, y: boxY + 34 }, thickness: 1, color: teal }); page.drawText('TOTAL', { x: 352, y: boxY + 15, size: 10, font: bold, color: navy }); right(page, formatMoney(job.takeoff.totalCents), 556, boxY + 12, 15, bold, navy)
  page.drawText('Scope summary', { x: 48, y: 228, size: 9, font: bold, color: navy }); page.drawText('Roofing materials and installation.', { x: 48, y: 210, size: 8, font, color: muted }); page.drawText('Based on the approved roof measurements.', { x: 48, y: 194, size: 8, font, color: muted }); page.drawText('Final scope and terms require contractor approval.', { x: 48, y: 178, size: 8, font, color: muted })
  footer(page, job.documentId, font)
  return pdf.save()
}

function source(job: Job) { return job.priceSource === 'distributor' ? (job.distributor?.name ?? 'Distributor quote') : job.priceSource === 'saved' ? 'Saved pricing' : 'Demo pricing' }
function summary(page: PDFPage, label: string, cents: number, y: number, font: PDFFont) { page.drawText(label, { x: 352, y, size: 9, font, color: muted }); right(page, formatMoney(cents), 556, y, 9, font) }
function reference(id: string) { return id.replaceAll('-', '').slice(0, 8).toUpperCase() }
function footer(page: PDFPage, id: string, font: PDFFont) { page.drawLine({ start: { x: 42, y: 58 }, end: { x: 570, y: 58 }, thickness: 0.5, color: rgb(0.78, 0.82, 0.84) }); page.drawText(`Reference ${reference(id)}`, { x: 42, y: 39, size: 7, font, color: muted }); right(page, 'Roofing Project Documents · Page 1 of 1', 570, 39, 7, font, muted) }
