import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function PATCH(req, { params }) {
  try {
    const { id } = params
    const { etapa_id, chat_cerrado } = await req.json()

    const updates = {}
    if (etapa_id !== undefined) updates.etapa_id = parseInt(etapa_id)
    if (chat_cerrado !== undefined) updates.chat_cerrado = chat_cerrado

    const { data, error } = await supabaseAdmin
      .from('cotizaciones')
      .update(updates)
      .eq('id', parseInt(id))
      .select()
      .single()

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ cotizacion: data })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = params
    const { error } = await supabaseAdmin
      .from('cotizaciones')
      .delete()
      .eq('id', parseInt(id))

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ success: true })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
