import { supabaseAdmin } from '@/lib/supabaseAdmin'

// PATCH /api/cotizaciones/[id]
export async function PATCH(req, { params }) {
  const { id } = params
  const { etapa_id, chat_cerrado, material, color, color_hex, descripcion } = await req.json()

  try {
    const updates = {}
    if (etapa_id !== undefined) updates.etapa_id = parseInt(etapa_id)
    if (chat_cerrado !== undefined) updates.chat_cerrado = chat_cerrado
    if (material !== undefined) updates.material = material
    if (color !== undefined) updates.color = color
    if (color_hex !== undefined) updates.color_hex = color_hex
    if (descripcion !== undefined) updates.descripcion = descripcion

    if (Object.keys(updates).length === 0) {
      return Response.json({ error: 'No hay datos para actualizar' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('cotizaciones')
      .update(updates)
      .eq('id', parseInt(id))
      .select()
      .single()

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ cotizacion: data })
  } catch (err) {
    return Response.json({ error: 'Error al actualizar cotización' }, { status: 500 })
  }
}

// DELETE /api/cotizaciones/[id]
export async function DELETE(req, { params }) {
  const { id } = params

  try {
    const { error } = await supabaseAdmin
      .from('cotizaciones')
      .delete()
      .eq('id', parseInt(id))

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ success: true })
  } catch (err) {
    return Response.json({ error: 'Error al eliminar cotización' }, { status: 500 })
  }
}
