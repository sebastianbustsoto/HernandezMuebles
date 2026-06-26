import { NextResponse } from 'next/server'
import PDFDocument from 'pdfkit'

const BROWN = '#1a1a1a'
const DARK = '#222222'
const LIGHT_BG = '#f5f5f5'
const BORDER = '#dcdcdc'
const TEXT = '#1f1f1f'
const MUTED = '#777777'
const ROW_ALT = '#fafafa'

export async function POST(request) {
  try {
    const { cotizacion: q, filas = [], mano = 0, subtotal = 0, iva = 0, total = 0, fecha } = await request.json()

    const chunks = []
    const doc = new PDFDocument({ margin: 40, size: 'A4' })

    doc.on('data', chunk => chunks.push(chunk))

    await new Promise((resolve, reject) => {
      doc.on('end', resolve)
      doc.on('error', reject)

      const W = doc.page.width
      const H = doc.page.height
      const M = 40
      const FOOTER_H = 36

      function drawFooter() {
        const footY = H - FOOTER_H
        doc.moveTo(M, footY).lineTo(W - M, footY).strokeColor(BORDER).lineWidth(1).stroke()
        doc.fillColor(MUTED).font('Helvetica').fontSize(8)
           .text('Este presupuesto es referencial.', M, footY + 8, { align: 'center', width: W - M * 2 })
        doc.fillColor(MUTED).fontSize(8)
           .text('Hernández Muebles — joserhernandezmuebles@gmail.com', M, footY + 20, { align: 'center', width: W - M * 2 })
      }

      function ensureSpace(cursor, needed) {
        if (cursor + needed > H - FOOTER_H - 10) {
          doc.addPage()
          return M
        }
        return cursor
      }

      doc.rect(M, M, W - M * 2, 3).fill(BROWN)
      doc.fillColor(DARK).font('Helvetica-Bold').fontSize(20)
         .text('Hernández Muebles', M, M + 12)
      doc.fillColor(MUTED).font('Helvetica').fontSize(10)
         .text('Presupuesto de carpintería artesanal', M, M + 36)

      const badgeW = 110, badgeH = 20, badgeX = W - M - badgeW
      doc.roundedRect(badgeX, M + 12, badgeW, badgeH, 4).fill(BROWN)
      doc.fillColor('white').font('Helvetica-Bold').fontSize(9)
         .text('PRESUPUESTO', badgeX, M + 17, { width: badgeW, align: 'center' })

      doc.fillColor(MUTED).font('Helvetica').fontSize(9)
         .text(fecha || new Date().toLocaleDateString('es-CL'), badgeX, M + 38, { width: badgeW, align: 'right' })

      if (q?.código) {
        doc.fillColor(DARK).font('Helvetica-Bold').fontSize(11)
           .text(q.código, badgeX, M + 50, { width: badgeW, align: 'right' })
      }

      const lineY = M + 68
      doc.moveTo(M, lineY).lineTo(W - M, lineY).strokeColor(BROWN).lineWidth(2).stroke()

      let cursor = lineY + 14

      if (q) {
        const campos = [
          ['CLIENTE', q.nombre || '—'],
          ['CORREO', q.email || '—'],
          ['TIPO', q.tipo || '—'],
          ['MEDIDAS (CM)', `${q.dim?.ancho ?? '—'} × ${q.dim?.alto ?? '—'} × ${q.dim?.prof ?? '—'}`],
          ['MATERIAL', q.material || '—'],
        ]
        if (q.diseñoTitulo) campos.splice(3, 0, ['DISEÑO', q.diseñoTitulo])

        const filasG = Math.ceil(campos.length / 2)
        const gBgH = filasG * 22 + 16

        cursor = ensureSpace(cursor, gBgH + 16)

        doc.roundedRect(M, cursor, W - M * 2, gBgH, 6).fill(LIGHT_BG)
        doc.roundedRect(M, cursor, W - M * 2, gBgH, 6).stroke(BORDER)

        const colW = (W - M * 2 - 32) / 2
        const pad = 10
        campos.forEach(([label, value], i) => {
          const col = i % 2
          const row = Math.floor(i / 2)
          const cx = M + pad + col * (colW + 12)
          const cy = cursor + pad + row * 22

          doc.fillColor(MUTED).font('Helvetica-Bold').fontSize(8)
             .text(label, cx, cy, { width: colW })
          doc.fillColor(TEXT).font('Helvetica').fontSize(9)
             .text(value, cx, cy + 9, { width: colW, lineBreak: false })
        })

        cursor += gBgH + 16
      }

      if (filas.length > 0 || mano > 0) {
        const thH = 24

        function drawTableHeader() {
          doc.rect(M, cursor, W - M * 2, thH).fill(BROWN)
          doc.fillColor('white').font('Helvetica-Bold').fontSize(9)
          const cols = [
            { label: 'ÍTEM / DESCRIPCIÓN', x: M + 8, w: 240 },
            { label: 'CANT.', x: M + 258, w: 50, align: 'center' },
            { label: 'P. UNITARIO', x: M + 318, w: 85, align: 'right' },
            { label: 'SUBTOTAL', x: M + 408, w: 100, align: 'right' },
          ]
          cols.forEach(c => {
            doc.text(c.label, c.x, cursor + 8, { width: c.w, align: c.align || 'left' })
          })
          cursor += thH
        }

        cursor = ensureSpace(cursor, thH + 20)
        drawTableHeader()

        filas.forEach((f, i) => {
          const rowH = 20
          if (cursor + rowH > H - FOOTER_H - 10) {
            doc.addPage()
            cursor = M
            drawTableHeader()
          }
          const bg = i % 2 === 0 ? LIGHT_BG : ROW_ALT
          doc.rect(M, cursor, W - M * 2, rowH).fill(bg)

          const qty = Number(f.q) || 0
          const p = Number(f.p) || 0
          const sub = qty * p

          doc.fillColor(TEXT).font('Helvetica-Bold').fontSize(9)
             .text(String(f.label || ''), M + 8, cursor + 6, { width: 240, lineBreak: false })
          doc.font('Helvetica').fillColor(MUTED)
             .text(String(qty), M + 258, cursor + 6, { width: 50, align: 'center' })
          doc.text(`$${p.toLocaleString('es-CL')}`, M + 318, cursor + 6, { width: 85, align: 'right' })
          doc.fillColor(TEXT).font('Helvetica-Bold')
             .text(`$${sub.toLocaleString('es-CL')}`, M + 408, cursor + 6, { width: 100, align: 'right' })

          doc.moveTo(M, cursor + rowH).lineTo(W - M, cursor + rowH)
             .strokeColor(BORDER).lineWidth(0.5).stroke()

          cursor += rowH
        })

        if (mano > 0) {
          const rowH = 20
          if (cursor + rowH > H - FOOTER_H - 10) {
            doc.addPage()
            cursor = M
            drawTableHeader()
          }
          doc.rect(M, cursor, W - M * 2, rowH).fill(LIGHT_BG)
          doc.fillColor(TEXT).font('Helvetica-Bold').fontSize(9)
             .text('Mano de obra', M + 8, cursor + 6, { width: 240 })
          doc.fillColor(MUTED).font('Helvetica')
             .text('—', M + 258, cursor + 6, { width: 50, align: 'center' })
             .text('—', M + 318, cursor + 6, { width: 85, align: 'right' })
          doc.fillColor(TEXT).font('Helvetica-Bold')
             .text(`$${Number(mano).toLocaleString('es-CL')}`, M + 408, cursor + 6, { width: 100, align: 'right' })
          doc.moveTo(M, cursor + rowH).lineTo(W - M, cursor + rowH)
             .strokeColor(BORDER).lineWidth(0.5).stroke()
          cursor += rowH
        }

        const subtotalValor = Number(subtotal) || 0
        const rowH = 20
        doc.rect(M, cursor, W - M * 2, rowH).fill(LIGHT_BG)
        doc.fillColor(DARK).font('Helvetica-Bold').fontSize(9)
           .text('SUBTOTAL', M + 8, cursor + 6, { width: 240 })
        doc.fillColor(DARK).font('Helvetica-Bold')
           .text(`$${subtotalValor.toLocaleString('es-CL')}`, M + 408, cursor + 6, { width: 100, align: 'right' })
        doc.moveTo(M, cursor + rowH).lineTo(W - M, cursor + rowH)
           .strokeColor(BORDER).lineWidth(0.5).stroke()
        cursor += rowH

        const ivaValor = Number(iva) || 0
        doc.rect(M, cursor, W - M * 2, rowH).fill(ROW_ALT)
        doc.fillColor(DARK).font('Helvetica-Bold').fontSize(9)
           .text('IVA (19%)', M + 8, cursor + 6, { width: 240 })
        doc.fillColor(DARK).font('Helvetica-Bold')
           .text(`$${ivaValor.toLocaleString('es-CL')}`, M + 408, cursor + 6, { width: 100, align: 'right' })
        doc.moveTo(M, cursor + rowH).lineTo(W - M, cursor + rowH)
           .strokeColor(BORDER).lineWidth(0.5).stroke()
        cursor += rowH

        const totalValor = Number(total) || 0
        const totH = 28
        cursor = ensureSpace(cursor, totH + 4)
        doc.rect(M, cursor, W - M * 2, totH).fill(LIGHT_BG)
        doc.moveTo(M, cursor).lineTo(W - M, cursor).strokeColor(BROWN).lineWidth(2).stroke()
        doc.fillColor(DARK).font('Helvetica-Bold').fontSize(11)
           .text('TOTAL A PAGAR', M + 8, cursor + 8, { width: 350 })
        doc.fontSize(14)
           .text(`$${totalValor.toLocaleString('es-CL')}`, M + 358, cursor + 6, { width: 150, align: 'right' })
        cursor += totH + 20

      } else {
        cursor = ensureSpace(cursor, 56)
        doc.roundedRect(M, cursor, W - M * 2, 40, 6).fill(LIGHT_BG)
        
        const subtotalValor = Number(subtotal) || 0
        const ivaValor = Number(iva) || 0
        const totalValor = Number(total) || 0
        
        doc.fillColor(DARK).font('Helvetica-Bold').fontSize(12)
           .text(`SUBTOTAL: $${subtotalValor.toLocaleString('es-CL')}`, M + 8, cursor + 8, { width: W - M * 2 - 16, align: 'right' })
        doc.fillColor(DARK).font('Helvetica-Bold').fontSize(12)
           .text(`IVA (19%): $${ivaValor.toLocaleString('es-CL')}`, M + 8, cursor + 22, { width: W - M * 2 - 16, align: 'right' })
        doc.fillColor(DARK).font('Helvetica-Bold').fontSize(14)
           .text(`TOTAL: $${totalValor.toLocaleString('es-CL')}`, M + 8, cursor + 36, { width: W - M * 2 - 16, align: 'right' })
        cursor += 56
      }

      const totalPages = doc.bufferedPageRange().count
      for (let i = 0; i < totalPages; i++) {
        doc.switchToPage(i)
        drawFooter()
      }

      doc.end()
    })

    const pdfBuffer = Buffer.concat(chunks)
    const codigo = q?.código || 'SIN'

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="PRESUPUESTO_${codigo}.pdf"`,
      },
    })
  } catch (err) {
    console.error('[PDF presupuesto]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}