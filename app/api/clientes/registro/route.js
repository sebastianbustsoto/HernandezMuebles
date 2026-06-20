// app/api/clientes/registro/route.js
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req) {
  try {
    const { nombres, apellidos, email, password, telefono } = await req.json()

    if (!nombres || !apellidos || !email || !password) {
      return Response.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('clientes')
      .insert([{
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
        email: email.toLowerCase().trim(),
        password: password,
        telefono: (telefono || '').trim(),
        is_admin: false,
      }])
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return Response.json({ error: 'Este correo ya está registrado' }, { status: 409 })
      }
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ cliente: data }, { status: 201 })

  } catch (err) {
    console.error('Error en registro:', err)
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}