import { supabaseAdmin } from '@/lib/supabaseAdmin'

// PATCH /api/cotizaciones/[id] — actualizar estado, cerrar chat, etc.
export async function PATCH(req, { params }) {
  const { id } = params
  const body = await req.json()
  const { etapa_id, chat_cerrado } = body

  const updates = {}
  if (etapa_id !== undefined) updates.etapa_id = parseInt(etapa_id)
  if (chat_cerrado !== undefined) updates.chat_cerrado = chat_cerrado

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
}

// DELETE /api/cotizaciones/[id] — eliminar cotización
export async function DELETE(req, { params }) {
  const { id } = params

  const { error } = await supabaseAdmin
    .from('cotizaciones')
    .delete()
    .eq('id', parseInt(id))

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ success: true })
}
