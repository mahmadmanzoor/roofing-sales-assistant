import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib'
import type { Job } from './types'
import { formatMoney } from './pricing'

const navy = rgb(0.035, 0.16, 0.24), teal = rgb(0.04, 0.48, 0.53), pale = rgb(0.92, 0.97, 0.97), ink = rgb(0.10, 0.16, 0.20), muted = rgb(0.39, 0.46, 0.50)
const right = (page: PDFPage, text: string, x: number, y: number, size: number, font: PDFFont, color = ink) => page.drawText(text, { x: x - font.widthOfTextAtSize(text, size), y, size, font, color })

export async function createTakeoffPdf(job: Job) {
  if (!job.takeoff || !job.measurements) throw new Error('Takeoff and measurements are required')
  const pdf = await PDFDocument.create(), page = pdf.addPage([612, 792])
  const font = await pdf.embedFont(StandardFonts.Helvetica), bold = await pdf.embedFont(StandardFonts.HelveticaBold)
  page.drawRectangle({ x: 0, y: 694, width: 612, height: 98, color: navy }); page.drawRectangle({ x: 0, y: 688, width: 612, height: 6, color: teal })
  page.drawText('ROOFING PROJECT', { x: 48, y: 751, size: 9, font: bold, color: rgb(0.64, 0.89, 0.90) }); page.drawText('Material takeoff', { x: 48, y: 716, size: 27, font: bold, color: rgb(1, 1, 1) })
  right(page, job.takeoff.priceBookVersion, 564, 723, 9, bold, rgb(1, 1, 1)); right(page, 'PRICE BOOK', 564, 708, 7, bold, rgb(0.64, 0.89, 0.90))

  page.drawRectangle({ x: 42, y: 618, width: 528, height: 50, color: pale }); page.drawText(job.lead.address, { x: 54, y: 645, size: 12, font: bold, color: ink }); page.drawText(`${job.lead.city}, ${job.lead.state} ${job.lead.zip}`, { x: 54, y: 629, size: 8, font, color: muted })
  const m = job.measurements; page.drawText(`${m.totalAreaSqFt.toLocaleString()} sq ft roof  ·  ${m.dominantPitch ?? 'Pitch n/a'}  ·  ${m.ridgeFt} ft ridge  ·  ${m.hipFt} ft hip  ·  ${m.valleyFt} ft valley`, { x: 274, y: 637, size: 7.5, font, color: ink })

  page.drawText('MATERIAL & LABOR SCHEDULE', { x: 48, y: 590, size: 10, font: bold, color: navy }); page.drawRectangle({ x: 42, y: 554, width: 528, height: 24, color: navy })
  page.drawText('ITEM / CALCULATION', { x: 54, y: 562, size: 8, font: bold, color: rgb(1, 1, 1) }); right(page, 'WASTE', 396, 562, 8, bold, rgb(1, 1, 1)); right(page, 'QTY', 458, 562, 8, bold, rgb(1, 1, 1)); right(page, 'LINE TOTAL', 558, 562, 8, bold, rgb(1, 1, 1))
  let y = 528
  job.takeoff.lines.forEach((item, index) => {
    if (index % 2 === 0) page.drawRectangle({ x: 42, y: y - 13, width: 528, height: 34, color: rgb(0.965, 0.98, 0.98) })
    page.drawText(item.name, { x: 54, y: y + 4, size: 8.5, font: bold, color: ink }); page.drawText(item.formula, { x: 54, y: y - 8, size: 7, font, color: muted })
    right(page, item.waste ? `${Math.round(item.waste * 100)}%` : '—', 396, y, 8, font); right(page, `${item.quantity} ${item.unit}`, 458, y, 8, font); right(page, formatMoney(item.amountCents), 558, y, 8, font); y -= 36
  })
  page.drawRectangle({ x: 338, y: 108, width: 232, height: 86, color: pale }); summary(page, 'Subtotal', job.takeoff.subtotalCents, 172, font); summary(page, 'Markup', job.takeoff.markupCents, 152, font); summary(page, 'Tax', job.takeoff.taxCents, 132, font)
  page.drawText('PRICED TOTAL', { x: 352, y: 113, size: 9, font: bold, color: navy }); right(page, formatMoney(job.takeoff.totalCents), 556, 111, 13, bold, navy)
  page.drawText(`Pricing source: ${job.priceSource === 'distributor' ? job.distributor?.name ?? 'Distributor quote' : job.priceSource === 'saved' ? 'Saved pricing' : 'Demo pricing'}`, { x: 48, y: 164, size: 8, font: bold, color: navy }); page.drawText('Quantities are rounded purchasing quantities.', { x: 48, y: 146, size: 7.5, font, color: muted }); page.drawText('Formulas and waste assumptions are retained for review.', { x: 48, y: 132, size: 7.5, font, color: muted })
  footer(page, job.id, font)
  return pdf.save()
}

function summary(page: PDFPage, label: string, cents: number, y: number, font: PDFFont) { page.drawText(label, { x: 352, y, size: 8.5, font, color: muted }); right(page, formatMoney(cents), 556, y, 8.5, font) }
function footer(page: PDFPage, id: string, font: PDFFont) { page.drawLine({ start: { x: 42, y: 58 }, end: { x: 570, y: 58 }, thickness: 0.5, color: rgb(0.78, 0.82, 0.84) }); page.drawText(`Document ${id}`, { x: 42, y: 39, size: 7, font, color: muted }); right(page, 'Roofing Project Documents · Page 1 of 1', 570, 39, 7, font, muted) }
