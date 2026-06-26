import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(req, { params }) {
  try {
    const { id } = params
    console.log('🔍 GET - Buscando cotización ID:', id)
    
    const { data, error } = await supabaseAdmin
      .from('cotizaciones')
      .select(`
        *,
        clientes (
          id,
          nombres,
          apellidos,
          email,
          telefono
        )
      `)
      .eq('id', parseInt(id))
      .single()

    if (error) {
      console.error('❌ Error GET:', error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return Response.json({ error: 'Cotización no encontrada' }, { status: 404 })
    }

    return Response.json({ cotizacion: data })
  } catch (err) {
    console.error('❌ Error en GET:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req, { params }) {
  try {
    const { id } = params
    const body = await req.json()
    console.log('📡 PATCH - Actualizando cotización ID:', id)
    console.log('📦 Datos:', body)

    const updates = {}
    if (body.etapa_id !== undefined) updates.etapa_id = parseInt(body.etapa_id)
    if (body.chat_cerrado !== undefined) updates.chat_cerrado = body.chat_cerrado

    if (Object.keys(updates).length === 0) {
      return Response.json({ error: 'No hay datos para actualizar' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('cotizaciones')
      .update(updates)
      .eq('id', parseInt(id))
      .select()
      .single()

    if (error) {
      console.error('❌ Error PATCH:', error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    console.log('✅ Cotización actualizada:', data.id)
    return Response.json({ cotizacion: data })
  } catch (err) {
    console.error('❌ Error en PATCH:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = params
    console.log('📡 DELETE - Eliminando cotización ID:', id)
    
    const { error } = await supabaseAdmin
      .from('cotizaciones')
      .delete()
      .eq('id', parseInt(id))

    if (error) {
      console.error('❌ Error DELETE:', error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ success: true })
  } catch (err) {
    console.error('❌ Error en DELETE:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}