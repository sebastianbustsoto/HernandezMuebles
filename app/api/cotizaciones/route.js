import { supabaseAdmin } from '@/lib/supabaseAdmin'

// GET /api/cotizaciones — listar todas (admin) o del cliente actual (cliente)
export async function GET(req) {
  const url = new URL(req.url)
  const clienteId = url.searchParams.get('clienteId')

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
}

// POST /api/cotizaciones — crear nueva cotización
export async function POST(req) {
  const body = await req.json()
  const {
    cliente_id, tipo_id, tipo_otro, diseno_titulo,
    ancho, alto, prof, material, color, color_hex, color_textura, color_grain,
    descripcion, adjunto_url, codigo
  } = body

  if (!cliente_id || !tipo_id || !codigo || !adjunto_url || !ancho || !alto || !prof) {
    return Response.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('cotizaciones')
    .insert([{
      cliente_id: parseInt(cliente_id),
      codigo: codigo.toString(),
      tipo_id: parseInt(tipo_id),
      tipo_otro: tipo_otro || '',
      diseno_titulo: diseno_titulo || '',
      ancho: parseInt(ancho),
      alto: parseInt(alto),
      prof: parseInt(prof),
      material: material || '',
      color: color || '',
      color_hex: color_hex || '',
      color_textura: color_textura || '',
      color_grain: color_grain || '',
      descripcion: descripcion || '',
      adjunto_url: adjunto_url,
      etapa_id: 1,
      chat_cerrado: false,
    }])
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ cotizacion: data }, { status: 201 })
}
