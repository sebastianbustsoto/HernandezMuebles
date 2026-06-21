import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(req, { params }) {
  try {
    const { id } = params
    const { data, error } = await supabaseAdmin
      .from('mensajes')
      .select('*')
      .eq('cotizacion_id', parseInt(id))
      .order('fecha', { ascending: true })

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ mensajes: data || [] })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req, { params }) {
  try {
    const { id } = params
    const { autor, texto } = await req.json()

    const { data, error } = await supabaseAdmin
      .from('mensajes')
      .insert({
        cotizacion_id: parseInt(id),
        autor: autor,
        texto: texto
      })
      .select()
      .single()

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ mensaje: data }, { status: 201 })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
