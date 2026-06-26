import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function PATCH(req, { params }) {
  try {
    const { id } = params
    const { nombres, apellidos, telefono, oldPassword, newPassword } = await req.json()

    console.log('📡 PATCH recibido para ID:', id)
    console.log('📦 Datos:', { nombres, apellidos, telefono, newPassword: newPassword ? '***' : undefined })

    const { data: cliente, error: clienteError } = await supabaseAdmin
      .from('clientes')
      .select('*')
      .eq('id', parseInt(id))
      .maybeSingle()

    if (clienteError) {
      console.error('❌ Error buscando cliente:', clienteError)
      return Response.json({ error: clienteError.message }, { status: 500 })
    }

    if (!cliente) {
      console.error('❌ Cliente no encontrado ID:', id)
      return Response.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    // Si es cambio de contraseña desde recuperación (sin oldPassword)
    if (newPassword && !oldPassword) {
      console.log('🔄 Actualizando contraseña sin oldPassword (recuperación)')
      const { data, error } = await supabaseAdmin
        .from('clientes')
        .update({ password: newPassword })
        .eq('id', parseInt(id))
        .select()
        .single()
      
      if (error) {
        console.error('❌ Error actualizando:', error)
        return Response.json({ error: error.message }, { status: 500 })
      }
      
      console.log('✅ Contraseña actualizada:', data.id)
      return Response.json({ cliente: data })
    }

    // Si es cambio de contraseña desde perfil (con oldPassword)
    if (newPassword && oldPassword) {
      if (cliente.password !== oldPassword) {
        return Response.json({ error: 'Contraseña actual incorrecta' }, { status: 401 })
      }
    }

    // Actualizar otros datos
    const updates = {}
    if (nombres !== undefined) updates.nombres = nombres.trim()
    if (apellidos !== undefined) updates.apellidos = apellidos.trim()
    if (telefono !== undefined) updates.telefono = telefono.trim()
    if (newPassword && oldPassword) updates.password = newPassword

    if (Object.keys(updates).length === 0) {
      return Response.json({ error: 'No hay datos para actualizar' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('clientes')
      .update(updates)
      .eq('id', parseInt(id))
      .select()
      .single()

    if (error) {
      console.error('❌ Error actualizando:', error)
      return Response.json({ error: error.message }, { status: 500 })
    }
    
    return Response.json({ cliente: data })
  } catch (err) {
    console.error('❌ Error en PATCH:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export async function GET(req, { params }) {
  try {
    const { id } = params
    console.log('📡 GET recibido para ID:', id)
    
    const { data, error } = await supabaseAdmin
      .from('clientes')
      .select('*')
      .eq('id', parseInt(id))
      .maybeSingle()

    if (error) {
      console.error('❌ Error:', error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      console.error('❌ Cliente no encontrado ID:', id)
      return Response.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    console.log('✅ Cliente encontrado:', data.id)
    return Response.json({ cliente: data })
  } catch (err) {
    console.error('❌ Error en GET:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}