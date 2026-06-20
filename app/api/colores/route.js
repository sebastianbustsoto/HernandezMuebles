import { supabaseAdmin } from '@/lib/supabaseAdmin'

// GET /api/colores
export async function GET(req) {
  const url = new URL(req.url)
  const categoria = url.searchParams.get('categoria')

  try {
    let query = supabaseAdmin
      .from('colores')
      .select('*')
      .order('orden', { ascending: true })

    if (categoria) {
      query = query.eq('categoria', categoria)
    }

    const { data, error } = await query

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ colores: data || [] })
  } catch (err) {
    return Response.json({ error: 'Error al obtener colores' }, { status: 500 })
  }
}
