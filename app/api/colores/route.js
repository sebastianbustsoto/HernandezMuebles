import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(req) {
  try {
    const url = new URL(req.url)
    const categoria = url.searchParams.get('categoria')

    let query = supabaseAdmin.from('colores').select('*').order('orden', { ascending: true })

    if (categoria) {
      query = query.eq('categoria', categoria)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error en API colores:', error)
      return Response.json({ error: error.message }, { status: 500 })
    }
    
    console.log('📦 API colores devuelve:', data?.length || 0, 'registros')
    return Response.json({ colores: data || [] })
  } catch (err) {
    console.error('Error en API colores:', err)
    return Response.json({ error: 'Error al obtener colores' }, { status: 500 })
  }
}