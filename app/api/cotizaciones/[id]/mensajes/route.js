import { supabaseAdmin } from '@/lib/supabaseAdmin'

// GET /api/cotizaciones/[id]/mensajes
export async function GET(req, { params }) {
  const { id } = params

  try {
    const { data, error } = await supabaseAdmin
      .from('mensajes')
      .select('*')
      .eq('cotizacion_id', parseInt(id))
      .order('fecha', { ascending: true })

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ mensajes: data || [] })
  } catch (err) {
    return Response.json({ error: 'Error al obtener mensajes' }, { status: 500 })
  }
}

// POST /api/cotizaciones/[id]/mensajes
export async function POST(req, { params }) {
  const { id } = params
  const { autor, texto } = await req.json()

  if (!autor || !texto) {
    return Response.json({ error: 'Autor y texto son requeridos' }, { status: 400 })
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('mensajes')
      .insert([{
        cotizacion_id: parseInt(id),
        autor: autor,
        texto: texto.trim()
      }])
      .select()
      .single()

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ mensaje: data }, { status: 201 })
  } catch (err) {
    return Response.json({ error: 'Error al agregar mensaje' }, { status: 500 })
  }
}
