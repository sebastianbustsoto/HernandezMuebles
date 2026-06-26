import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(req) {
  try {
    const url = new URL(req.url)
    const clienteId = url.searchParams.get('clienteId')

    let query = supabaseAdmin.from('cotizaciones').select(`
      *,
      clientes (
        id,
        nombres,
        apellidos,
        email,
        telefono
      )
    `).order('fecha', { ascending: false })

    if (clienteId) {
      query = query.eq('cliente_id', parseInt(clienteId))
    }

    const { data, error } = await query
    if (error) {
      console.error('❌ Error GET:', error)
      return Response.json({ error: error.message }, { status: 500 })
    }
    return Response.json({ cotizaciones: data || [] })
  } catch (err) {
    console.error('❌ Error en GET:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const body = await req.json()
    console.log('📥 Recibiendo cotización:', body)

    const {
      cliente_id,
      tipo_id,
      ancho,
      alto,
      prof,
      material,
      color,
      color_hex,
      color_textura,
      color_grain,
      descripcion,
      adjunto_url,
      tipo_otro,
      diseno_titulo
    } = body

    if (!cliente_id || !tipo_id || !ancho || !alto || !prof) {
      console.error('❌ Datos incompletos')
      return Response.json({ error: 'Faltan datos obligatorios' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('cotizaciones')
      .insert({
        cliente_id: parseInt(cliente_id),
        tipo_id: parseInt(tipo_id),
        ancho: parseInt(ancho),
        alto: parseInt(alto),
        prof: parseInt(prof),
        material: material || '',
        color: color || '',
        color_hex: color_hex || '',
        color_textura: color_textura || '',
        color_grain: color_grain || '',
        descripcion: descripcion || '',
        adjunto_url: adjunto_url || '',
        tipo_otro: tipo_otro || '',
        diseno_titulo: diseno_titulo || '',
        etapa_id: 1
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Error Supabase:', error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    console.log('✅ Cotización creada ID:', data.id)
    return Response.json({ cotizacion: data }, { status: 201 })

  } catch (err) {
    console.error('❌ Error POST:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}