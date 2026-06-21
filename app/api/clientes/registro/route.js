import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req) {
  try {
    const { nombres, apellidos, email, password, telefono } = await req.json()

    const { data, error } = await supabaseAdmin
      .from('clientes')
      .insert({
        nombres: nombres,
        apellidos: apellidos,
        email: email.toLowerCase().trim(),
        password: password,
        telefono: telefono || '',
        is_admin: false
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return Response.json({ error: 'Email o teléfono duplicado' }, { status: 409 })
      }
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ cliente: data }, { status: 201 })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
