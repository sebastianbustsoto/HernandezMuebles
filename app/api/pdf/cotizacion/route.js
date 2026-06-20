import { NextResponse } from 'next/server'
import PDFDocument from 'pdfkit'

/* ─── Paleta Hernández Muebles ─── */
const BROWN     = '#1a1a1a'
const DARK      = '#222222'
const LIGHT_BG  = '#f5f5f5'
const BORDER    = '#dcdcdc'
const TEXT      = '#1f1f1f'
const MUTED     = '#777777'

export async function POST(request) {
  try {
    const q = await request.json()

    const chunks = []
    const doc = new PDFDocument({ margin: 40, size: 'A4' })

    doc.on('data', chunk => chunks.push(chunk))

    await new Promise((resolve, reject) => {
      doc.on('end', resolve)
      doc.on('error', reject)

      const W = doc.page.width   // 595
      const H = doc.page.height  // 842
      const M = 40                // margen
      const FOOTER_H = 36          // espacio reservado para el pie de página

      /** Dibuja el pie de página en la posición actual de doc.page */
      function drawFooter() {
        const footY = H - FOOTER_H
        doc.moveTo(M, footY).lineTo(W - M, footY).strokeColor(BORDER).lineWidth(1).stroke()
        doc.fillColor(MUTED).font('Helvetica').fontSize(8)
           .text('Esta cotización es referencial.', M, footY + 8, { align: 'center', width: W - M * 2 })
        doc.fillColor(MUTED).fontSize(8)
           .text('Hernández Muebles — joserhernandezmuebles@gmail.com', M, footY + 20, { align: 'center', width: W - M * 2 })
      }

      /** Si el contenido no cabe antes del pie de página, agrega una nueva hoja */
      function ensureSpace(cursor, needed) {
        if (cursor + needed > H - FOOTER_H - 10) {
          doc.addPage()
          return M
        }
        return cursor
      }

      /* ══════════ HEADER ══════════ */
      doc.rect(M, M, W - M * 2, 3).fill(BROWN)

      doc.fillColor(DARK).font('Helvetica-Bold').fontSize(20)
         .text('Hernández Muebles', M, M + 12)
      doc.fillColor(MUTED).font('Helvetica').fontSize(10)
         .text('Solicitud de cotización artesanal', M, M + 36)

      const badgeW = 100, badgeH = 20, badgeX = W - M - badgeW
      doc.roundedRect(badgeX, M + 12, badgeW, badgeH, 4).fill(BROWN)
      doc.fillColor('white').font('Helvetica-Bold').fontSize(9)
         .text('COTIZACIÓN', badgeX, M + 17, { width: badgeW, align: 'center' })

      doc.fillColor(MUTED).font('Helvetica').fontSize(9)
         .text(q.fecha || '', badgeX, M + 38, { width: badgeW, align: 'right' })
      doc.fillColor(DARK).font('Helvetica-Bold').fontSize(11)
         .text(q.código || '', badgeX, M + 50, { width: badgeW, align: 'right' })

      const lineY = M + 68
      doc.moveTo(M, lineY).lineTo(W - M, lineY).strokeColor(BROWN).lineWidth(2).stroke()

      /* ══════════ GRILLA DE DATOS ══════════ */
      const gY = lineY + 14

      const campos = [
        ['CLIENTE',      q.nombre   || '—'],
        ['CORREO',       q.email    || '—'],
        ['TELÉFONO',     q.número   || '—'],
        ['TIPO DE MUEBLE', q.tipo   || '—'],
        ['MEDIDAS (CM)', `${q.dim?.ancho ?? '—'} × ${q.dim?.alto ?? '—'} × ${q.dim?.prof ?? '—'}`],
        ['MATERIAL',     q.material || '—'],
        ['COLOR',        q.color    || '—'],
      ]
      if (q.diseñoTitulo) campos.splice(4, 0, ['DISEÑO', q.diseñoTitulo])

      const filas  = Math.ceil(campos.length / 2)
      const gBgH   = filas * 28 + 16

      doc.roundedRect(M, gY, W - M * 2, gBgH, 6).fill(LIGHT_BG)
      doc.roundedRect(M, gY, W - M * 2, gBgH, 6).stroke(BORDER)

      const colW = (W - M * 2 - 32) / 2
      const pad  = 10
      campos.forEach(([ label, value ], i) => {
        const col  = i % 2
        const row  = Math.floor(i / 2)
        const cx   = M + pad + col * (colW + 12)
        const cy   = gY + pad + row * 28

        doc.fillColor(MUTED).font('Helvetica-Bold').fontSize(8)
           .text(label, cx, cy, { width: colW })
        doc.fillColor(TEXT).font('Helvetica').fontSize(10)
           .text(value, cx, cy + 10, { width: colW, lineBreak: false })
      })

      let cursor = gY + gBgH + 16

      /* ══════════ DESCRIPCIÓN ══════════ */
      if (q.descripción) {
        doc.font('Helvetica').fontSize(10)
        const textH = doc.heightOfString(q.descripción, { width: W - M * 2 - 16 })
        const boxH  = Math.max(36, textH + 16)

        cursor = ensureSpace(cursor, boxH + 22)

        doc.fillColor(MUTED).font('Helvetica-Bold').fontSize(8)
           .text('DESCRIPCIÓN', M, cursor)
        cursor += 12
        doc.roundedRect(M, cursor, W - M * 2, boxH, 4).fill('#f9f4ef')
        doc.fillColor(TEXT).font('Helvetica').fontSize(10)
           .text(q.descripción, M + 8, cursor + 8, { width: W - M * 2 - 16 })
        cursor += boxH + 16
      }

      /* ══════════ IMAGEN ADJUNTA (completa, sin recortes) ══════════ */
      if (q.adjuntoBase64 && q.adjuntoBase64.startsWith('data:image')) {
        try {
          const b64 = q.adjuntoBase64.split(',')[1]
          const imgBuf = Buffer.from(b64, 'base64')

          const boxW = W - M * 2   // ancho disponible completo
          const boxH = 320         // alto reservado: la imagen se ajusta dentro completa, sin recortes

          cursor = ensureSpace(cursor, boxH + 26)

          doc.fillColor(MUTED).font('Helvetica-Bold').fontSize(8)
             .text('IMAGEN DE REFERENCIA', M, cursor)
          cursor += 12

          // Marco de fondo para visualizar el contenedor completo
          doc.roundedRect(M, cursor, boxW, boxH, 6).fill('#f9f4ef')
          doc.roundedRect(M, cursor, boxW, boxH, 6).stroke(BORDER)

          // fit conserva la proporción y centra la imagen completa dentro del recuadro
          doc.image(imgBuf, M + 6, cursor + 6, {
            fit: [boxW - 12, boxH - 12],
            align: 'center',
            valign: 'center',
          })

          cursor += boxH + 16
        } catch (_) { /* imagen inválida, ignorar */ }
      }

      /* ══════════ FOOTER (en todas las páginas generadas) ══════════ */
      const totalPages = doc.bufferedPageRange().count
      for (let i = 0; i < totalPages; i++) {
        doc.switchToPage(i)
        drawFooter()
      }

      doc.end()
    })

    const pdfBuffer = Buffer.concat(chunks)

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="COTIZACION_${q.código || 'SIN'}.pdf"`,
      },
    })
  } catch (err) {
    console.error('[PDF cotizacion]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
