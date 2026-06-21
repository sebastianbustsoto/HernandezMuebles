import { supabaseAdmin } from '@/lib/supabaseAdmin'

// GET /api/precios
export async function GET(req) {
  try {
    const { data, error } = await supabaseAdmin
      .from('precios_generales')
      .select('*')

    if (error) return Response.json({ error: error.message }, { status: 500 })

    const precios = {}
    data?.forEach(item => {
      precios[item.clave] = item.valor
    })

    return Response.json({ precios })
  } catch (err) {
    return Response.json({ error: 'Error al obtener precios' }, { status: 500 })
  }
}

// PATCH /api/precios
export async function PATCH(req) {
  const { clave, valor } = await req.json()

  if (!clave || valor === undefined) {
    return Response.json({ error: 'Clave y valor son requeridos' }, { status: 400 })
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('precios_generales')
      .update({ valor: parseInt(valor) })
      .eq('clave', clave)
      .select()
      .single()

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ precio: data })
  } catch (err) {
    return Response.json({ error: 'Error al actualizar precio' }, { status: 500 })
  }
}
