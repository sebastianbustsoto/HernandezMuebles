import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req) {
  const { nombres, apellidos, email, password, telefono } = await req.json()

  // Validar campos requeridos
  if (!nombres || !nombres.trim()) {
    return Response.json({ error: 'El nombre es obligatorio' }, { status: 400 })
  }
  if (!apellidos || !apellidos.trim()) {
    return Response.json({ error: 'El apellido es obligatorio' }, { status: 400 })
  }
  if (!email || !email.trim()) {
    return Response.json({ error: 'El correo es obligatorio' }, { status: 400 })
  }
  if (!password || password.length < 4) {
    return Response.json({ error: 'La contraseña debe tener al menos 4 caracteres' }, { status: 400 })
  }

  try {
    const emailLower = String(email).toLowerCase().trim()
    const telefonoLimpio = (telefono || '').trim()

    // Verificar que email sea válido
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailLower)) {
      return Response.json({ error: 'El correo no es válido' }, { status: 400 })
    }

    // Verificar email único - PRIMERO
    const { data: existingEmail, error: emailError } = await supabaseAdmin
      .from('clientes')
      .select('id', { count: 'exact', head: true })
      .eq('email', emailLower)

    if (emailError && emailError.code !== 'PGRST116') {
      return Response.json({ error: 'Error al validar correo' }, { status: 500 })
    }

    if (existingEmail && existingEmail.length > 0) {
      return Response.json({ error: 'Este correo ya está registrado' }, { status: 409 })
    }

    // Verificar teléfono único (si se proporciona)
    if (telefonoLimpio) {
      const { data: existingPhone, error: phoneError } = await supabaseAdmin
        .from('clientes')
        .select('id', { count: 'exact', head: true })
        .eq('telefono', telefonoLimpio)

      if (phoneError && phoneError.code !== 'PGRST116') {
        return Response.json({ error: 'Error al validar teléfono' }, { status: 500 })
      }

      if (existingPhone && existingPhone.length > 0) {
        return Response.json({ error: 'Este teléfono ya está registrado' }, { status: 409 })
      }
    }

    // Insertar nuevo cliente - SIN email_verificado (no existe en schema actual)
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
      // Si da error de constraint UNIQUE, retornar mensaje específico
      if (error.code === '23505') {
        if (error.message.includes('email')) {
          return Response.json({ error: 'Este correo ya está registrado' }, { status: 409 })
        }
        if (error.message.includes('telefono')) {
          return Response.json({ error: 'Este teléfono ya está registrado' }, { status: 409 })
        }
      }
      return Response.json({ error: 'Error al registrar usuario' }, { status: 500 })
    }

    return Response.json({
      success: true,
      message: 'Usuario registrado exitosamente',
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
    console.error('Error en registro:', err)
    return Response.json({ error: 'Error al registrar usuario' }, { status: 500 })
  }
}
