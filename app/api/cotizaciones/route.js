import { supabaseAdmin } from '@/lib/supabaseAdmin'

// GET /api/cotizaciones - Listar cotizaciones
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

    if (error) {
      console.error('Error GET cotizaciones:', error)
      return Response.json({ error: 'Error al obtener cotizaciones' }, { status: 500 })
    }

    return Response.json({ 
      success: true,
      cotizaciones: data || [] 
    })
  } catch (err) {
    console.error('Error:', err)
    return Response.json({ error: 'Error al obtener cotizaciones' }, { status: 500 })
  }
}

// POST /api/cotizaciones - Crear cotización
export async function POST(req) {
  const body = await req.json()
  const {
    cliente_id, tipo_id, ancho, alto, prof, 
    material, color, color_hex, descripcion, adjunto_url
  } = body

  // Validaciones
  if (!cliente_id || !tipo_id) {
    return Response.json({ error: 'Cliente y tipo son requeridos' }, { status: 400 })
  }

  if (!ancho || !alto || !prof) {
    return Response.json({ error: 'Las medidas (ancho, alto, profundidad) son requeridas' }, { status: 400 })
  }

  if (ancho <= 0 || alto <= 0 || prof <= 0) {
    return Response.json({ error: 'Las medidas deben ser mayores a 0' }, { status: 400 })
  }

  if (!adjunto_url || adjunto_url.trim() === '') {
    return Response.json({ error: 'La imagen de referencia es obligatoria' }, { status: 400 })
  }

  try {
    // Generar código único - DDMMYY##
    const fecha = new Date()
    const dia = String(fecha.getDate()).padStart(2, '0')
    const mes = String(fecha.getMonth() + 1).padStart(2, '0')
    const anio = String(fecha.getFullYear()).slice(-2)
    const base = `${dia}${mes}${anio}`
    
    // Contar cotizaciones con este prefijo hoy
    const { data: existingCodes, error: countError } = await supabaseAdmin
      .from('cotizaciones')
      .select('codigo', { count: 'exact', head: true })
      .like('codigo', `${base}%`)

    if (countError) {
      console.error('Error contando códigos:', countError)
    }

    const num = (existingCodes?.length || 0) + 1
    const codigo = `${base}${String(num).padStart(2, '0')}`

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
        material: material?.trim() || '',
        color: color?.trim() || '',
        color_hex: color_hex?.trim() || '',
        descripcion: descripcion?.trim() || '',
        adjunto_url: adjunto_url.trim(),
        etapa_id: 1,
        chat_cerrado: false
      }])
      .select()
      .single()

    if (error) {
      console.error('Error al insertar cotización:', error)
      return Response.json({ error: 'Error al crear cotización' }, { status: 500 })
    }

    return Response.json({ 
      success: true,
      message: 'Cotización creada exitosamente',
      cotizacion: data 
    }, { status: 201 })
  } catch (err) {
    console.error('Error:', err)
    return Response.json({ error: 'Error al crear cotización' }, { status: 500 })
  }
}
