import { supabaseAdmin } from '@/lib/supabaseAdmin'

// GET /api/precios — listar todos los precios generales
export async function GET(req) {
  const { data, error } = await supabaseAdmin
    .from('precios_generales')
    .select('*')

  if (error) return Response.json({ error: error.message }, { status: 500 })

  // Transformar array de {clave, valor} a un objeto {clave: valor}
  const precios = {}
  data?.forEach(item => {
    precios[item.clave] = item.valor
  })

  return Response.json({ precios })
}

// PATCH /api/precios — actualizar un precio
export async function PATCH(req) {
  const { clave, valor } = await req.json()

  if (!clave || valor === undefined) {
    return Response.json({ error: 'Clave y valor son requeridos' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('precios_generales')
    .update({ valor: parseInt(valor) })
    .eq('clave', clave)
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ precio: data })
}
