import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(req, { params }) {
  try {
    const { id } = params
    console.log('🔍 Buscando cotización ID:', id)

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
      console.error('❌ Error:', error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      console.error('❌ Cotización no encontrada')
      return Response.json({ error: 'Cotización no encontrada' }, { status: 404 })
    }

    console.log('✅ Cotización encontrada, cliente:', data.clientes?.email)
    return Response.json({ cotizacion: data })
  } catch (err) {
    console.error('❌ Error en GET:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}