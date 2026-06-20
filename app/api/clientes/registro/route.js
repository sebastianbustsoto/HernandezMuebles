import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req) {
  const { nombres, apellidos, email, password, telefono } = await req.json()

  if (!nombres || !apellidos || !email || !password) {
    return Response.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  try {
    const emailLower = String(email).toLowerCase().trim()
    const telefonoLimpio = (telefono || '').trim()

    // Verificar email único
    const { data: existingEmail } = await supabaseAdmin
      .from('clientes')
      .select('id')
      .eq('email', emailLower)
      .single()

    if (existingEmail) {
      return Response.json({ error: 'Este correo ya está registrado' }, { status: 409 })
    }

    // Verificar teléfono único (si se proporciona)
    if (telefonoLimpio) {
      const { data: existingPhone } = await supabaseAdmin
        .from('clientes')
        .select('id')
        .eq('telefono', telefonoLimpio)
        .single()

      if (existingPhone) {
        return Response.json({ error: 'Este teléfono ya está registrado' }, { status: 409 })
      }
    }

    // Insertar nuevo cliente
    const { data, error } = await supabaseAdmin
      .from('clientes')
      .insert([{
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
        email: emailLower,
        password: password,
        telefono: telefonoLimpio,
        is_admin: false
      }])
      .select()
      .single()

    if (error) {
      return Response.json({ error: 'Error al registrar: ' + error.message }, { status: 500 })
    }

    return Response.json({
      success: true,
      cliente: {
        id: data.id,
        nombres: data.nombres,
        apellidos: data.apellidos,
        email: data.email,
        telefono: data.telefono,
        is_admin: data.is_admin
      }
    }, { status: 201 })
  } catch (err) {
    return Response.json({ error: 'Error al registrar' }, { status: 500 })
  }
}
