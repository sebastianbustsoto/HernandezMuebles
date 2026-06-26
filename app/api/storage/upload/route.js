import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const formData = await req.formData()
    const file = formData.get('file')
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    const timestamp = Date.now()
    const fileName = `cotizaciones/${timestamp}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
    
    const { data, error } = await supabaseAdmin.storage
      .from('adjuntos')
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Storage error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { data: urlData } = supabaseAdmin.storage
      .from('adjuntos')
      .getPublicUrl(fileName)

    return NextResponse.json({ 
      url: urlData.publicUrl,
      path: fileName 
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}