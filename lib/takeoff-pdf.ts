import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib'
import { calculateTakeoff, formatMoney, pricedCostTaxCents, pricedCostTotalCents } from './pricing'
import type { Job } from './types'

const navy = rgb(0.035, 0.16, 0.24), teal = rgb(0.04, 0.48, 0.53), pale = rgb(0.92, 0.97, 0.97), ink = rgb(0.10, 0.16, 0.20), muted = rgb(0.39, 0.46, 0.50), white = rgb(1, 1, 1)
const right = (page: PDFPage, text: string, x: number, y: number, size: number, font: PDFFont, color = ink) => page.drawText(text, { x: x - font.widthOfTextAtSize(text, size), y, size, font, color })

export async function createMaterialTakeoffPdf(job: Job) {
  if (!job.measurements) throw new Error('Measurements are required')
  const takeoff = job.takeoff ?? calculateTakeoff(job.measurements), { pdf, page, font, bold } = await base(job, 'Material takeoff', 'ORDER QUANTITIES')
  page.drawText('MATERIAL & LABOR SCHEDULE', { x: 48, y: 590, size: 10, font: bold, color: navy }); tableHeader(page, font, bold, ['ITEM / CALCULATION', 'WASTE', 'QUANTITY'], [54, 396, 558])
  let y = 528
  takeoff.lines.forEach((item, index) => {
    stripe(page, y, index, 34); page.drawText(item.name, { x: 54, y: y + 4, size: 8.5, font: bold, color: ink }); page.drawText(item.formula, { x: 54, y: y - 8, size: 7, font, color: muted })
    right(page, item.waste ? `${Math.round(item.waste * 100)}%` : '—', 396, y, 8, font); right(page, `${item.quantity} ${item.unit}`, 558, y, 8, font); y -= 36
  })
  const m = job.measurements
  page.drawRectangle({ x: 42, y: 108, width: 528, height: 86, color: pale }); page.drawText('APPROVED ROOF MEASUREMENTS', { x: 56, y: 174, size: 8, font: bold, color: teal })
  page.drawText(`${m.totalAreaSqFt.toLocaleString()} sq ft total area`, { x: 56, y: 151, size: 10, font: bold, color: ink }); page.drawText(`${m.dominantPitch ?? 'Pitch n/a'} dominant pitch`, { x: 56, y: 130, size: 8, font, color: muted })
  page.drawText(`${m.ridgeFt} ft ridge  ·  ${m.hipFt} ft hip  ·  ${m.valleyFt} ft valley`, { x: 274, y: 151, size: 8, font, color: ink }); page.drawText(`${m.eaveFt} ft eave  ·  ${m.rakeFt} ft rake`, { x: 274, y: 130, size: 8, font, color: muted })
  footer(page, job.documentId, font); return pdf.save()
}

export async function createPricedTakeoffPdf(job: Job) {
  if (!job.takeoff || !job.measurements) throw new Error('Pricing and measurements are required')
  const { pdf, page, font, bold } = await base(job, 'Priced takeoff', job.takeoff.priceBookVersion)
  page.drawText('PRICED MATERIAL & LABOR SCHEDULE', { x: 48, y: 590, size: 10, font: bold, color: navy }); tableHeader(page, font, bold, ['DESCRIPTION', 'QTY', 'UNIT PRICE', 'AMOUNT'], [54, 408, 488, 558])
  let y = 528
  job.takeoff.lines.forEach((item, index) => {
    stripe(page, y, index, 24); page.drawText(item.name, { x: 54, y, size: 8.5, font, color: ink }); right(page, `${item.quantity} ${item.unit}`, 408, y, 8.5, font); right(page, formatMoney(item.unitPriceCents), 488, y, 8.5, font); right(page, formatMoney(item.amountCents), 558, y, 8.5, font); y -= 26
  })
  page.drawText(`Pricing source: ${source(job)}`, { x: 48, y: 174, size: 8.5, font: bold, color: navy }); page.drawText('Contractor margin is not included in this document.', { x: 48, y: 154, size: 8, font, color: muted })
  page.drawRectangle({ x: 338, y: 108, width: 232, height: 92, color: pale }); summary(page, 'Cost subtotal', job.takeoff.subtotalCents, 176, font); summary(page, 'Cost tax', pricedCostTaxCents(job.takeoff), 154, font)
  page.drawLine({ start: { x: 352, y: 143 }, end: { x: 556, y: 143 }, thickness: 1, color: teal }); page.drawText('PRICED TOTAL', { x: 352, y: 119, size: 9, font: bold, color: navy }); right(page, formatMoney(pricedCostTotalCents(job.takeoff)), 556, 116, 14, bold, navy)
  footer(page, job.documentId, font); return pdf.save()
}

export const createTakeoffPdf = createPricedTakeoffPdf

async function base(job: Job, title: string, label: string) {
  const pdf = await PDFDocument.create(), page = pdf.addPage([612, 792]), font = await pdf.embedFont(StandardFonts.Helvetica), bold = await pdf.embedFont(StandardFonts.HelveticaBold)
  page.drawRectangle({ x: 0, y: 694, width: 612, height: 98, color: navy }); page.drawRectangle({ x: 0, y: 688, width: 612, height: 6, color: teal }); page.drawText('ROOFING PROJECT', { x: 48, y: 751, size: 9, font: bold, color: rgb(0.64, 0.89, 0.90) }); page.drawText(title, { x: 48, y: 716, size: 27, font: bold, color: white }); right(page, label, 564, 720, 8, bold, white)
  page.drawRectangle({ x: 42, y: 618, width: 528, height: 50, color: pale }); page.drawText(job.lead.address, { x: 54, y: 645, size: 12, font: bold, color: ink }); page.drawText(`${job.lead.city}, ${job.lead.state} ${job.lead.zip}`, { x: 54, y: 629, size: 8, font, color: muted }); page.drawText(`Reference ${reference(job.documentId)}`, { x: 440, y: 637, size: 8, font, color: muted })
  return { pdf, page, font, bold }
}
function tableHeader(page: PDFPage, _font: PDFFont, bold: PDFFont, labels: string[], positions: number[]) { page.drawRectangle({ x: 42, y: 554, width: 528, height: 24, color: navy }); labels.forEach((label, index) => index ? right(page, label, positions[index], 562, 8, bold, white) : page.drawText(label, { x: positions[index], y: 562, size: 8, font: bold, color: white })) }
function stripe(page: PDFPage, y: number, index: number, height: number) { if (index % 2 === 0) page.drawRectangle({ x: 42, y: y - 13, width: 528, height, color: rgb(0.965, 0.98, 0.98) }) }
function source(job: Job) { return job.priceSource === 'distributor' ? job.distributor?.name ?? 'Distributor pricing' : job.priceSource === 'saved' ? 'Saved pricing' : 'Demo pricing' }
function summary(page: PDFPage, label: string, cents: number, y: number, font: PDFFont) { page.drawText(label, { x: 352, y, size: 8.5, font, color: muted }); right(page, formatMoney(cents), 556, y, 8.5, font) }
function reference(id: string) { return id.replaceAll('-', '').slice(0, 8).toUpperCase() }
function footer(page: PDFPage, id: string, font: PDFFont) { page.drawLine({ start: { x: 42, y: 58 }, end: { x: 570, y: 58 }, thickness: 0.5, color: rgb(0.78, 0.82, 0.84) }); page.drawText(`Reference ${reference(id)}`, { x: 42, y: 39, size: 7, font, color: muted }); right(page, 'Roofing Project Documents · Page 1 of 1', 570, 39, 7, font, muted) }
