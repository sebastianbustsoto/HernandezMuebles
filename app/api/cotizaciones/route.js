import { supabaseAdmin } from '@/lib/supabaseAdmin'

// GET /api/cotizaciones
export async function GET(req) {
  const url = new URL(req.url)
  const clienteId = url.searchParams.get('clienteId')

  try {
    let query = supabaseAdmin
      .from('cotizaciones')
      .select('*')
      .order('fecha', { ascending: false })

    if (clienteId) {
      query = query.eq('cliente_id', parseInt(clienteId))
    }

    const { data, error } = await query

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ cotizaciones: data || [] })
  } catch (err) {
    return Response.json({ error: 'Error al obtener cotizaciones' }, { status: 500 })
  }
}

// POST /api/cotizaciones
export async function POST(req) {
  const body = await req.json()
  const {
    cliente_id, tipo_id, ancho, alto, prof, 
    material, color, color_hex, descripcion, adjunto_url
  } = body

  if (!cliente_id || !tipo_id || !adjunto_url || !ancho || !alto || !prof) {
    return Response.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  try {
    // Generar código único
    const fecha = new Date()
    const ddmm = String(fecha.getDate()).padStart(2, '0') + String(fecha.getMonth() + 1).padStart(2, '0')
    const yy = String(fecha.getFullYear()).slice(-2)
    
    const { count } = await supabaseAdmin
      .from('cotizaciones')
      .select('*', { count: 'exact', head: true })
      .like('codigo', `${ddmm}${yy}%`)

    const codigo = `${ddmm}${yy}${String((count || 0) + 1).padStart(2, '0')}`

    // Insertar cotización
    const { data, error } = await supabaseAdmin
      .from('cotizaciones')
      .insert([{
        cliente_id: parseInt(cliente_id),
        codigo: codigo,
        tipo_id: parseInt(tipo_id),
        ancho: parseInt(ancho),
        alto: parseInt(alto),
        prof: parseInt(prof),
        material: material || '',
        color: color || '',
        color_hex: color_hex || '',
        descripcion: descripcion || '',
        adjunto_url: adjunto_url,
        etapa_id: 1
      }])
      .select()
      .single()

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ cotizacion: data }, { status: 201 })
  } catch (err) {
    return Response.json({ error: 'Error al crear cotización' }, { status: 500 })
  }
}
