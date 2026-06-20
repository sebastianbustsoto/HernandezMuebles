import { supabaseAdmin } from '@/lib/supabaseAdmin'

// PATCH /api/clientes/[id] — actualizar perfil o contraseña
export async function PATCH(req, { params }) {
  const { id } = params
  const { nombres, apellidos, telefono, oldPassword, newPassword } = await req.json()

  // Validar que el cliente existe
  const { data: cliente, error: clienteError } = await supabaseAdmin
    .from('clientes')
    .select('*')
    .eq('id', parseInt(id))
    .maybeSingle()

  if (clienteError || !cliente) {
    return Response.json({ error: 'Cliente no encontrado' }, { status: 404 })
  }

  // Si se solicita cambio de contraseña, validar la actual
  if (newPassword) {
    if (!oldPassword || cliente.password !== oldPassword) {
      return Response.json({ error: 'Contraseña actual incorrecta' }, { status: 401 })
    }
  }

  // Preparar datos a actualizar
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
