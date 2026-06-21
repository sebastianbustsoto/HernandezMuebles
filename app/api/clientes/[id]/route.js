import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(req, { params }) {
  try {
    const { id } = params
    const { data, error } = await supabaseAdmin
      .from('clientes')
      .select('*')
      .eq('id', parseInt(id))
      .maybeSingle()

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return Response.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    return Response.json({ cliente: data })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req, { params }) {
  const { id } = params
  const { nombres, apellidos, telefono, oldPassword, newPassword } = await req.json()

  const { data: cliente, error: clienteError } = await supabaseAdmin
    .from('clientes')
    .select('*')
    .eq('id', parseInt(id))
    .maybeSingle()

  if (clienteError || !cliente) {
    return Response.json({ error: 'Cliente no encontrado' }, { status: 404 })
  }

  if (newPassword) {
    if (!oldPassword || cliente.password !== oldPassword) {
      return Response.json({ error: 'Contraseña actual incorrecta' }, { status: 401 })
    }
  }

  const updates = {}
  if (nombres !== undefined) updates.nombres = nombres.trim()
  if (apellidos !== undefined) updates.apellidos = apellidos.trim()
  if (telefono !== undefined) updates.telefono = telefono.trim()
  if (newPassword) updates.password = newPassword

  if (Object.keys(updates).length === 0) {
    return Response.json({ error: 'No hay datos para actualizar' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('clientes')
    .update(updates)
    .eq('id', parseInt(id))
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ cliente: data })
}