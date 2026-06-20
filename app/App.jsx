'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import emailjs from '@emailjs/browser'

/* ════════════════════════════════════════════════════════════
   EMAILJS CONFIG — Reemplaza con tus credenciales reales
   https://www.emailjs.com/
   ════════════════════════════════════════════════════════════ */
const EMAILJS_SERVICE_ID = 'service_kajlicg'
const EMAILJS_PUBLIC_KEY = 'yez38Ag9rM1ry57VY'

// Plantilla A — códigos OTP (registro y recuperar contraseña)
// Basada en "One-Time Password" de EmailJS: usa {{passcode}}, {{time}}, {{email}}
const EMAILJS_TEMPLATE_OTP = 'template_ce2v2df'

// Plantilla B — correos transaccionales con texto libre (cotización/presupuesto
// y confirmación de pedido). Plantilla simple: Subject = {{subject}}, To Email =
// {{to_email}}, Content = {{message}}
const EMAILJS_TEMPLATE_GENERAL = 'template_yryrapn'
const EMAILJS_FROM_EMAIL = 'noreply.hernandezmuebles@gmail.com'


// Alias para mantener compatibilidad con el resto del código
const EMAILJS_TEMPLATE_REGISTRO     = EMAILJS_TEMPLATE_OTP
const EMAILJS_TEMPLATE_RECUPERAR    = EMAILJS_TEMPLATE_OTP
const EMAILJS_TEMPLATE_COTIZACION   = EMAILJS_TEMPLATE_GENERAL
const EMAILJS_TEMPLATE_CONFIRMACION = EMAILJS_TEMPLATE_GENERAL

/* ════════════════════════════════════════════════════════════
   DATOS GLOBALES / CONSTANTES
   ════════════════════════════════════════════════════════════ */

const ADMIN_EMAIL    = 'joserhernandezmuebles@gmail.com'
const ADMIN_PASSWORD = '1234'

const ETAPAS = ['cotización', 'fabricación', 'entrega', 'entregado']
const ETAPA_LABEL = {
  cotización: 'Cotización', fabricación: 'Fabricación',
  entrega: 'Entrega', entregado: 'Entregado',
}
const ETAPA_COLOR = {
  cotización: '#1a1a1a', fabricación: '#333333',
  entrega: '#7a4f9a', entregado: '#2e7d32',
}

const CLIENTES_INIT = [
  { nombres: 'Cliente', apellidos: 'Demo', teléfono: '+56 9 0000 0000', email: 'cliente@demo.cl', password: '1234', isAdmin: false, emailVerificado: true },
  { nombres: 'José', apellidos: 'Hernández', teléfono: '+56 9 9999 9999', email: ADMIN_EMAIL, password: ADMIN_PASSWORD, isAdmin: true, emailVerificado: true },
]

const COTIZACIONES_INIT = [
  {
    id: 1, código: '1305CD00', estado: 'cotización',
    clienteEmail: 'cliente@demo.cl',
    nombre: 'Cliente Demo', email: 'cliente@demo.cl', número: '+56 9 0000 0000',
    tipo: 'Escritorio', tipoOtro: '', diseñoId: 'esc1', diseñoTitulo: 'Escritorio simple',
    dim: { ancho: 120, alto: 75, prof: 60 },
    material: 'Melamina 15 mm — Nogal terracota', color: 'Nogal terracota',
    colorHex: '#8b5e3c', colorTextura: 'forest', colorGrain: '#7a4e2c,#9b6e4c,#7a4e2c,#8b5e3a',
    descripción: 'Escritorio simple para oficina en casa.',
    adjunto: null, adjuntoBase64: null,
    fecha: new Date().toLocaleString('es-CL'),
    mensajes: [{ autor: 'sistema', texto: 'Solicitud recibida' }],
    chatCerrado: false,
  }
]

const PRECIOS_INIT = {
  melamina: {
    'Enebro':49990,'Arcilla':49990,'Grafito':48790,'Gris humo':49990,
    'Negro':48790,'Rojo':48790,'Blanco':39990,'Cedro':53090,'Cerezo':43839,
    'Coigüe':46790,'Coigüe chocolate':49990,'Peral':45990,'Espresso':52990,
    'Umbra':62690,'Morel':53790,'Cocoa':64090,'Nogal terracota':58490,
    'Roble rústico':54990,'Toscana':52990,'Roble cava':52990,
  },
  tapacanto: {
    'Enebro':7573,'Arcilla':9290,'Grafito':8390,'Gris humo':8390,
    'Negro':7390,'Rojo':9690,'Blanco':6190,'Cedro':9790,'Cerezo':9790,
    'Coigüe':9790,'Coigüe chocolate':11090,'Peral':9790,'Espresso':8590,
    'Umbra':9240,'Morel':7573,'Cocoa':8090,'Nogal terracota':8390,
    'Roble rústico':8390,'Toscana':8390,'Roble cava':8390,
  },
  mdf9: 48990, mdf18: 58190,
  tornillos: 2290, manillas: 0, ruedas: 0, bisagras: 0,
}

const MDF_GROSORES = ['MDF melamínico 9 mm (Blanco)', 'MDF melamínico 18 mm (Blanco)']

const MELAMINA_COLORES = {
  únicolores: [
    { nombre:'Enebro', hex:'#4a6741', texture:null, grain:null },
    { nombre:'Arcilla', hex:'#b8836a', texture:null, grain:null },
    { nombre:'Grafito', hex:'#4a4a52', texture:null, grain:null },
    { nombre:'Gris humo', hex:'#9a9a9e', texture:null, grain:null },
    { nombre:'Negro', hex:'#1c1c1e', texture:null, grain:null },
    { nombre:'Rojo', hex:'#b03030', texture:null, grain:null },
    { nombre:'Blanco', hex:'#f2f2f0', texture:null, grain:null },
  ],
  clasico: [
    { nombre:'Cedro', hex:'#8b4513', texture:'clasico', grain:'#7a3a0e,#9b5520,#7a3a0e,#a06030' },
    { nombre:'Cerezo', hex:'#9b3a2a', texture:'clasico', grain:'#8a2a1a,#b04a35,#8a2a1a,#a03828' },
    { nombre:'Coigüe', hex:'#c8a870', texture:'clasico', grain:'#b89058,#d8b880,#b89058,#c8a060' },
    { nombre:'Coigüe chocolate', hex:'#6b4226', texture:'clasico', grain:'#5a3018,#7b5232,#5a3018,#6b4220' },
    { nombre:'Peral', hex:'#d4b890', texture:'clasico', grain:'#c4a880,#e4c8a0,#c4a880,#d4b888' },
    { nombre:'Espresso', hex:'#3b2314', texture:'clasico', grain:'#2a1208,#4a3020,#2a1208,#3a2010' },
  ],
  forest: [
    { nombre:'Umbra', hex:'#5c4a32', texture:'forest', grain:'#4a3820,#6c5a42,#4a3820,#5c4a30' },
    { nombre:'Morel', hex:'#4a3728', texture:'forest', grain:'#3a2718,#5a4738,#3a2718,#4a3728' },
    { nombre:'Cocoa', hex:'#7b5c3a', texture:'forest', grain:'#6a4c28,#8b6c4a,#6a4c28,#7b5c38' },
    { nombre:'Nogal terracota', hex:'#8b5e3c', texture:'forest', grain:'#7a4e2c,#9b6e4c,#7a4e2c,#8b5e3a' },
    { nombre:'Roble rústico', hex:'#a0784a', texture:'forest', grain:'#906838,#b0885a,#906838,#a07848' },
    { nombre:'Toscana', hex:'#c4a882', texture:'forest', grain:'#b49872,#d4b892,#b49872,#c4a880' },
    { nombre:'Roble cava', hex:'#6b4e38', texture:'forest', grain:'#5a3e28,#7b5e48,#5a3e28,#6b4e36' },
  ],
}

/* ════════════════════════════════════════════════════════════
   UTILS
   ════════════════════════════════════════════════════════════ */
function getSaludo() {
  const h = new Date().getHours()
  return h < 12 ? 'días' : h < 19 ? 'tardes' : 'noches'
}
function generarCódigo(nombres, apellidos, número) {
  const n = new Date()
  const dd = String(n.getDate()).padStart(2, '0')
  const mm = String(n.getMonth() + 1).padStart(2, '0')
  const iN = (nombres || '').trim().charAt(0).toUpperCase()
  const iA = (apellidos || '').trim().charAt(0).toUpperCase()
  const digitos = String(número || '').replace(/\D/g, '').slice(-2)
  return dd + mm + iN + iA + digitos
}
function formatPhone(raw) {
  const prefix = '+56 9 '
  let d = String(raw || '').replace(/\D/g, '')
  if (d.startsWith('569')) d = d.slice(3)
  d = d.slice(0, 8)
  return prefix + d.slice(0, 4) + (d.length > 4 ? ' ' + d.slice(4, 8) : '')
}
function generarOTP() {
  return String(Math.floor(100000 + Math.random() * 900000))
}
function makeWoodTextureSVG(base, grain, size) {
  const s = size || 36
  const c = grain.split(',')
  const [c0, c1, c2, c3] = [c[0]||base, c[1]||base, c[2]||base, c[3]||base]
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
    <defs><linearGradient id="g0" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="${c0}"/><stop offset="28%" stop-color="${c1}"/>
    <stop offset="55%" stop-color="${c2}"/><stop offset="78%" stop-color="${c1}"/>
    <stop offset="100%" stop-color="${c3}"/></linearGradient></defs>
    <rect width="${s}" height="${s}" fill="url(#g0)"/>
    <line x1="0" y1="6" x2="${s}" y2="5" stroke="rgba(0,0,0,.07)" stroke-width="0.8"/>
    <line x1="0" y1="12" x2="${s}" y2="11" stroke="rgba(0,0,0,.05)" stroke-width="0.5"/>
    <line x1="0" y1="19" x2="${s}" y2="18" stroke="rgba(0,0,0,.08)" stroke-width="1"/>
    <line x1="0" y1="25" x2="${s}" y2="26" stroke="rgba(0,0,0,.05)" stroke-width="0.6"/>
    <line x1="0" y1="30" x2="${s}" y2="31" stroke="rgba(0,0,0,.06)" stroke-width="0.7"/>
    </svg>`
  return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)))
}

/* ════════════════════════════════════════════════════════════
   SVG MUEBLES
   ════════════════════════════════════════════════════════════ */
const _mc  = s => s ? '#1a1a1a' : '#c0c0c0'
const _bc  = s => s ? '#e4d0c0' : '#ebebeb'
const _fc  = s => s ? '#f8f0e8' : '#f5f5f5'
const _wd  = s => s ? '#d4b890' : '#e0e0e0'

const SVG_FNS = {
  escritorio_simple: s =>
    `<svg width="100" height="68" viewBox="0 0 100 68" xmlns="http:
      <rect x="3" y="16" width="94" height="9" rx="1" fill="${_wd(s)}" stroke="${_mc(s)}" stroke-width="1"/>
      <rect x="3" y="16" width="94" height="3" rx="1" fill="rgba(255,255,255,.4)"/>
      <rect x="3" y="25" width="10" height="38" rx="1" fill="${_bc(s)}" stroke="${_mc(s)}" stroke-width="1"/>
      <rect x="87" y="25" width="10" height="38" rx="1" fill="${_bc(s)}" stroke="${_mc(s)}" stroke-width="1"/>
    </svg>`,
  escritorio_repisas: s =>
    `<svg width="100" height="68" viewBox="0 0 100 68" xmlns="http:
      <rect x="3" y="14" width="94" height="8" rx="1" fill="${_wd(s)}" stroke="${_mc(s)}" stroke-width="1"/>
      <rect x="3" y="22" width="10" height="42" rx="1" fill="${_bc(s)}" stroke="${_mc(s)}" stroke-width="1"/>
      <rect x="72" y="22" width="25" height="42" rx="1" fill="${_fc(s)}" stroke="${_mc(s)}" stroke-width="1"/>
      <rect x="72" y="36" width="25" height="2" fill="${_mc(s)}" opacity=".5"/>
      <rect x="72" y="52" width="25" height="2" fill="${_mc(s)}" opacity=".5"/>
    </svg>`,
  escritorio_cajon: s =>
    `<svg width="100" height="68" viewBox="0 0 100 68" xmlns="http:
      <rect x="3" y="14" width="94" height="8" rx="1" fill="${_wd(s)}" stroke="${_mc(s)}" stroke-width="1"/>
      <rect x="3" y="22" width="10" height="42" rx="1" fill="${_bc(s)}" stroke="${_mc(s)}" stroke-width="1"/>
      <rect x="68" y="22" width="29" height="42" rx="2" fill="${_fc(s)}" stroke="${_mc(s)}" stroke-width="1"/>
      <rect x="70" y="25" width="25" height="12" rx="1" fill="${_bc(s)}" stroke="${_mc(s)}" stroke-width=".8"/>
      <rect x="80" y="30" width="10" height="2" rx="1" fill="${_mc(s)}"/>
      <rect x="70" y="40" width="25" height="20" rx="1" fill="${_bc(s)}" stroke="${_mc(s)}" stroke-width=".8"/>
      <rect x="80" y="49" width="10" height="2" rx="1" fill="${_mc(s)}"/>
    </svg>`,
  escritorio_pedestal: s =>
    `<svg width="100" height="68" viewBox="0 0 100 68" xmlns="http:
      <rect x="3" y="12" width="94" height="8" rx="1" fill="${_wd(s)}" stroke="${_mc(s)}" stroke-width="1"/>
      <rect x="3" y="20" width="10" height="44" rx="1" fill="${_bc(s)}" stroke="${_mc(s)}" stroke-width="1"/>
      <rect x="56" y="20" width="38" height="44" rx="2" fill="${_fc(s)}" stroke="${_mc(s)}" stroke-width="1"/>
      <rect x="58" y="23" width="34" height="9" rx="1" fill="${_bc(s)}" stroke="${_mc(s)}" stroke-width=".8"/>
      <rect x="70" y="27" width="12" height="2" rx="1" fill="${_mc(s)}"/>
      <rect x="58" y="35" width="34" height="9" rx="1" fill="${_bc(s)}" stroke="${_mc(s)}" stroke-width=".8"/>
      <rect x="70" y="39" width="12" height="2" rx="1" fill="${_mc(s)}"/>
      <rect x="58" y="47" width="34" height="14" rx="1" fill="${_bc(s)}" stroke="${_mc(s)}" stroke-width=".8"/>
      <rect x="70" y="53" width="12" height="2" rx="1" fill="${_mc(s)}"/>
    </svg>`,
  cocina_bajo: s =>
    `<svg width="100" height="68" viewBox="0 0 100 68" xmlns="http:
      <rect x="3" y="30" width="94" height="6" rx="1" fill="#d0d0d0" stroke="${_mc(s)}" stroke-width="1"/>
      <rect x="3" y="36" width="94" height="26" rx="2" fill="${_fc(s)}" stroke="${_mc(s)}" stroke-width="1"/>
      <rect x="5" y="39" width="26" height="9" rx="1" fill="${_bc(s)}" stroke="${_mc(s)}" stroke-width=".8"/>
      <rect x="15" y="43" width="8" height="2" rx="1" fill="${_mc(s)}"/>
      <rect x="5" y="51" width="44" height="8" rx="1" fill="${_bc(s)}" stroke="${_mc(s)}" stroke-width=".8"/>
      <circle cx="46" cy="55" r="2" fill="${_mc(s)}"/>
      <rect x="52" y="51" width="43" height="8" rx="1" fill="${_bc(s)}" stroke="${_mc(s)}" stroke-width=".8"/>
      <circle cx="52" cy="55" r="2" fill="${_mc(s)}"/>
    </svg>`,
  cocina_integral: s =>
    `<svg width="100" height="68" viewBox="0 0 100 68" xmlns="http:
      <rect x="3" y="4" width="42" height="24" rx="2" fill="${_fc(s)}" stroke="${_mc(s)}" stroke-width="1"/>
      <rect x="6" y="7" width="18" height="18" rx="1" fill="${_bc(s)}" stroke="${_mc(s)}" stroke-width=".8"/>
      <rect x="26" y="7" width="16" height="18" rx="1" fill="${_bc(s)}" stroke="${_mc(s)}" stroke-width=".8"/>
      <rect x="50" y="4" width="47" height="24" rx="2" fill="${_fc(s)}" stroke="${_mc(s)}" stroke-width="1"/>
      <rect x="53" y="7" width="41" height="18" rx="1" fill="${_bc(s)}" stroke="${_mc(s)}" stroke-width=".8"/>
      <rect x="3" y="30" width="94" height="5" rx="1" fill="#d0d0d0" stroke="${_mc(s)}" stroke-width="1"/>
      <rect x="3" y="35" width="94" height="28" rx="2" fill="${_fc(s)}" stroke="${_mc(s)}" stroke-width="1"/>
      <rect x="5" y="37" width="44" height="9" rx="1" fill="${_bc(s)}" stroke="${_mc(s)}" stroke-width=".8"/>
      <rect x="28" y="41" width="10" height="2" rx="1" fill="${_mc(s)}"/>
      <rect x="5" y="49" width="44" height="11" rx="1" fill="${_bc(s)}" stroke="${_mc(s)}" stroke-width=".8"/>
      <rect x="24" y="54" width="10" height="2" rx="1" fill="${_mc(s)}"/>
      <rect x="52" y="37" width="43" height="24" rx="1" fill="${_bc(s)}" stroke="${_mc(s)}" stroke-width=".8"/>
      <rect x="70" y="48" width="10" height="2" rx="1" fill="${_mc(s)}"/>
    </svg>`,
  cocina_torre: s =>
    `<svg width="100" height="68" viewBox="0 0 100 68" xmlns="http:
      <rect x="3" y="4" width="22" height="58" rx="2" fill="${_fc(s)}" stroke="${_mc(s)}" stroke-width="1"/>
      <rect x="5" y="7" width="18" height="24" rx="1" fill="${_bc(s)}" stroke="${_mc(s)}" stroke-width=".8"/>
      <rect x="9" y="19" width="10" height="2" rx="1" fill="${_mc(s)}"/>
      <rect x="5" y="34" width="18" height="24" rx="1" fill="${_bc(s)}" stroke="${_mc(s)}" stroke-width=".8"/>
      <rect x="9" y="45" width="10" height="2" rx="1" fill="${_mc(s)}"/>
      <rect x="28" y="4" width="69" height="22" rx="2" fill="${_fc(s)}" stroke="${_mc(s)}" stroke-width="1"/>
      <rect x="31" y="7" width="63" height="16" rx="1" fill="${_bc(s)}" stroke="${_mc(s)}" stroke-width=".8"/>
      <rect x="28" y="30" width="69" height="5" rx="1" fill="#d0d0d0" stroke="${_mc(s)}" stroke-width="1"/>
      <rect x="28" y="35" width="69" height="27" rx="2" fill="${_fc(s)}" stroke="${_mc(s)}" stroke-width="1"/>
      <rect x="30" y="38" width="30" height="20" rx="1" fill="${_bc(s)}" stroke="${_mc(s)}" stroke-width=".8"/>
      <circle cx="57" cy="48" r="2" fill="${_mc(s)}"/>
      <rect x="63" y="38" width="32" height="9" rx="1" fill="${_bc(s)}" stroke="${_mc(s)}" stroke-width=".8"/>
      <rect x="74" y="42" width="10" height="2" rx="1" fill="${_mc(s)}"/>
      <rect x="63" y="50" width="32" height="9" rx="1" fill="${_bc(s)}" stroke="${_mc(s)}" stroke-width=".8"/>
      <rect x="74" y="54" width="10" height="2" rx="1" fill="${_mc(s)}"/>
    </svg>`,
  cocina_esquinera: s =>
    `<svg width="100" height="68" viewBox="0 0 100 68" xmlns="http:
      <rect x="3" y="4" width="58" height="22" rx="2" fill="${_fc(s)}" stroke="${_mc(s)}" stroke-width="1"/>
      <rect x="6" y="7" width="24" height="16" rx="1" fill="${_bc(s)}" stroke="${_mc(s)}" stroke-width=".8"/>
      <rect x="33" y="7" width="25" height="16" rx="1" fill="${_bc(s)}" stroke="${_mc(s)}" stroke-width=".8"/>
      <rect x="3" y="28" width="58" height="5" rx="1" fill="#d0d0d0" stroke="${_mc(s)}" stroke-width="1"/>
      <rect x="3" y="33" width="58" height="28" rx="2" fill="${_fc(s)}" stroke="${_mc(s)}" stroke-width="1"/>
      <rect x="5" y="36" width="25" height="22" rx="1" fill="${_bc(s)}" stroke="${_mc(s)}" stroke-width=".8"/>
      <circle cx="27" cy="47" r="2" fill="${_mc(s)}"/>
      <rect x="64" y="28" width="33" height="5" rx="1" fill="#d0d0d0" stroke="${_mc(s)}" stroke-width="1"/>
      <rect x="64" y="33" width="33" height="28" rx="2" fill="${_fc(s)}" stroke="${_mc(s)}" stroke-width="1"/>
      <rect x="66" y="36" width="29" height="22" rx="1" fill="${_bc(s)}" stroke="${_mc(s)}" stroke-width=".8"/>
    </svg>`,
  banio_simple: s =>
    `<svg width="100" height="68" viewBox="0 0 100 68" xmlns="http:
      <rect x="10" y="38" width="80" height="24" rx="2" fill="${_fc(s)}" stroke="${_mc(s)}" stroke-width="1"/>
      <rect x="35" y="14" width="30" height="24" rx="1" fill="${_bc(s)}" stroke="${_mc(s)}" stroke-width=".8"/>
      <rect x="12" y="41" width="35" height="18" rx="1" fill="${_bc(s)}" stroke="${_mc(s)}" stroke-width=".8"/>
      <circle cx="47" cy="50" r="2" fill="${_mc(s)}"/>
      <rect x="50" y="41" width="37" height="18" rx="1" fill="${_bc(s)}" stroke="${_mc(s)}" stroke-width=".8"/>
      <circle cx="50" cy="50" r="2" fill="${_mc(s)}"/>
    </svg>`,
  banio_cajones: s =>
    `<svg width="100" height="68" viewBox="0 0 100 68" xmlns="http:
      <rect x="4" y="4" width="78" height="28" rx="2" fill="#cce0ee" stroke="${_mc(s)}" stroke-width="1" opacity=".8"/>
      <rect x="4" y="34" width="78" height="5" rx="1" fill="#d0d0d0" stroke="${_mc(s)}" stroke-width="1"/>
      <rect x="4" y="39" width="78" height="25" rx="2" fill="${_fc(s)}" stroke="${_mc(s)}" stroke-width="1"/>
      <rect x="7" y="42" width="72" height="9" rx="1" fill="${_bc(s)}" stroke="${_mc(s)}" stroke-width=".8"/>
      <rect x="40" y="46" width="12" height="2" rx="1" fill="${_mc(s)}"/>
      <rect x="7" y="54" width="72" height="8" rx="1" fill="${_bc(s)}" stroke="${_mc(s)}" stroke-width=".8"/>
      <rect x="40" y="57" width="12" height="2" rx="1" fill="${_mc(s)}"/>
    </svg>`,
  banio_wc: s =>
    `<svg width="100" height="68" viewBox="0 0 100 68" xmlns="http:
      <rect x="20" y="4" width="60" height="28" rx="2" fill="${_fc(s)}" stroke="${_mc(s)}" stroke-width="1"/>
      <rect x="23" y="7" width="27" height="22" rx="1" fill="${_bc(s)}" stroke="${_mc(s)}" stroke-width=".8"/>
      <rect x="34" y="17" width="6" height="5" rx="2" fill="${_mc(s)}"/>
      <rect x="53" y="7" width="24" height="22" rx="1" fill="${_bc(s)}" stroke="${_mc(s)}" stroke-width=".8"/>
      <rect x="61" y="17" width="6" height="5" rx="2" fill="${_mc(s)}"/>
      <rect x="20" y="34" width="60" height="8" rx="1" fill="${_bc(s)}" stroke="${_mc(s)}" stroke-width=".8"/>
      <rect x="38" y="44" width="24" height="20" rx="8" fill="#e8e8e8" stroke="#ccc"/>
      <rect x="44" y="44" width="12" height="8" rx="2" fill="#f0f0f0" stroke="#ccc"/>
    </svg>`,
  banio_módulo: s =>
    `<svg width="100" height="68" viewBox="0 0 100 68" xmlns="http:
      <rect x="4" y="4" width="56" height="28" rx="2" fill="#cce0ee" stroke="${_mc(s)}" stroke-width="1" opacity=".8"/>
      <rect x="4" y="34" width="56" height="5" rx="1" fill="#d0d0d0" stroke="${_mc(s)}" stroke-width="1"/>
      <rect x="4" y="39" width="56" height="25" rx="2" fill="${_fc(s)}" stroke="${_mc(s)}" stroke-width="1"/>
      <rect x="7" y="42" width="50" height="19" rx="1" fill="${_bc(s)}" stroke="${_mc(s)}" stroke-width=".8"/>
      <rect x="30" y="51" width="10" height="2" rx="1" fill="${_mc(s)}"/>
      <rect x="63" y="4" width="33" height="60" rx="2" fill="${_fc(s)}" stroke="${_mc(s)}" stroke-width="1"/>
      <rect x="65" y="7" width="29" height="20" rx="1" fill="${_bc(s)}" stroke="${_mc(s)}" stroke-width=".8"/>
      <rect x="65" y="35" width="29" height="20" rx="1" fill="${_bc(s)}" stroke="${_mc(s)}" stroke-width=".8"/>
      <rect x="65" y="57" width="29" height="5" rx="1" fill="${_bc(s)}" stroke="${_mc(s)}" stroke-width=".8"/>
    </svg>`,
}

const FURNITURE_CATALOG = {
  Escritorio: [
    { id:'esc1', title:'Escritorio simple',      desc:'Tablero amplio con dos laterales. Diseño limpio.', svgKey:'escritorio_simple' },
    { id:'esc2', title:'Con repisas',            desc:'Tablero con módulo de repisas abiertas.',          svgKey:'escritorio_repisas' },
    { id:'esc3', title:'Con cajón y módulo',     desc:'Tablero, cajón superior y puerta inferior.',       svgKey:'escritorio_cajon' },
    { id:'esc4', title:'Pedestal completo',      desc:'Tablero con pedestal de tres cajones.',            svgKey:'escritorio_pedestal' },
  ],
  Cocina: [
    { id:'coc1', title:'Módulo bajo',            desc:'Módulos bajos con cajones y puertas.',             svgKey:'cocina_bajo' },
    { id:'coc2', title:'Cocina integral',        desc:'Altos y bajos completos.',                         svgKey:'cocina_integral' },
    { id:'coc3', title:'Con torre',              desc:'Torre de alacena con módulos.',                    svgKey:'cocina_torre' },
    { id:'coc4', title:'Esquinera',              desc:'Diseño en L para rincones.',                       svgKey:'cocina_esquinera' },
  ],
  Baño: [
    { id:'ban1', title:'Vanitory simple',        desc:'Vanitory sencillo con puertas.',                   svgKey:'banio_simple' },
    { id:'ban2', title:'Con cajones',            desc:'Vanitory bajo mesón con cajones.',                 svgKey:'banio_cajones' },
    { id:'ban3', title:'Con WC integrado',       desc:'Módulo que incluye espacio para WC.',              svgKey:'banio_wc' },
    { id:'ban4', title:'Módulo completo',        desc:'Vanitory + columna lateral.',                      svgKey:'banio_módulo' },
  ],
}

/* ════════════════════════════════════════════════════════════
   COMPONENTES UI BASE
   ════════════════════════════════════════════════════════════ */

function Btn({ children, onClick, outline, small, full, danger, disabled, style = {} }) {
  const base = {
    background: danger ? '#c62828' : outline ? 'transparent' : '#1a1a1a',
    color: outline ? '#1a1a1a' : '#fff',
    border: outline ? '1.5px solid #1a1a1a' : 'none',
    padding: small ? '7px 11px' : '11px 20px',
    borderRadius: 10, cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: small ? 12 : 14, fontWeight: 700,
    width: full ? '100%' : 'auto', opacity: disabled ? 0.55 : 1,
    transition: 'background .15s', ...style,
  }
  return (
    <button disabled={disabled} onClick={onClick} style={base}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = danger ? '#b71c1c' : outline ? 'rgba(26,26,26,.12)' : '#000000' }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.background = danger ? '#c62828' : outline ? 'transparent' : '#1a1a1a' }}
    >{children}</button>
  )
}

function Field({ label, id, type = 'text', value, onChange, placeholder, invalid, disabled, rows, style = {} }) {
  const inputStyle = {
    width: '100%', padding: '10px 12px',
    border: `1px solid ${invalid ? '#c62828' : 'rgba(217,217,217,.7)'}`,
    borderRadius: 10, fontSize: 14,
    background: invalid ? 'rgba(255,235,238,.92)' : 'rgba(255,255,255,.70)',
    color: '#222', outline: 'none', boxSizing: 'border-box',
    boxShadow: invalid ? '0 0 0 3px rgba(198,40,40,.18)' : 'none',
    opacity: disabled ? 0.55 : 1, ...style,
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && <label htmlFor={id} style={{ fontSize: 12, fontWeight: 600, color: '#444' }}>{label}</label>}
      {rows
        ? <textarea id={id} value={value} onChange={onChange} placeholder={placeholder} rows={rows} disabled={disabled} style={{ ...inputStyle, resize: 'vertical' }} />
        : <input id={id} type={type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled} style={inputStyle} />
      }
    </div>
  )
}

function Card({ children, style = {}, warm, className = '' }) {
  return (
    <div className={className} style={{
      background: warm ? 'rgba(0,0,0,.18)' : 'rgba(255,255,255,.55)',
      border: warm ? '1px solid rgba(0,0,0,.30)' : '1px solid rgba(255,255,255,.60)',
      borderRadius: 16, backdropFilter: 'blur(8px)', ...style,
    }}>{children}</div>
  )
}

function Modal({ onClose, children, maxW = 440 }) {
  return (
    <div className="anim-overlay" onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
      <div className="anim-pop" style={{ background: 'rgba(255,255,255,.97)', borderRadius: 20, padding: 28, maxWidth: maxW, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,.2)', maxHeight: '90vh', overflowY: 'auto' }}>
        {children}
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   MODAL AUTH
   ════════════════════════════════════════════════════════════ */
function ModalAuth({ onClose, onLogin, onRegister, onResetPassword, clientes }) {
  const [tab, setTab] = useState('login')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPass, setLoginPass]   = useState('')
  const [err, setErr] = useState('')
  const [regNombres, setRegNombres]     = useState('')
  const [regApellidos, setRegApellidos] = useState('')
  const [regEmail, setRegEmail]         = useState('')
  const [regTel, setRegTel]             = useState('+56 9 ')
  const [regPass, setRegPass]           = useState('')
  const [regErr, setRegErr]             = useState('')

  // Verificación por correo
  const [verifying, setVerifying]   = useState(false)
  const [otpSent, setOtpSent]       = useState('')
  const [otpInputs, setOtpInputs]   = useState(['', '', '', '', '', ''])
  const [otpErr, setOtpErr]         = useState('')
  const [sending, setSending]       = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  // Recuperar contraseña
  const [forgotMode, setForgotMode] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotErr, setForgotErr]   = useState('')
  const [forgotSent, setForgotSent] = useState(false)
  const [forgotOtpSent, setForgotOtpSent] = useState('')
  const [forgotOtpInputs, setForgotOtpInputs] = useState(['', '', '', '', '', ''])
  const [forgotNewPass, setForgotNewPass]     = useState('')
  const [forgotNewPass2, setForgotNewPass2]   = useState('')
  const [forgotSending, setForgotSending]     = useState(false)
  const [forgotCooldown, setForgotCooldown]   = useState(0)
  const [forgotOk, setForgotOk]     = useState(false)

  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setInterval(() => setResendCooldown(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [resendCooldown])

  useEffect(() => {
    if (forgotCooldown <= 0) return
    const t = setInterval(() => setForgotCooldown(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [forgotCooldown])

  function doLogin() {
    const e = loginEmail.trim().toLowerCase(), p = loginPass.trim()
    if (!e || !p) { setErr('Completa todos los campos'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) { setErr('Ingresa un correo electrónico válido (debe contener @).'); return }
    const c = clientes.find(x => x.email === e && x.password === p)
    if (!c) { setErr('Correo o contraseña incorrectos'); return }
    onLogin(c)
  }

  function validateRegFields() {
    if (!regNombres.trim() || !regApellidos.trim() || !regEmail.trim() || !regPass.trim()) { setRegErr('Completa todos los campos'); return false }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail.trim())) { setRegErr('Ingresa un correo electrónico válido (debe contener @).'); return false }
    if (regPass.length < 4) { setRegErr('La contraseña debe tener al menos 4 carácteres'); return false }
    const e = regEmail.trim().toLowerCase()
    if (clientes.find(x => x.email === e)) { setRegErr('Este correo ya está registrado'); return false }
    return true
  }
  async function enviarCodigoOTP({
  destinatario,
  nombre,
  codigo,
  tiempo = '15 minutos',
  mensajePersonalizado = '',
  
  asunto = 'Código de verificación — Hernández Muebles'
}) {
  try {
    const mensajeBase = mensajePersonalizado || 'Hemos recibido tu solicitud.'
    
    const cuerpoMensaje = `Hola ${nombre},

${mensajeBase}

Tu código de verificación es:

${codigo}

Este código es válido por ${tiempo}.

Si no solicitaste esto, ignora este mensaje.

Hernández Muebles`

    const templateParams = {
      to_name: nombre,
      to_email: destinatario,
      from_name: 'Hernández Muebles',
      from_email: 'noreply.hernandezmuebles@gmail.com',
      reply_to: 'noreply.hernandezmuebles@gmail.com',
      subject: asunto,
      message: cuerpoMensaje,
      passcode: codigo,
      time: tiempo,
      codigo: codigo,
    }

    const response = await emailjs.send(
      'service_kajlicg',           // Service ID
      'template_ce2v2df',          // Template ID
      templateParams,
      'yez38Ag9rM1ry57VY'          // Public Key
    )
    
    console.log('✅ Email enviado:', response)
    return { success: true, response }
    
  } catch (err) {
    console.error('❌ EmailJS error:', err)
    return { success: false, error: err }
  }

}
  async function sendVerificationCode() {
  const code = generarOTP()
  setOtpSent(code)
  setOtpErr('')
  setSending(true)
  
  try {
    const resultado = await enviarCodigoOTP({
      destinatario: regEmail.trim().toLowerCase(),
      nombre: regNombres.trim(),
      codigo: code,
      tiempo: '15 minutos',
      mensajePersonalizado: 'Gracias por registrarte en Hernández Muebles.',
      asunto: 'Código de verificación — Hernández Muebles'
    })

    if (!resultado.success) {
      console.warn('Código de verificación:', code)
      alert(`⚠️ No se pudo enviar el email.\nTu código de prueba es: ${code}`)
    }
    
  } catch (err) {
    console.error('Error:', err)
    alert(`❌ Error. Tu código de prueba es: ${code}`)
  } finally {
    setSending(false)
    setResendCooldown(30)
  }
}

  async function doRegisterStart() {
    if (!validateRegFields()) return
    setRegErr('')
    setOtpInputs(['', '', '', '', '', ''])
    setVerifying(true)
    await sendVerificationCode()
  }

  function handleOtpChange(i, val) {
    const v = val.replace(/\D/g, '').slice(-1)
    setOtpInputs(prev => {
      const next = [...prev]; next[i] = v; return next
    })
    setOtpErr('')
    if (v && i < 5) {
      const nextEl = document.getElementById(`otp-${i + 1}`)
      nextEl?.focus()
    }
  }
  function handleOtpKeyDown(i, e) {
    if (e.key === 'Backspace' && !otpInputs[i] && i > 0) {
      document.getElementById(`otp-${i - 1}`)?.focus()
    }
  }

  function confirmOtp() {
    const code = otpInputs.join('')
    if (code.length !== 6) { setOtpErr('Ingresa los 6 dígitos del código.'); return }
    if (code !== otpSent) { setOtpErr('El código ingresado es incorrecto.'); return }
    onRegister({
      nombres: regNombres.trim(), apellidos: regApellidos.trim(),
      email: regEmail.trim().toLowerCase(), teléfono: regTel,
      password: regPass.trim(), isAdmin: false, emailVerificado: true,
    })
  }

  /* ── RECUPERAR CONTRASEÑA ── */
  async function sendForgotCode() {
  const e = forgotEmail.trim().toLowerCase()
  setForgotErr('')
  if (!e) { setForgotErr('Ingresa tu correo electrónico.'); return }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) { setForgotErr('Ingresa un correo electrónico válido.'); return }
  
  const cli = clientes.find(x => x.email === e)
  if (!cli) { setForgotErr('No encontramos una cuenta con ese correo.'); return }

  const code = generarOTP()
  setForgotOtpSent(code)
  setForgotOtpInputs(['', '', '', '', '', ''])
  setForgotSending(true)
  
  try {
    const resultado = await enviarCodigoOTP({
      destinatario: e,
      nombre: cli.nombres,
      codigo: code,
      tiempo: '15 minutos',
      mensajePersonalizado: 'Recibimos una solicitud para restablecer tu contraseña.',
      asunto: 'Recupera tu contraseña — Hernández Muebles'
    })

    if (!resultado.success) {
      console.warn('Código de recuperación:', code)
      alert(`⚠️ No se pudo enviar el email.\nTu código de prueba es: ${code}`)
    }
    
    setForgotSent(true)
    
  } catch (err) {
    console.error('Error:', err)
    setForgotErr('No se pudo enviar el correo. Intenta nuevamente.')
  } finally {
    setForgotSending(false)
    setForgotCooldown(30)
  }
}

  function handleForgotOtpChange(i, val) {
    const v = val.replace(/\D/g, '').slice(-1)
    setForgotOtpInputs(prev => { const next = [...prev]; next[i] = v; return next })
    setForgotErr('')
    if (v && i < 5) document.getElementById(`forgot-otp-${i + 1}`)?.focus()
  }
  function handleForgotOtpKeyDown(i, e) {
    if (e.key === 'Backspace' && !forgotOtpInputs[i] && i > 0) document.getElementById(`forgot-otp-${i - 1}`)?.focus()
  }

  function confirmResetPassword() {
    const code = forgotOtpInputs.join('')
    if (code.length !== 6) { setForgotErr('Ingresa los 6 dígitos del código.'); return }
    if (code !== forgotOtpSent) { setForgotErr('El código ingresado es incorrecto.'); return }
    if (forgotNewPass.length < 4) { setForgotErr('La nueva contraseña debe tener al menos 4 carácteres.'); return }
    if (forgotNewPass !== forgotNewPass2) { setForgotErr('Las contraseñas no coinciden.'); return }
    setForgotErr('')
    onResetPassword(forgotEmail.trim().toLowerCase(), forgotNewPass)
    setForgotOk(true)
  }

  function backToLogin() {
    setForgotMode(false); setForgotSent(false); setForgotOk(false)
    setForgotEmail(''); setForgotErr(''); setForgotNewPass(''); setForgotNewPass2('')
    setForgotOtpInputs(['', '', '', '', '', ''])
  }

  const Tab = ({ id, label }) => (
    <button onClick={() => { setTab(id); setErr(''); setRegErr(''); setVerifying(false) }} style={{
      flex: 1, padding: 8, border: 'none', borderRadius: 8, cursor: 'pointer',
      fontSize: 12, fontWeight: 700,
      background: tab === id ? '#1a1a1a' : 'transparent',
      color: tab === id ? '#fff' : '#666', transition: 'all .2s',
    }}>{label}</button>
  )

  /* ── RECUPERAR CONTRASEÑA ── */
  if (forgotMode) {
    if (forgotOk) {
      return (
        <Modal onClose={onClose}>
          <div className="anim-fade-up" style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 10 }}>✅</div>
            <h3 style={{ fontSize: 19, marginBottom: 8 }}>Contraseña actualizada</h3>
            <p style={{ fontSize: 13, color: '#666', marginBottom: 20, lineHeight: 1.6 }}>
              Tu contraseña fue restablecida correctamente. Ya puedes iniciar sesión con tu nueva contraseña.
            </p>
            <Btn full onClick={backToLogin}>Ir a iniciar sesión</Btn>
          </div>
        </Modal>
      )
    }

    return (
      <Modal onClose={onClose}>
        <div className="anim-fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 20, fontWeight: 800 }}>Recuperar contraseña</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#888' }}>✕</button>
        </div>

        {!forgotSent ? (
          <div className="anim-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 10 }}>
            <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>
              Ingresa el correo con el que te registraste. Te enviaremos un código de 6 dígitos para crear una nueva contraseña.
            </p>
            {forgotErr && <div className="anim-shake" style={{ background: 'rgba(198,40,40,.1)', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: '#c62828' }}>{forgotErr}</div>}
            <Field label="Correo electrónico" type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="correo@ejemplo.cl" />
            <Btn full onClick={sendForgotCode} disabled={forgotSending}>{forgotSending ? 'Enviando código...' : 'Enviar código'}</Btn>
            <button onClick={backToLogin} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1a1a1a', fontWeight: 700, fontSize: 12, alignSelf: 'center' }}>← Volver a iniciar sesión</button>
          </div>
        ) : (
          <div className="anim-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 10 }}>
            <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>
              Enviamos un código de 6 dígitos a <b>{forgotEmail.trim().toLowerCase()}</b>. Ingrésalo junto con tu nueva contraseña.
            </p>
            <div className={`otp-row${forgotErr ? ' anim-shake' : ''}`}>
              {forgotOtpInputs.map((v, i) => (
                <input key={i} id={`forgot-otp-${i}`} className="otp-box" maxLength={1} inputMode="numeric"
                  value={v} onChange={e => handleForgotOtpChange(i, e.target.value)}
                  onKeyDown={e => handleForgotOtpKeyDown(i, e)} autoFocus={i === 0} />
              ))}
            </div>
            <Field label="Nueva contraseña" type="password" value={forgotNewPass} onChange={e => setForgotNewPass(e.target.value)} placeholder="Mínimo 4 carácteres" />
            <Field label="Confirmar nueva contraseña" type="password" value={forgotNewPass2} onChange={e => setForgotNewPass2(e.target.value)} placeholder="••••" />
            {forgotErr && <div className="anim-shake" style={{ background: 'rgba(198,40,40,.1)', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: '#c62828' }}>{forgotErr}</div>}
            <Btn full onClick={confirmResetPassword}>Restablecer contraseña</Btn>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
              <button onClick={backToLogin} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1a1a1a', fontWeight: 700, fontSize: 12 }}>← Volver</button>
              <button onClick={sendForgotCode} disabled={forgotSending || forgotCooldown > 0}
                style={{ background: 'none', border: 'none', cursor: forgotCooldown > 0 ? 'default' : 'pointer', color: forgotCooldown > 0 ? '#aaa' : '#1a1a1a', fontWeight: 700, fontSize: 12 }}>
                {forgotSending ? 'Enviando...' : forgotCooldown > 0 ? `Reenviar (${forgotCooldown}s)` : 'Reenviar código'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    )
  }

  /* ── PANTALLA DE VERIFICACIÓN ── */
  if (verifying) {
    return (
      <Modal onClose={onClose}>
        <div className="anim-fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 20, fontWeight: 800 }}>Verifica tu correo</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#888' }}>✕</button>
        </div>
        <p className="anim-fade-up" style={{ fontSize: 13, color: '#666', marginBottom: 18, lineHeight: 1.6 }}>
          Enviamos un código de 6 dígitos a <b>{regEmail.trim().toLowerCase()}</b>. Ingrésalo para activar tu cuenta.
        </p>
        <div className={`anim-fade-up otp-row${otpErr ? ' anim-shake' : ''}`} style={{ marginBottom: 14 }}>
          {otpInputs.map((v, i) => (
            <input key={i} id={`otp-${i}`} className="otp-box" maxLength={1} inputMode="numeric"
              value={v} onChange={e => handleOtpChange(i, e.target.value)}
              onKeyDown={e => handleOtpKeyDown(i, e)} autoFocus={i === 0} />
          ))}
        </div>
        {otpErr && <div className="anim-fade-up" style={{ background: 'rgba(198,40,40,.1)', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: '#c62828', marginBottom: 12 }}>{otpErr}</div>}
        <div className="anim-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Btn full onClick={confirmOtp}>Verificar y crear cuenta</Btn>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#888' }}>
            <button onClick={() => setVerifying(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1a1a1a', fontWeight: 700, fontSize: 12 }}>← Volver</button>
            <button onClick={sendVerificationCode} disabled={sending || resendCooldown > 0}
              style={{ background: 'none', border: 'none', cursor: resendCooldown > 0 ? 'default' : 'pointer', color: resendCooldown > 0 ? '#aaa' : '#1a1a1a', fontWeight: 700, fontSize: 12 }}>
              {sending ? 'Enviando...' : resendCooldown > 0 ? `Reenviar (${resendCooldown}s)` : 'Reenviar código'}
            </button>
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <Modal onClose={onClose}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 20, fontWeight: 800 }}>Acceso</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#888' }}>✕</button>
      </div>
      <div style={{ display: 'flex', gap: 4, background: 'rgba(0,0,0,.06)', borderRadius: 10, padding: 4, marginBottom: 16 }}>
        <Tab id="login" label="Iniciar sesión" />
        <Tab id="register" label="Registrarse" />
      </div>

      {tab === 'login' && (
        <div className="anim-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: 'rgba(26,26,26,.12)', border: '1px solid rgba(26,26,26,.25)', borderRadius: 8, padding: '10px 12px', fontSize: 12, lineHeight: 1.5 }}>
            💡 <b>Demo:</b> cliente@demo.cl · Contraseña: 1234
          </div>
          {err && <div className="anim-shake" style={{ background: 'rgba(198,40,40,.1)', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: '#c62828' }}>{err}</div>}
          <Field label="Correo electrónico" type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="correo@ejemplo.cl" />
          <Field label="Contraseña" type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)} placeholder="••••" />
          <button onClick={() => setForgotMode(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1a1a1a', fontWeight: 700, fontSize: 12, alignSelf: 'flex-end', marginTop: -6 }}>¿Olvidaste tu contraseña?</button>
          <Btn full onClick={doLogin}>Iniciar sesión</Btn>
          <p style={{ textAlign: 'center', fontSize: 13, color: '#666' }}>
            ¿No tienes cuenta? <a href="#" onClick={e => { e.preventDefault(); setTab('register') }} style={{ color: '#1a1a1a', fontWeight: 700 }}>Regístrate</a>
          </p>
        </div>
      )}

      {tab === 'register' && (
        <div className="anim-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {regErr && <div className="anim-shake" style={{ background: 'rgba(198,40,40,.1)', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: '#c62828' }}>{regErr}</div>}
          <Field label="Nombres" value={regNombres} onChange={e => setRegNombres(e.target.value)} placeholder="Ej: Juan Carlos" />
          <Field label="Apellidos" value={regApellidos} onChange={e => setRegApellidos(e.target.value)} placeholder="Ej: Pérez González" />
          <Field label="Correo electrónico" type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="correo@ejemplo.cl" />
          <Field label="Teléfono" value={regTel} onChange={e => setRegTel(formatPhone(e.target.value))} placeholder="+56 9 1234 5678" />
          <Field label="Contraseña" type="password" value={regPass} onChange={e => setRegPass(e.target.value)} placeholder="Mínimo 4 carácteres" />
          <Btn full onClick={doRegisterStart} disabled={sending}>{sending ? 'Enviando código...' : 'Crear cuenta'}</Btn>
          <p style={{ textAlign: 'center', fontSize: 13, color: '#666' }}>
            ¿Ya tienes cuenta? <a href="#" onClick={e => { e.preventDefault(); setTab('login') }} style={{ color: '#1a1a1a', fontWeight: 700 }}>Inicia sesión</a>
          </p>
        </div>
      )}
    </Modal>
  )
}

/* ════════════════════════════════════════════════════════════
   NAV
   ════════════════════════════════════════════════════════════ */
function Nav({ currentUser, onShowAuth, onLogout, onGoHome, onGoPerfil, onGoPedidos, onGoAdmin }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  return (
    <nav style={{ height: 82, padding: '0 26px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(205,205,205,.5)', background: 'rgba(255,255,255,.35)', borderRadius: '16px 16px 0 0', backdropFilter: 'blur(8px)', position: 'relative', zIndex: 300 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <a href="#" onClick={e => { e.preventDefault(); onGoHome() }} style={{ width: 42, height: 42, background: '#1a1a1a', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', textDecoration: 'none' }}>
          <img src="/LOGO_LANDING.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; e.target.parentElement.textContent = '🪵' }} />
        </a>
        <span style={{ fontSize: 26, fontWeight: 800 }}>Hernández Muebles</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <span onClick={() => window.open('mailto:joserhernandezmuebles@gmail.com')} style={{ textDecoration: 'none', color: '#2a2a2a', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Contacto</span>
        {!currentUser
          ? <Btn outline onClick={onShowAuth}><span style={{ fontSize: 18 }}>👤</span> Iniciar sesión</Btn>
          : (
            <div ref={ref} style={{ position: 'relative' }}>
              <button onClick={() => setOpen(o => !o)} style={{ background: 'rgba(26,26,26,.15)', border: 'none', cursor: 'pointer', width: 38, height: 38, borderRadius: '50%', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</button>
              {open && (
                <div style={{ position: 'absolute', right: 0, top: 46, minWidth: 210, background: 'rgba(255,255,255,.97)', border: '1px solid rgba(221,221,221,.8)', borderRadius: 10, padding: 8, zIndex: 600, boxShadow: '0 8px 24px rgba(0,0,0,.18)' }}>
                  <div style={{ padding: '8px 10px 6px', fontSize: 13, fontWeight: 700, color: '#555', borderBottom: '1px solid #eee', marginBottom: 4 }}>
                    {currentUser.nombres} {currentUser.apellidos}
                    {currentUser.isAdmin && <span style={{ marginLeft: 6, fontSize: 10, background: '#1a1a1a', color: '#fff', padding: '2px 6px', borderRadius: 4 }}>Admin</span>}
                  </div>
                  {[
                    { icon: '👤', label: 'Perfil',            fn: () => { setOpen(false); onGoPerfil() } },
                    { icon: '📋', label: 'Mis cotizaciones',   fn: () => { setOpen(false); onGoPedidos() } },
                    ...(currentUser.isAdmin ? [{ icon: '⚙️', label: 'Panel administrativo', fn: () => { setOpen(false); onGoAdmin() } }] : []),
                  ].map(({ icon, label, fn }) => (
                    <button key={label} onClick={fn} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '9px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 14, display: 'flex', gap: 8 }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(247,239,232,.9)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >{icon} {label}</button>
                  ))}
                  <div style={{ borderTop: '1px solid #eee', marginTop: 4, paddingTop: 4 }}>
                    <button onClick={() => { setOpen(false); onLogout() }} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '9px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 14, color: '#b00020', display: 'flex', gap: 8 }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(247,239,232,.9)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >🚪 Cerrar sesión</button>
                  </div>
                </div>
              )}
            </div>
          )
        }
      </div>
    </nav>
  )
}

/* ════════════════════════════════════════════════════════════
   PAGE HOME
   ════════════════════════════════════════════════════════════ */
function PageHome(props) {
  return (
    <Card>
      <Nav {...props} />

      {/* ── HERO ── */}
      <section className="hero-elegant">
        <div className="hero-overlay" />
        <div className="hero-content anim-pop">
          <p className="anim-fade-up hero-kicker" style={{ animationDelay: '.05s' }}>Carpintería artesanal · Hecho a mano</p>
          <h1 className="anim-fade-up hero-title-elegant" style={{ animationDelay: '.15s' }}>Muebles a medida<br />para tu hogar</h1>
          <p className="anim-fade-up hero-sub" style={{ animationDelay: '.25s' }}>
            Diseño, materiales y terminaciones pensados para tu espacio. Cotiza en minutos y recibe un mueble hecho exclusivamente para ti.
          </p>
        </div>
      </section>

      {/* ── CARACTERÍSTICAS ── */}
      <section style={{ padding: '54px 28px 60px' }}>
        <div className="anim-fade-up" style={{ textAlign: 'center', marginBottom: 38 }}>
          <p style={{ fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', color: '#999', fontWeight: 700, marginBottom: 8 }}>Nuestro proceso</p>
          <h2 style={{ fontSize: 'clamp(22px,3.4vw,32px)', color: '#1a1a1a', fontWeight: 800 }}>Simple, transparente y a tu medida</h2>
        </div>
        <div className="feature-grid">
          {[
            { icon: '✏️', title: 'Cotiza online', text: 'Selecciona el tipo de mueble, sus medidas y materiales en un par de minutos.' },
            { icon: '🪵', title: 'Materiales premium', text: 'Melamina y MDF de alta densidad, con una amplia paleta de colores y texturas.' },
            { icon: '🤝', title: 'Seguimiento real', text: 'Sigue cada etapa de tu pedido desde la cotización hasta la entrega final.' },
          ].map((f, i) => (
            <div key={f.title} className="feature-card anim-fade-up" style={{ animationDelay: `${.1 + i * .12}s` }}>
              <div className="feature-icon">{f.icon}</div>
              <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 6, color: '#1a1a1a' }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="cta-elegant anim-fade-up">
        <h2 style={{ fontSize: 'clamp(20px,3vw,28px)', fontWeight: 800, marginBottom: 10 }}>¿Listo para tu próximo mueble?</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,.7)', marginBottom: 22, maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
          Cuéntanos qué necesitas y te enviaremos una cotización personalizada sin compromiso.
        </p>
        <button className="hero-btn-primary" style={{ background: '#fff', color: '#111' }} onClick={props.onCotizar}>Comenzar cotización</button>
      </section>
    </Card>
  )
}


/* ════════════════════════════════════════════════════════════
   MODAL COTIZAR — diseño moderno (2 pasos)
   ════════════════════════════════════════════════════════════ */
const TIPOS_MUEBLE = ['Escritorio', 'Cocina', 'Baño', 'Otro']

function ModalCotizar({ currentUser, onClose, onSubmit }) {
  const initial = {
    tipo: '', tipoOtro: '',
    largo: '', ancho: '', prof: '',
    material: '', mdfTipo: MDF_GROSORES[0], colorMel: null,
    comentarios: '', file: null, filePreview: null,
  }
  const [data, setData]   = useState(initial)
  const [step, setStep]   = useState('form') // 'form' | 'resumen' | 'done'
  const [err, setErr]     = useState('')
  const [lastCot, setLastCot] = useState(null)
  const [resetting, setResetting] = useState(false)

  const set = (k, v) => setData(prev => ({ ...prev, [k]: v }))

  function handleReset() {
    setResetting(true)
    setData(initial)
    setErr('')
    setTimeout(() => setResetting(false), 500)
  }

  function handleFile(e) {
    const f = e.target.files[0]
    if (!f) return
    const ok = ['image/png', 'image/jpeg']
    if (!ok.includes(f.type)) { setErr('Solo se aceptan imágenes PNG o JPG.'); return }
    if (f.size > 5 * 1024 * 1024) { setErr('La imagen supera 5 MB.'); return }
    setErr('')
    const reader = new FileReader()
    reader.onload = ev => setData(prev => ({ ...prev, file: f, filePreview: ev.target.result }))
    reader.readAsDataURL(f)
  }
  function removeFile() { setData(prev => ({ ...prev, file: null, filePreview: null })) }

  function materialLabel() {
    if (!data.material) return '—'
    if (data.material === 'Melamina') return data.colorMel ? `Melamina 15 mm — ${data.colorMel.nombre}` : 'Melamina 15 mm'
    return data.mdfTipo
  }

  function goResumen() {
    if (!data.tipo) { setErr('Selecciona un tipo de mueble.'); return }
    if (data.tipo === 'Otro' && !data.tipoOtro.trim()) { setErr('Especifica el tipo de mueble.'); return }
    if (!data.filePreview) { setErr('Debes adjuntar una imagen de referencia. Es obligatoria.'); return }
    if (!data.largo || !data.ancho || !data.prof) { setErr('Completa las medidas (largo, ancho y altura).'); return }
    if (!data.material) { setErr('Selecciona un material.'); return }
    if (data.material === 'Melamina' && !data.colorMel) { setErr('Selecciona un color de melamina.'); return }
    setErr(''); setStep('resumen')
  }

  function handleSubmit() {
    const tipoFinal = data.tipo === 'Otro' ? data.tipoOtro.trim() : data.tipo
    const número = currentUser?.teléfono || ''
    const nueva = {
      id: Date.now(),
      código: generarCódigo(currentUser?.nombres, currentUser?.apellidos, número),
      estado: 'cotización',
      clienteEmail: (currentUser?.email || '').toLowerCase(),
      nombre: `${currentUser?.nombres || ''} ${currentUser?.apellidos || ''}`.trim(),
      email: (currentUser?.email || '').toLowerCase(),
      número, tipo: tipoFinal, tipoOtro: data.tipoOtro,
      diseñoId: '', diseñoTitulo: data.tipo === 'Otro' ? 'Mueble personalizado (ver imagen adjunta)' : '',
      dim: { ancho: Number(data.largo) || 0, alto: Number(data.ancho) || 0, prof: Number(data.prof) || 0 },
      material: materialLabel(), color: data.colorMel?.nombre || '',
      colorHex: data.colorMel?.hex || '', colorTextura: data.colorMel?.texture || null, colorGrain: data.colorMel?.grain || null,
      descripción: data.comentarios,
      adjunto: data.file ? { nombre: data.file.name, tipo: data.file.type, size: data.file.size } : null,
      adjuntoBase64: data.filePreview || null,
      fecha: new Date().toLocaleString('es-CL'),
      mensajes: [{ autor: 'sistema', texto: 'Solicitud recibida' }],
      chatCerrado: false,
    }
    onSubmit(nueva)
    setLastCot(nueva)
    setStep('done')
  }

  /* ── PASO: ÉXITO ── */
  if (step === 'done' && lastCot) {
    return (
      <div className="cz-overlay anim-overlay">
        <div className="cz-shell anim-pop" style={{ maxWidth: 560 }}>
          <div className="cz-topbar">
            <div />
            <button className="cz-icon-btn" onClick={onClose} title="Cerrar">✕</button>
          </div>
          <div className="cz-body anim-fade-up" style={{ textAlign: 'center', padding: '10px 24px 30px' }}>
            <div style={{ fontSize: 52, marginBottom: 10 }}>✅</div>
            <h3 style={{ fontSize: 22, marginBottom: 6, color: '#222222' }}>¡Cotización enviada!</h3>
            <p style={{ color: '#666', marginBottom: 18, fontSize: 14 }}>Tu solicitud fue recibida. Te contactaremos pronto.</p>
            <div className="cz-summary-card" style={{ textAlign: 'left', marginBottom: 18 }}>
              <div className="cz-summary-row"><span>Código</span><b style={{ color: '#1a1a1a' }}>{lastCot.código}</b></div>
              <div className="cz-summary-row"><span>Tipo</span><b>{lastCot.tipo}</b></div>
              <div className="cz-summary-row"><span>Medidas</span><b>{lastCot.dim.ancho} × {lastCot.dim.alto} × {lastCot.dim.prof} cm</b></div>
              <div className="cz-summary-row"><span>Material</span><b>{lastCot.material}</b></div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="cz-btn cz-btn-primary" onClick={onClose}>Volver al inicio</button>
              <button className="cz-btn cz-btn-ghost" onClick={async () => {
                try {
                  const res = await fetch('/api/pdf/cotizacion', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(lastCot) })
                  if (!res.ok) throw new Error('Error al generar PDF')
                  const blob = await res.blob()
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a'); a.href = url; a.download = `COTIZACION_${lastCot.código}.pdf`; a.click(); URL.revokeObjectURL(url)
                } catch (e) { alert('No se pudo generar el PDF: ' + e.message) }
              }}>⬇ Descargar PDF</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const dimsLabels = [['largo', 'Largo'], ['ancho', 'Ancho'], ['prof', 'Altura']]

  return (
    <div className="cz-overlay anim-overlay">
      <div className="cz-shell anim-pop">
        <div className="cz-topbar">
          <button className="cz-icon-btn" onClick={() => step === 'resumen' ? setStep('form') : onClose()} title="Volver">←</button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className={`cz-icon-btn${resetting ? ' spinning' : ''}`} onClick={handleReset} title="Reiniciar formulario">⟲</button>
            <button className="cz-icon-btn" onClick={onClose} title="Cerrar">✕</button>
          </div>
        </div>

        {err && (
          <div className="anim-shake" style={{ margin: '0 24px 12px', background: 'rgba(198,40,40,.1)', color: '#c62828', borderRadius: 10, padding: '10px 14px', fontSize: 13, fontWeight: 600 }}>
            {err}
          </div>
        )}

        <div className="cz-body">
          {step === 'form' && (
            <div className="cz-grid">
              {/* ── Selector de tipo ── */}
              <div className="anim-slide-l cz-tipo-list">
                {TIPOS_MUEBLE.map(t => (
                  <div key={t} className={`cz-tipo-item${data.tipo === t ? ' selected' : ''}`}
                    onClick={() => { set('tipo', t); if (t !== 'Otro') set('tipoOtro', '') }}>
                    <span className="cz-tipo-title">{t}</span>
                    <span className="cz-radio" />
                  </div>
                ))}
              </div>

              {/* ── Panel de detalles ── */}
              <div className="anim-slide-r cz-panel">
                {!data.tipo ? (
                  <div className="cz-panel-empty">Selecciona un tipo de mueble<br />para continuar con los detalles</div>
                ) : (
                  <>
                    {data.tipo === 'Otro' && (
                      <div className="cz-field" style={{ position: 'relative', zIndex: 1 }}>
                        <label>Tipo de mueble</label>
                        <input value={data.tipoOtro} onChange={e => set('tipoOtro', e.target.value)} placeholder="Ej: Estantería flotante, closet, etc." />
                      </div>
                    )}

                    <div className="cz-row3">
                      {dimsLabels.map(([key, label]) => (
                        <div className="cz-field" key={key}>
                          <label>{label} (cm)</label>
                          <input type="number" min="0" value={data[key]} onChange={e => set(key, e.target.value)} placeholder="0" />
                        </div>
                      ))}
                    </div>

                    <div className="cz-row2">
                      <div className="cz-field">
                        <label>Material</label>
                        <select value={data.material} onChange={e => { set('material', e.target.value); if (e.target.value !== 'Melamina') set('colorMel', null) }}>
                          <option value="">Selecciona</option>
                          <option value="Melamina">Melamina (15 mm)</option>
                          <option value="MDF">MDF melamínico</option>
                        </select>
                      </div>
                      <div className="cz-field">
                        <label>Color</label>
                        {data.material === 'MDF' ? (
                          <select value={data.mdfTipo} onChange={e => set('mdfTipo', e.target.value)}>
                            {MDF_GROSORES.map(g => <option key={g} value={g}>{g}</option>)}
                          </select>
                        ) : (
                          <div style={{ fontSize: 13, color: 'rgba(243,230,216,.55)', paddingTop: 8 }}>
                            {data.material === 'Melamina' ? (data.colorMel ? data.colorMel.nombre : 'Elige abajo ↓') : '—'}
                          </div>
                        )}
                      </div>
                    </div>

                    {data.material === 'Melamina' && (
                      <div className="cz-swatches">
                        {Object.values(MELAMINA_COLORES).flat().map(c => {
                          const sel = data.colorMel?.nombre === c.nombre
                          const bg = c.texture && c.grain ? `url("${makeWoodTextureSVG(c.hex, c.grain, 30)}") center/cover` : c.hex
                          return <div key={c.nombre} className={`cz-swatch${sel ? ' selected' : ''}`} style={{ background: bg }} title={c.nombre} onClick={() => set('colorMel', c)} />
                        })}
                      </div>
                    )}

                    <div className="cz-field" style={{ position: 'relative', zIndex: 1 }}>
                      <label>Comentarios</label>
                      <textarea rows={3} value={data.comentarios} onChange={e => set('comentarios', e.target.value)} placeholder="Describe cualquier detalle especial..." />
                    </div>

                    <label className={`cz-upload${!data.filePreview ? ' required' : ''}`}>
                      <input type="file" accept=".png,.jpg,.jpeg" onChange={handleFile} />
                      {data.filePreview
                        ? <img className="cz-upload-thumb" src={data.filePreview} alt="referencia" />
                        : <span style={{ fontSize: 20 }}>📎</span>
                      }
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>
                          {data.filePreview ? data.file?.name : 'Agregar imagen de referencia'}
                        </div>
                        <div style={{ fontSize: 11, color: 'rgba(243,230,216,.5)' }}>
                          Obligatoria · PNG o JPG, máx. 5MB
                        </div>
                      </div>
                      {data.filePreview && (
                        <span onClick={e => { e.preventDefault(); removeFile() }} style={{ color: '#e08a8a', fontWeight: 800, cursor: 'pointer', padding: 4 }}>✕</span>
                      )}
                    </label>
                  </>
                )}
              </div>
            </div>
          )}

          {step === 'resumen' && (
            <div className="cz-summary-card" style={{ maxWidth: 620, margin: '0 auto' }}>
              <h3 style={{ fontSize: 19, marginBottom: 14, color: '#222222' }}>Resumen de tu cotización</h3>
              {[
                ['Tipo de mueble', data.tipo === 'Otro' ? data.tipoOtro : data.tipo],
                ['Medidas', `${data.largo || '—'} × ${data.ancho || '—'} × ${data.prof || '—'} cm`],
                ['Material', materialLabel()],
                ['Comentarios', data.comentarios || '—'],
              ].map(([k, v]) => (
                <div className="cz-summary-row" key={k}><span>{k}</span><b style={{ textAlign: 'right', maxWidth: '60%' }}>{v}</b></div>
              ))}
              {data.filePreview && (
                <div style={{ marginTop: 14 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Imagen adjunta</p>
                  <img src={data.filePreview} alt="referencia" style={{ maxWidth: 220, maxHeight: 150, borderRadius: 10, border: '2px solid #1a1a1a', objectFit: 'cover', display: 'block' }} />
                </div>
              )}
              <div style={{ marginTop: 16, padding: '10px 12px', background: 'rgba(26,26,26,.08)', borderRadius: 10, fontSize: 12, color: '#222222', lineHeight: 1.6 }}>
                Se enviará a nombre de <b>{currentUser?.nombres} {currentUser?.apellidos}</b> ({currentUser?.email}).
              </div>
            </div>
          )}
        </div>

        <div className="cz-footer">
          {step === 'form' ? (
            <>
              <span style={{ fontSize: 12, color: '#1a1a1a', fontWeight: 700 }}>Paso 1 de 2</span>
              <button className="cz-btn cz-btn-primary" onClick={goResumen}>Siguiente →</button>
            </>
          ) : (
            <>
              <button className="cz-btn cz-btn-ghost" onClick={() => setStep('form')}>← Atrás</button>
              <button className="cz-btn cz-btn-primary" onClick={handleSubmit}>Enviar cotización ✓</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}


/* ════════════════════════════════════════════════════════════
   PAGE CLIENTE
   ════════════════════════════════════════════════════════════ */
function PageCliente({ currentUser, cotizaciones, onBack, onSendMsg, initialPanel, onUpdateProfile, onChangePassword }) {
  const [panel, setPanel] = useState(initialPanel || 'perfil')
  const [selectedId, setSelectedId] = useState(null)
  const [chatMsg, setChatMsg] = useState('')

  // Edición de perfil
  const [editNombres, setEditNombres]     = useState(currentUser.nombres || '')
  const [editApellidos, setEditApellidos] = useState(currentUser.apellidos || '')
  const [editTel, setEditTel]             = useState(currentUser.teléfono || '+56 9 ')
  const [profileMsg, setProfileMsg]       = useState('')

  // Cambio de contraseña
  const [passActual, setPassActual] = useState('')
  const [passNueva, setPassNueva]   = useState('')
  const [passConfirma, setPassConfirma] = useState('')
  const [passMsg, setPassMsg]       = useState('')
  const [passErr, setPassErr]       = useState('')

  function saveProfile() {
    if (!editNombres.trim() || !editApellidos.trim()) { setProfileMsg('❌ Nombres y apellidos no pueden estar vacíos.'); return }
    onUpdateProfile?.({ nombres: editNombres.trim(), apellidos: editApellidos.trim(), teléfono: editTel })
    setProfileMsg('✅ Datos actualizados correctamente.')
    setTimeout(() => setProfileMsg(''), 2500)
  }

  function savePassword() {
    setPassMsg('')
    if (passActual !== currentUser.password) { setPassErr('La contraseña actual no es correcta.'); return }
    if (passNueva.length < 4) { setPassErr('La nueva contraseña debe tener al menos 4 carácteres.'); return }
    if (passNueva !== passConfirma) { setPassErr('Las contraseñas no coinciden.'); return }
    setPassErr('')
    onChangePassword?.(passNueva)
    setPassActual(''); setPassNueva(''); setPassConfirma('')
    setPassMsg('✅ Contraseña actualizada correctamente.')
    setTimeout(() => setPassMsg(''), 2500)
  }


  const misCots = cotizaciones.filter(c => c.clienteEmail === currentUser.email)

  useEffect(() => {
    if (misCots.length && !selectedId) setSelectedId(misCots[0].id)
  }, [misCots.length])

  const cot = misCots.find(c => c.id === selectedId)

  const SideBtn = ({ id, icon, label }) => (
    <button onClick={() => setPanel(id)} style={{ width: '100%', textAlign: 'left', background: panel === id ? 'rgba(255,255,255,.15)' : 'none', border: 'none', cursor: 'pointer', padding: '10px 12px', borderRadius: 8, color: panel === id ? '#fff' : '#d4b890', fontSize: 13, fontWeight: 700, display: 'flex', gap: 8, alignItems: 'center' }}
      onMouseEnter={e => e.currentTarget.style.background = panel === id ? 'rgba(255,255,255,.15)' : 'rgba(255,255,255,.08)'}
      onMouseLeave={e => e.currentTarget.style.background = panel === id ? 'rgba(255,255,255,.15)' : 'none'}
    >{icon} {label}</button>
  )

  return (
    <Card>
      <nav style={{ height: 64, padding: '0 22px', display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(205,205,205,.5)', background: 'rgba(255,255,255,.45)', backdropFilter: 'blur(8px)' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#444', fontSize: 28, marginRight: 8 }}>←</button>
        <span style={{ fontSize: 22, fontWeight: 800 }}>Mi cuenta</span>
      </nav>
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 14, padding: 18 }}>
        
        <div style={{ background: 'rgba(15,15,15,.75)', color: '#e8e8e8', borderRadius: 14, padding: 16, backdropFilter: 'blur(10px)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,.1)' }}>
            {currentUser.nombres} {currentUser.apellidos}
          </div>
          <SideBtn id="perfil"   icon="👤" label="Perfil" />
          <SideBtn id="pedidos"  icon="📋" label="Mis pedidos" />
        </div>

        
        <div>
          {panel === 'perfil' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Card className="anim-fade-up" style={{ padding: 24 }}>
                <h3 style={{ fontWeight: 800, marginBottom: 16, color: '#222222' }}>Mis datos</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <Field label="Nombres" value={editNombres} onChange={e => setEditNombres(e.target.value)} />
                  <Field label="Apellidos" value={editApellidos} onChange={e => setEditApellidos(e.target.value)} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                  <Field label="Correo electrónico" value={currentUser.email} onChange={() => {}} disabled />
                  <Field label="Teléfono" value={editTel} onChange={e => setEditTel(formatPhone(e.target.value))} />
                </div>
                {profileMsg && <div className="anim-fade-up" style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: profileMsg.startsWith('✅') ? '#2e7d32' : '#c62828' }}>{profileMsg}</div>}
                <Btn onClick={saveProfile}>Guardar cambios</Btn>
              </Card>

              <Card className="anim-fade-up" style={{ padding: 24 }}>
                <h3 style={{ fontWeight: 800, marginBottom: 16, color: '#222222' }}>Cambiar contraseña</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 360 }}>
                  <Field label="Contraseña actual" type="password" value={passActual} onChange={e => setPassActual(e.target.value)} placeholder="••••" />
                  <Field label="Nueva contraseña" type="password" value={passNueva} onChange={e => setPassNueva(e.target.value)} placeholder="Mínimo 4 carácteres" />
                  <Field label="Confirmar nueva contraseña" type="password" value={passConfirma} onChange={e => setPassConfirma(e.target.value)} placeholder="••••" />
                  {passErr && <div className="anim-shake" style={{ background: 'rgba(198,40,40,.1)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#c62828' }}>{passErr}</div>}
                  {passMsg && <div className="anim-fade-up" style={{ fontSize: 13, fontWeight: 700, color: '#2e7d32' }}>{passMsg}</div>}
                  <Btn onClick={savePassword}>Actualizar contraseña</Btn>
                </div>
              </Card>
            </div>
          )}

          {panel === 'pedidos' && (
            <Card style={{ padding: 24 }}>
              <h3 style={{ fontWeight: 800, marginBottom: 16, color: '#222222' }}>Mis pedidos</h3>
              {misCots.length === 0
                ? <p style={{ color: '#666' }}>No tienes pedidos aún.</p>
                : (
                  <>
                    <select value={selectedId || ''} onChange={e => setSelectedId(Number(e.target.value))}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid rgba(217,217,217,.7)', borderRadius: 10, fontSize: 14, background: 'rgba(255,255,255,.70)', marginBottom: 16, boxSizing: 'border-box' }}>
                      {misCots.map((c, i) => <option key={c.id} value={c.id}>{i + 1}. {c.tipo} — {ETAPA_LABEL[c.estado]}</option>)}
                    </select>
                    {cot && (
                      <>
                        {panel === 'pedidos' && (
                          <div className="timeline" style={{ marginBottom: 14 }}>
                            {ETAPAS.map(e => <span key={e} className={`stage${e === cot.estado ? ' active' : ''}`}>{ETAPA_LABEL[e]}</span>)}
                          </div>
                        )}
                        <div style={{ minHeight: 100, maxHeight: 300, overflowY: 'auto', background: 'rgba(255,255,255,.5)', borderRadius: 10, padding: 12, marginBottom: 10, border: '1px solid rgba(200,180,160,.3)', fontSize: 13, lineHeight: 1.7 }}>
                          {cot.mensajes.length === 0
                            ? <p style={{ color: '#666' }}>Sin mensajes.</p>
                            : cot.mensajes.map((m, i) => <p key={i} style={{ marginBottom: 4 }}><b>{m.autor}:</b> {m.texto}</p>)
                          }
                        </div>
                        {cot.chatCerrado
                          ? <p style={{ fontSize: 12, color: '#b00020', padding: '8px 12px', background: 'rgba(0,0,0,.04)', borderRadius: 8 }}>Chat cerrado por el Administrador.</p>
                          : (
                            <div style={{ display: 'flex', gap: 8 }}>
                              <input value={chatMsg} onChange={e => setChatMsg(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && chatMsg.trim()) { onSendMsg(cot.id, chatMsg.trim(), 'cliente'); setChatMsg('') } }}
                                placeholder="Escribe un mensaje..."
                                style={{ flex: 1, padding: '10px 12px', border: '1px solid rgba(217,217,217,.7)', borderRadius: 10, fontSize: 14, background: 'rgba(255,255,255,.70)', outline: 'none', boxSizing: 'border-box' }} />
                              <Btn onClick={() => { if (chatMsg.trim()) { onSendMsg(cot.id, chatMsg.trim(), 'cliente'); setChatMsg('') } }}>Enviar</Btn>
                            </div>
                          )
                        }
                      </>
                    )}
                  </>
                )
              }
            </Card>
          )}
        </div>
      </div>
    </Card>
  )
}

/* ════════════════════════════════════════════════════════════
   PAGE ADMIN
   ════════════════════════════════════════════════════════════ */
function PageAdmin({ cotizaciones, clientes, precios, onBack, onChangeEstado, onSendMsg, onToggleChat, onDeleteCot, onAceptar, onUpdatePrecio }) {
  const [section, setSection] = useState('cotizaciones')
  const [filter, setFilter]   = useState('todos')
  const [chatFilter, setChatFilter] = useState('todos')
  const [selectedId, setSelectedId] = useState(cotizaciones[0]?.id || null)
  const [msgAdmin, setMsgAdmin] = useState('')
  const [emailDraft, setEmailDraft] = useState('')
  const [emailSending, setEmailSending] = useState(false)
  const [emailStatus, setEmailStatus]   = useState(null) // 'ok' | 'error' | null
  const [confirmSending, setConfirmSending] = useState(false)
  const [confirmStatus, setConfirmStatus]   = useState(null) // 'ok' | 'error' | null

  const filtered = cotizaciones.filter(q => {
    if (filter === 'cotización')  return q.estado === 'cotización'
    if (filter === 'fabricación') return q.estado === 'fabricación'
    if (filter === 'entregados')  return q.estado === 'entregado'
    return true
  })

  const chatFiltered = cotizaciones.filter(q => {
    if (chatFilter === 'fabricación') return q.estado === 'fabricación'
    if (chatFilter === 'entregado')   return q.estado === 'entregado'
    return q.estado !== 'cotización'
  })

  const cot = cotizaciones.find(c => c.id === selectedId)

  const SideBtn = ({ id, icon, label }) => (
    <button onClick={() => setSection(id)} style={{ width: '100%', textAlign: 'left', background: section === id ? 'rgba(255,255,255,.15)' : 'none', border: 'none', cursor: 'pointer', padding: '10px 12px', borderRadius: 8, color: section === id ? '#fff' : '#d4b890', fontSize: 13, fontWeight: 700, display: 'flex', gap: 8 }}
      onMouseEnter={e => e.currentTarget.style.background = section === id ? 'rgba(255,255,255,.15)' : 'rgba(255,255,255,.08)'}
      onMouseLeave={e => e.currentTarget.style.background = section === id ? 'rgba(255,255,255,.15)' : 'none'}
    >{icon} {label}</button>
  )

  function doAvanzar() {
    if (!cot) return
    const i = ETAPAS.indexOf(cot.estado)
    if (i < ETAPAS.length - 1) { onChangeEstado(cot.id, ETAPAS[i + 1]); onSendMsg(cot.id, 'Estado: ' + ETAPA_LABEL[ETAPAS[i + 1]], 'admin') }
    else alert('Ya está en el último estado')
  }
  function doRetroceder() {
    if (!cot) return
    const i = ETAPAS.indexOf(cot.estado)
    if (i > 0) { onChangeEstado(cot.id, ETAPAS[i - 1]); onSendMsg(cot.id, 'Estado retrocedido a ' + ETAPA_LABEL[ETAPAS[i - 1]], 'admin') }
    else alert('Ya está en el primer estado')
  }
  function doEntregado() {
    if (!cot || cot.estado !== 'entrega') { alert('El pedido debe estar en estado "Entrega"'); return }
    if (!confirm(`¿Marcar como ENTREGADO a ${cot.nombre}?`)) return
    onChangeEstado(cot.id, 'entregado')
    onSendMsg(cot.id, 'Pedido entregado. ¡Gracias por confiar en Hernández Muebles!', 'sistema')
    onToggleChat(cot.id, true)
  }
  function generarCorreo() {
    if (!cot) return
    const partes = (cot.nombre || '').trim().split(/\s+/)

    let presupuestoTexto = ''
    if (calcCotId === String(cot.id)) {
      const { filas, mano, total } = getPresupuestoFilas()
      if (filas.length > 0 || mano > 0) {
        presupuestoTexto = [
          ``,
          `──────────────────────`,
          `PRESUPUESTO DE MATERIALES`,
          `──────────────────────`,
          ...filas.map(f => `• ${f.label}: ${f.q} × $${(Number(f.p)||0).toLocaleString('es-CL')} = $${((Number(f.q)||0)*(Number(f.p)||0)).toLocaleString('es-CL')}`),
          ...(mano > 0 ? [`• Mano de obra: $${mano.toLocaleString('es-CL')}`] : []),
          `──────────────────────`,
          `TOTAL: $${total.toLocaleString('es-CL')}`,
          `──────────────────────`,
        ].join('\n')
      }
    }

    setEmailDraft(`Buenos ${getSaludo()}, señor/señora ${partes[0]}.\n\nLe escribimos respecto a su cotización código ${cot.código}.\n\n──────────────────────\nDATOS DE COTIZACIÓN\n──────────────────────\nCódigo: ${cot.código}\nFecha: ${cot.fecha}\nCliente: ${cot.nombre}\nCorreo: ${cot.email}\nTeléfono: ${cot.número}\n\nTipo: ${cot.tipo}\nMedidas: ${cot.dim.ancho} × ${cot.dim.alto} × ${cot.dim.prof} cm\nMaterial: ${cot.material}\n──────────────────────${presupuestoTexto}\n\n¿Desea confirmar el pedido?\nContáctenos con el código: ${cot.código}\n\nAtentamente,\nHernández Muebles\njoserhernandezmuebles@gmail.com`)
    setEmailStatus(null)
  }

  async function sendEmail() {
    if (!cot || !emailDraft.trim()) return
    if (EMAILJS_TEMPLATE_COTIZACION === 'TU_TEMPLATE_GENERAL') {
      alert('⚠️ Configura EMAILJS_TEMPLATE_GENERAL en App.jsx antes de enviar correos.\nCrea una plantilla en EmailJS (Subject={{subject}}, To Email={{to_email}}, Content={{message}}) y reemplaza la constante al inicio del archivo.')
      return
    }
    setEmailSending(true)
    setEmailStatus(null)
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_COTIZACION,
        {
          to_name:    cot.nombre,
          to_email:   cot.email,
          from_name:  'Hernández Muebles',
          reply_to:   ADMIN_EMAIL,
          subject:    `Cotización ${cot.código} — Hernández Muebles`,
          message:    emailDraft,
          codigo:     cot.código,
        },
        EMAILJS_PUBLIC_KEY
      )
      setEmailStatus('ok')
    } catch (err) {
      console.error('EmailJS error:', err)
      setEmailStatus('error')
    } finally {
      setEmailSending(false)
    }
  }

  // Correo de confirmación de pedido (formato tipo "Order Confirmation", en texto plano)
  async function sendConfirmacionPedido() {
    if (!cot) return
    if (EMAILJS_TEMPLATE_CONFIRMACION === 'TU_TEMPLATE_GENERAL') {
      alert('⚠️ Configura EMAILJS_TEMPLATE_GENERAL en App.jsx antes de enviar correos.\nCrea una plantilla en EmailJS (Subject={{subject}}, To Email={{to_email}}, Content={{message}}) y reemplaza la constante al inicio del archivo.')
      return
    }
    setConfirmSending(true)
    setConfirmStatus(null)

    // Si hay un presupuesto armado para esta cotización, se usa como detalle de ítems.
    // Si no, se muestra el mueble cotizado como ítem único.
    let itemsTexto, totalTexto
    if (calcCotId === String(cot.id)) {
      const { filas, mano, total } = getPresupuestoFilas()
      itemsTexto = [
        ...filas.map(f => `• ${f.label}  —  Cant: ${f.q}  ×  $${(Number(f.p)||0).toLocaleString('es-CL')}  =  $${((Number(f.q)||0)*(Number(f.p)||0)).toLocaleString('es-CL')}`),
        ...(mano > 0 ? [`• Mano de obra  —  $${mano.toLocaleString('es-CL')}`] : []),
      ].join('\n')
      totalTexto = `$${total.toLocaleString('es-CL')}`
    } else {
      itemsTexto = `• ${cot.tipo} a medida (${cot.dim.ancho} × ${cot.dim.alto} × ${cot.dim.prof} cm)  —  Cant: 1`
      totalTexto = 'Por confirmar'
    }

    const mensaje = [
      `¡Gracias por confiar en Hernández Muebles, ${cot.nombre.split(' ')[0]}!`,
      ``,
      `Hemos confirmado tu pedido y comenzaremos a trabajar en él.`,
      ``,
      `──────────────────────`,
      `PEDIDO #${cot.código}`,
      `──────────────────────`,
      itemsTexto,
      `──────────────────────`,
      `Envío: $0`,
      `TOTAL: ${totalTexto}`,
      `──────────────────────`,
      ``,
      `Te mantendremos al tanto del avance de tu pedido a través de la plataforma.`,
      ``,
      `Atentamente,`,
      `Hernández Muebles`,
      `joserhernandezmuebles@gmail.com`,
    ].join('\n')

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_CONFIRMACION,
        {
          to_name:   cot.nombre,
          to_email:  cot.email,
          from_name: 'Hernández Muebles',
          reply_to:  ADMIN_EMAIL,
          subject:   `Confirmación de pedido ${cot.código} — Hernández Muebles`,
          message:   mensaje,
          codigo:    cot.código,
        },
        EMAILJS_PUBLIC_KEY
      )
      setConfirmStatus('ok')
    } catch (err) {
      console.error('EmailJS error:', err)
      setConfirmStatus('error')
    } finally {
      setConfirmSending(false)
    }
  }


  const [calcCotId, setCalcCotId]     = useState('')
  const [matMel, setMatMel]           = useState(0)
  const [matMelTipo, setMatMelTipo]   = useState('')
  const [matMdf, setMatMdf]           = useState(0)
  const [matMdfTipo, setMatMdfTipo]   = useState(MDF_GROSORES[0])
  const [matTapacanto, setMatTapacanto] = useState(0)
  const [matTcTipo, setMatTcTipo]     = useState('')
  const [matTornillos, setMatTornillos] = useState(0)
  const [matManillas, setMatManillas] = useState(0)
  const [matManillaP, setMatManillaP] = useState(0)
  const [matRuedas, setMatRuedas]     = useState(0)
  const [matRuedasP, setMatRuedasP]   = useState(0)
  const [matBisagras, setMatBisagras] = useState(0)
  const [matBisagrasP, setMatBisagrasP] = useState(0)
  const [matMano, setMatMano]         = useState(0)
  const [extras, setExtras]           = useState([])

  function calcTotal() {
    const melP  = matMelTipo ? (precios.melamina[matMelTipo] || 0) : 0
    const mdfP  = matMdfTipo?.includes('18') ? precios.mdf18 : precios.mdf9
    const tcP   = matTcTipo ? (precios.tapacanto[matTcTipo] || 0) : 0
    const items = [
      { q: matMel, p: melP }, { q: matMdf, p: mdfP }, { q: matTapacanto, p: tcP },
      { q: matTornillos, p: precios.tornillos },
      { q: matManillas, p: matManillaP || precios.manillas },
      { q: matRuedas, p: matRuedasP || precios.ruedas },
      { q: matBisagras, p: matBisagrasP || precios.bisagras },
      ...extras.map(e => ({ q: e.q, p: e.p })),
    ]
    return items.reduce((acc, it) => acc + (Number(it.q) || 0) * (Number(it.p) || 0), 0) + (Number(matMano) || 0)
  }

  // Devuelve el desglose del presupuesto armado en la calculadora (filas, mano de obra, total)
  function getPresupuestoFilas() {
    const melP  = matMelTipo  ? (precios.melamina[matMelTipo]  || 0) : 0
    const mdfP  = matMdfTipo?.includes('18') ? precios.mdf18 : precios.mdf9
    const tcP   = matTcTipo   ? (precios.tapacanto[matTcTipo]  || 0) : 0
    const filas = [
      { label: `Melamina${matMelTipo ? ' — ' + matMelTipo : ''}`, q: matMel,       p: melP,                show: Number(matMel) > 0 },
      { label: `MDF ${matMdfTipo?.includes('18') ? '18mm' : '9mm'}`,               q: matMdf,       p: mdfP,                show: Number(matMdf) > 0 },
      { label: `Tapacanto${matTcTipo ? ' — ' + matTcTipo : ''}`,  q: matTapacanto, p: tcP,                 show: Number(matTapacanto) > 0 },
      { label: 'Tornillos (cajas)',                                q: matTornillos, p: precios.tornillos,   show: Number(matTornillos) > 0 },
      { label: 'Manillas',                                         q: matManillas,  p: matManillaP || precios.manillas, show: Number(matManillas) > 0 },
      { label: 'Ruedas',                                           q: matRuedas,    p: matRuedasP  || precios.ruedas,   show: Number(matRuedas) > 0 },
      { label: 'Bisagras',                                         q: matBisagras,  p: matBisagrasP|| precios.bisagras, show: Number(matBisagras) > 0 },
      ...extras.filter(e => Number(e.q) > 0).map(e => ({ label: e.desc || 'Ítem extra', q: e.q, p: e.p, show: true })),
    ].filter(f => f.show)
    const subtotal = filas.reduce((acc, f) => acc + (Number(f.q)||0)*(Number(f.p)||0), 0)
    const mano     = Number(matMano) || 0
    const total    = subtotal + mano
    return { filas, mano, total }
  }

  const allMelNames = [...MELAMINA_COLORES.únicolores, ...MELAMINA_COLORES.clasico, ...MELAMINA_COLORES.forest].map(c => c.nombre)

  return (
    <Card>
      <nav style={{ height: 64, padding: '0 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(205,205,205,.5)', background: 'rgba(255,255,255,.45)', backdropFilter: 'blur(8px)' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#444', fontSize: 28, marginRight: 8 }}>←</button>
          <span style={{ fontSize: 22, fontWeight: 800 }}>Panel administrativo</span>
        </div>
        <span style={{ fontSize: 12, background: '#1a1a1a', color: '#fff', padding: '4px 10px', borderRadius: 6, fontWeight: 700 }}>⚙️ Admin</span>
      </nav>
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 14, padding: 18 }}>
        
        <div style={{ background: 'rgba(15,15,15,.75)', color: '#e8e8e8', borderRadius: 14, padding: 16, backdropFilter: 'blur(10px)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,.1)', marginBottom: 12 }}>🛠 Panel Admin</div>
          <button onClick={onBack} style={{ width: '100%', marginBottom: 12, justifyContent: 'center', background: 'rgba(255,255,255,.25)', color: '#f0f0f0', border: '1.5px solid rgba(255,255,255,.45)', padding: '8px 14px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>🏠 Volver al inicio</button>
          <div style={{ height: 1, background: 'rgba(255,255,255,.15)', marginBottom: 12 }} />
          <p style={{ fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(240,219,195,.5)', marginBottom: 8, fontWeight: 700 }}>Cotizaciónes</p>
          <SideBtn id="cotizaciones" icon="📋" label="Lista de cotizaciones" />
          <SideBtn id="gestionar"    icon="🔧" label="Administrar cotización" />
          <SideBtn id="precios"      icon="💰" label="Precios de materiales" />
          <SideBtn id="calculadora"  icon="🧮" label="Calculadora presupuesto" />
          <SideBtn id="chat"         icon="💬" label="Chat con clientes" />
          <div style={{ height: 1, background: 'rgba(255,255,255,.15)', margin: '8px 0' }} />
          <SideBtn id="clientes"     icon="👥" label="Clientes" />
        </div>

        
        <div>
          
          {section === 'cotizaciones' && (
            <Card style={{ padding: 16 }}>
              <h4 style={{ fontWeight: 700, marginBottom: 12 }}>📋 Lista de cotizaciones</h4>
              <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                {[['todos','Todos'],['cotización','Cotización'],['fabricación','Fabricación'],['entregados','Entregados']].map(([v, l]) => (
                  <button key={v} onClick={() => setFilter(v)} className={filter === v ? 'btn-primary btn-sm' : 'btn-outline btn-sm'}>{l}</button>
                ))}
              </div>
              {filtered.length === 0 ? <p className="muted">No hay cotizaciones.</p> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {filtered.map(q => {
                    const ec = ETAPA_COLOR[q.estado] || '#555'
                    const lbl = ETAPA_LABEL[q.estado] || q.estado
                    const yaEnt = q.estado === 'entregado'
                    return (
                      <Card key={q.id} style={{ padding: 14, background: 'rgba(255,255,255,.65)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                        <div>
                          <div style={{ fontSize: 12, color: '#1a1a1a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>{q.código}</div>
                          <div style={{ fontSize: 15, fontWeight: 700 }}>{q.nombre}</div>
                          <div style={{ fontSize: 12, color: '#666' }}>{q.email} · {q.tipo}</div>
                          <span style={{ background: ec, color: '#fff', fontSize: 11, padding: '2px 8px', borderRadius: 99, fontWeight: 700 }}>{lbl}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {q.estado === 'cotización' && (
                            <button className="btn-primary btn-sm" onClick={() => { if (!confirm(`¿Aceptar cotización de ${q.nombre}?`)) return; onAceptar(q.id) }}>✅ Aceptar</button>
                          )}
                          {q.estado === 'fabricación' && (
                            <button className="btn-primary btn-sm" style={{ background: '#7a4f9a' }} onClick={() => { if (!confirm(`¿Marcar como "En entrega" a ${q.nombre}?`)) return; onChangeEstado(q.id, 'entrega'); onSendMsg(q.id, 'Pedido listo. Pasando a entrega.', 'admin') }}>🚚 Avanzar a entrega</button>
                          )}
                          {q.estado === 'entrega' && (
                            <button className="btn-primary btn-sm" style={{ background: '#2e7d32' }} onClick={() => { if (!confirm(`¿Marcar como entregado a ${q.nombre}?`)) return; onChangeEstado(q.id, 'entregado'); onSendMsg(q.id, '¡Pedido entregado! Gracias por confiar en Hernández Muebles.', 'sistema'); onToggleChat(q.id, true) }}>📦 Marcar entregado</button>
                          )}
                          <button className="btn-outline btn-sm" onClick={() => { setSection('gestionar'); setSelectedId(q.id) }}>🔧 Administrar</button>
                          {!yaEnt && <button className="btn-outline btn-sm" style={{ color: '#b00020', borderColor: '#b00020' }} onClick={() => onDeleteCot(q.id)}>🗑 Eliminar</button>}
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}
            </Card>
          )}

          
          {section === 'gestionar' && (
            <Card style={{ padding: 16 }}>
              <h4 style={{ fontWeight: 700, marginBottom: 12 }}>🔧 Administrar cotización</h4>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#444', display: 'block', marginBottom: 4 }}>Selecciónar cotización</label>
              <select value={selectedId || ''} onChange={e => setSelectedId(Number(e.target.value))}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid rgba(217,217,217,.7)', borderRadius: 10, fontSize: 14, background: 'rgba(255,255,255,.70)', marginBottom: 12, boxSizing: 'border-box' }}>
                {cotizaciones.map((c, i) => <option key={c.id} value={c.id}>{i + 1}. [{c.código}] {c.nombre} ({ETAPA_LABEL[c.estado]})</option>)}
              </select>
              {cot ? (
                <>
                  <Card style={{ padding: 14, marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                      <div>
                        <span style={{ fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: '#1a1a1a', fontWeight: 700 }}>Código</span><br />
                        <span style={{ fontSize: 18, fontWeight: 800, color: '#222222' }}>{cot.código}</span>
                      </div>
                      <div style={{ fontSize: 12, color: '#777' }}>{cot.fecha}</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 18px', fontSize: 13, marginBottom: 10 }}>
                      {[['Nombre', cot.nombre], ['Correo', cot.email], ['Teléfono', cot.número], ['Tipo', cot.tipo], ['Medidas', `${cot.dim.ancho} × ${cot.dim.alto} × ${cot.dim.prof} cm`], ['Material', cot.material]].map(([k, v]) => (
                        <div key={k}><span style={{ color: '#777', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>{k}</span><div style={{ fontWeight: 700 }}>{v}</div></div>
                      ))}
                    </div>
                    <div className="timeline">
                      {ETAPAS.map(e => <span key={e} className={`stage${e === cot.estado ? ' active' : ''}`}>{ETAPA_LABEL[e]}</span>)}
                    </div>
                    {cot.adjuntoBase64 && (
                      <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(200,180,160,.3)' }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>📷 Imagen de referencia del cliente</p>
                        <img src={cot.adjuntoBase64} alt="Referencia" style={{ maxWidth: '100%', maxHeight: 280, borderRadius: 10, border: '2px solid rgba(26,26,26,.4)', objectFit: 'contain', display: 'block' }} />
                      </div>
                    )}
                  </Card>
                  <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <Btn outline small onClick={doRetroceder}>◀ Retroceder</Btn>
                    <Btn outline small onClick={doAvanzar}>▶ Avanzar</Btn>
                    {cot.estado === 'entrega' && <Btn small onClick={doEntregado} style={{ background: '#333333' }}>📦 Marcar como entregado</Btn>}
                    <Btn outline small onClick={async () => {
                      const q = cot
                      try {
                        const res = await fetch('/api/pdf/cotizacion', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(q),
                        })
                        if (!res.ok) throw new Error('Error al generar PDF')
                        const blob = await res.blob()
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a'); a.href = url; a.download = `COTIZACION_${q.código}.pdf`; a.click(); URL.revokeObjectURL(url)
                      } catch (e) { alert('No se pudo generar el PDF: ' + e.message) }
                    }}>⬇ Descargar PDF</Btn>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <label style={{ fontSize: 13, fontWeight: 700 }}>Borrador de correo al cliente</label>
                      <Btn small onClick={generarCorreo}>✉ Generar correo</Btn>
                    </div>
                    {calcCotId === String(cot.id) ? (
                      <p style={{ fontSize: 11, color: '#2e7d32', marginBottom: 6 }}>✓ El presupuesto armado en "Precios" se incluirá en este correo.</p>
                    ) : (
                      <p style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>Tip: arma el presupuesto en la sección "Precios" y selecciona esta cotización ahí para incluirlo aquí.</p>
                    )}
                    <textarea value={emailDraft} onChange={e => { setEmailDraft(e.target.value); setEmailStatus(null) }} rows={10} placeholder="Seleccióna una cotización y presiona 'Generar correo'..."
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid rgba(217,217,217,.7)', borderRadius: 10, fontSize: 13, lineHeight: 1.6, fontFamily: 'monospace', background: 'rgba(255,255,255,.70)', resize: 'vertical', boxSizing: 'border-box' }} />
                    <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                      <Btn
                        onClick={sendEmail}
                        disabled={!emailDraft.trim() || emailSending}
                        style={{ background: '#333333', display: 'flex', alignItems: 'center', gap: 6 }}
                      >
                        {emailSending ? '⏳ Enviando...' : '📤 Enviar correo al cliente'}
                      </Btn>
                      {cot && (
                        <span style={{ fontSize: 12, color: '#888' }}>
                          Destinatario: <b style={{ color: '#333' }}>{cot.email}</b>
                        </span>
                      )}
                      {emailStatus === 'ok' && (
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#2e7d32', background: 'rgba(46,125,50,.1)', padding: '6px 12px', borderRadius: 8 }}>
                          ✅ Correo enviado exitosamente
                        </span>
                      )}
                      {emailStatus === 'error' && (
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#c62828', background: 'rgba(198,40,40,.1)', padding: '6px 12px', borderRadius: 8 }}>
                          ❌ Error al enviar. Revisa tus credenciales de EmailJS.
                        </span>
                      )}
                    </div>
                  </div>

                  {cot.estado !== 'cotización' && (
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(200,180,160,.3)' }}>
                      <label style={{ fontSize: 13, fontWeight: 700 }}>Confirmación de pedido</label>
                      <p style={{ fontSize: 11, color: '#888', margin: '4px 0 8px' }}>
                        Envía al cliente un resumen de su pedido confirmado, con los ítems y el total
                        {calcCotId === String(cot.id) ? ' (usando el presupuesto armado en "Precios").' : '.'}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                        <Btn
                          onClick={sendConfirmacionPedido}
                          disabled={confirmSending}
                          style={{ background: '#2e7d32', display: 'flex', alignItems: 'center', gap: 6 }}
                        >
                          {confirmSending ? '⏳ Enviando...' : '📧 Enviar confirmación de pedido'}
                        </Btn>
                        {confirmStatus === 'ok' && (
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#2e7d32', background: 'rgba(46,125,50,.1)', padding: '6px 12px', borderRadius: 8 }}>
                            ✅ Confirmación enviada
                          </span>
                        )}
                        {confirmStatus === 'error' && (
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#c62828', background: 'rgba(198,40,40,.1)', padding: '6px 12px', borderRadius: 8 }}>
                            ❌ Error al enviar. Revisa tus credenciales de EmailJS.
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : <p className="muted">No hay cotizaciones</p>}
            </Card>
          )}

          
          {section === 'precios' && (
            <Card style={{ padding: 16 }}>
              <h4 style={{ fontWeight: 700, marginBottom: 4 }}>💰 Precios de materiales</h4>
              <p className="muted" style={{ marginBottom: 14, fontSize: 12 }}>Define los precios base usados en la calculadora.</p>
              <p style={{ fontWeight: 700, fontSize: 13, color: '#222222', marginBottom: 10 }}>🟫 Melamina (por lámina)</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                {allMelNames.map(nombre => (
                  <div key={nombre}>
                    <label style={{ fontSize: 11, color: '#666', fontWeight: 700, display: 'block', marginBottom: 2 }}>{nombre} — precio ($)</label>
                    <input type="number" defaultValue={precios.melamina[nombre] || 0} onBlur={e => onUpdatePrecio('melamina', nombre, Number(e.target.value))}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid rgba(217,217,217,.7)', borderRadius: 8, fontSize: 13, background: 'rgba(255,255,255,.70)', boxSizing: 'border-box' }} />
                  </div>
                ))}
              </div>
              <p style={{ fontWeight: 700, fontSize: 13, color: '#222222', marginBottom: 10 }}>⬜ MDF melamínico</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                {[['mdf9', 'MDF 9mm (Blanco)'], ['mdf18', 'MDF 18mm (Blanco)']].map(([k, l]) => (
                  <div key={k}>
                    <label style={{ fontSize: 11, color: '#666', fontWeight: 700, display: 'block', marginBottom: 2 }}>{l} — ($)</label>
                    <input type="number" defaultValue={precios[k] || 0} onBlur={e => onUpdatePrecio(k, null, Number(e.target.value))}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid rgba(217,217,217,.7)', borderRadius: 8, fontSize: 13, background: 'rgba(255,255,255,.70)', boxSizing: 'border-box' }} />
                  </div>
                ))}
              </div>
              <p style={{ fontWeight: 700, fontSize: 13, color: '#222222', marginBottom: 10 }}>🔩 Quincallería (precio unitario)</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[['tornillos','Tornillos — caja'],['manillas','Manillas'],['ruedas','Ruedas'],['bisagras','Bisagras']].map(([k, l]) => (
                  <div key={k}>
                    <label style={{ fontSize: 11, color: '#666', fontWeight: 700, display: 'block', marginBottom: 2 }}>{l} ($)</label>
                    <input type="number" defaultValue={precios[k] || 0} onBlur={e => onUpdatePrecio(k, null, Number(e.target.value))}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid rgba(217,217,217,.7)', borderRadius: 8, fontSize: 13, background: 'rgba(255,255,255,.70)', boxSizing: 'border-box' }} />
                  </div>
                ))}
              </div>
            </Card>
          )}

          
          {section === 'calculadora' && (
            <Card style={{ padding: 16 }}>
              <h4 style={{ fontWeight: 700, marginBottom: 14 }}>🧮 Calculadora de presupuesto</h4>

              
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#444', display: 'block', marginBottom: 4 }}>📋 Cotización de referencia</label>
                <select value={calcCotId} onChange={e => {
                    const val = e.target.value
                    setCalcCotId(val)
                    const q = cotizaciones.find(c => String(c.id) === val)
                    if (q?.color) { setMatMelTipo(q.color); setMatTcTipo(q.color) }
                  }}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid rgba(217,217,217,.7)', borderRadius: 10, fontSize: 14, background: 'rgba(255,255,255,.70)', boxSizing: 'border-box' }}>
                  <option value="">— Selecciónar cotización —</option>
                  {cotizaciones.map(c => <option key={c.id} value={String(c.id)}>[{c.código}] {c.nombre} — {c.tipo}</option>)}
                </select>
              </div>

              
              {(() => {
                const q = cotizaciones.find(c => String(c.id) === calcCotId)
                if (!q) return null
                const catalog = FURNITURE_CATALOG[q.tipo]
                const design  = catalog?.find(d => d.id === q.diseñoId)
                const svgHtml = design ? (SVG_FNS[design.svgKey]?.(true) || '') : null
                const swatchBg = q.colorHex
                  ? (q.colorTextura && q.colorGrain
                      ? 'url("' + makeWoodTextureSVG(q.colorHex, q.colorGrain, 52) + '") center/cover'
                      : q.colorHex)
                  : null
                return (
                  <div style={{ background: 'rgba(255,255,255,.65)', border: '1px solid rgba(200,180,160,.35)', borderRadius: 12, padding: 14, marginBottom: 14 }}>
                    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-start', marginBottom: 12 }}>
                      {svgHtml ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                          <div style={{ background: '#fff', borderRadius: 10, padding: 10, boxShadow: '0 2px 8px rgba(0,0,0,.08)' }} dangerouslySetInnerHTML={{ __html: svgHtml }} />
                          <span style={{ fontSize: 10, fontWeight: 700, color: '#222222', textAlign: 'center', maxWidth: 110, lineHeight: 1.2 }}>{design.title}</span>
                        </div>
                      ) : q.adjuntoBase64 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                          <div style={{ background: '#fff', borderRadius: 10, padding: 6, boxShadow: '0 2px 8px rgba(0,0,0,.08)' }}>
                            <img src={q.adjuntoBase64} style={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 7 }} alt="Referencia" />
                          </div>
                          <span style={{ fontSize: 10, color: '#888' }}>Referencia adjunta</span>
                        </div>
                      ) : (
                        <div style={{ width: 120, height: 90, background: 'rgba(26,26,26,.08)', borderRadius: 10, border: '2px dashed rgba(26,26,26,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 4 }}>
                          <span style={{ fontSize: 22 }}>🪑</span>
                          <span style={{ fontSize: 9, color: '#888', textAlign: 'center', padding: '0 6px' }}>{q.tipo}</span>
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 180 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px 14px', fontSize: 13 }}>
                          {[['Cliente', q.nombre], ['Tipo', q.tipo], ['Ancho × Alto × Altura', q.dim.ancho + ' × ' + q.dim.alto + ' × ' + q.dim.prof + ' cm'], ['Diseño', q.diseñoTitulo || q.tipoOtro || '—']].map(([k, v]) => (
                            <div key={k}>
                              <span style={{ color: '#888', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>{k}</span>
                              <div style={{ fontWeight: 700, marginTop: 1 }}>{v}</div>
                            </div>
                          ))}
                          <div>
                            <span style={{ color: '#888', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>Estado</span>
                            <div style={{ marginTop: 2 }}><span style={{ background: ETAPA_COLOR[q.estado], color: '#fff', fontSize: 11, padding: '2px 8px', borderRadius: 99, fontWeight: 700 }}>{ETAPA_LABEL[q.estado]}</span></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {swatchBg ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 8, background: 'rgba(255,255,255,.6)', borderRadius: 8, border: '1px solid rgba(200,180,160,.3)' }}>
                        <div style={{ width: 52, height: 52, borderRadius: 8, background: swatchBg, border: '1.5px solid rgba(0,0,0,.12)', flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: 11, color: '#888', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Color / tipo</div>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{q.color}</div>
                          <div style={{ fontSize: 11, color: '#888' }}>{q.material}</div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ padding: 8, background: 'rgba(255,255,255,.6)', borderRadius: 8, border: '1px solid rgba(200,180,160,.3)' }}>
                        <div style={{ fontSize: 11, color: '#888', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Material</div>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{q.material || '—'}</div>
                      </div>
                    )}
                    {q.descripción && (
                      <div style={{ marginTop: 8 }}>
                        <div style={{ fontSize: 11, color: '#888', fontWeight: 700, textTransform: 'uppercase', marginBottom: 3 }}>Descripción</div>
                        <div style={{ fontSize: 13, color: '#333', padding: 8, background: 'rgba(255,255,255,.6)', borderRadius: 8, border: '1px solid rgba(200,180,160,.25)', lineHeight: 1.5 }}>{q.descripción}</div>
                      </div>
                    )}
                  </div>
                )
              })()}

              <p style={{ fontSize: 13, fontWeight: 700, color: '#222222', marginBottom: 10 }}>📦 Cantidades de materiales</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#444', display: 'block', marginBottom: 2 }}>Láminas melamina</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 6 }}>
                    <input type="number" min="0" value={matMel} onChange={e => setMatMel(e.target.value)} style={{ padding: '8px 10px', border: '1px solid rgba(217,217,217,.7)', borderRadius: 8, fontSize: 13, background: 'rgba(255,255,255,.70)' }} />
                    <select value={matMelTipo} onChange={e => setMatMelTipo(e.target.value)} style={{ padding: '8px 10px', border: '1px solid rgba(217,217,217,.7)', borderRadius: 8, fontSize: 13, background: 'rgba(255,255,255,.70)' }}>
                      <option value="">Sin Especificar</option>
                      {['únicolores','clasico','forest'].map(g => (
                        <optgroup key={g} label={g.charAt(0).toUpperCase()+g.slice(1)}>
                          {MELAMINA_COLORES[g].map(c => <option key={c.nombre} value={c.nombre}>{c.nombre}</option>)}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#444', display: 'block', marginBottom: 2 }}>Láminas MDF</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 6 }}>
                    <input type="number" min="0" value={matMdf} onChange={e => setMatMdf(e.target.value)} style={{ padding: '8px 10px', border: '1px solid rgba(217,217,217,.7)', borderRadius: 8, fontSize: 13, background: 'rgba(255,255,255,.70)' }} />
                    <select value={matMdfTipo} onChange={e => setMatMdfTipo(e.target.value)} style={{ padding: '8px 10px', border: '1px solid rgba(217,217,217,.7)', borderRadius: 8, fontSize: 13, background: 'rgba(255,255,255,.70)' }}>
                      {MDF_GROSORES.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#444', display: 'block', marginBottom: 2 }}>Tapacanto (rollos)</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 6 }}>
                    <input type="number" min="0" value={matTapacanto} onChange={e => setMatTapacanto(e.target.value)} style={{ padding: '8px 10px', border: '1px solid rgba(217,217,217,.7)', borderRadius: 8, fontSize: 13, background: 'rgba(255,255,255,.70)' }} />
                    <select value={matTcTipo} onChange={e => setMatTcTipo(e.target.value)} style={{ padding: '8px 10px', border: '1px solid rgba(217,217,217,.7)', borderRadius: 8, fontSize: 13, background: 'rgba(255,255,255,.70)' }}>
                      <option value="">Sin Especificar</option>
                      {allMelNames.map(n => <option key={n} value={n}>{n} — ${(precios.tapacanto[n]||0).toLocaleString('es-CL')}</option>)}
                    </select>
                  </div>
                </div>
                {[
                  ['Tornillos (cajas)', matTornillos, setMatTornillos, null, null],
                  ['Manillas', matManillas, setMatManillas, matManillaP, setMatManillaP],
                  ['Ruedas', matRuedas, setMatRuedas, matRuedasP, setMatRuedasP],
                  ['Bisagras', matBisagras, setMatBisagras, matBisagrasP, setMatBisagrasP],
                ].map(([label, q, setQ, p, setP]) => (
                  <div key={label}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#444', display: 'block', marginBottom: 2 }}>{label}</label>
                    <div style={{ display: 'grid', gridTemplateColumns: p !== null ? '1fr 1fr' : '1fr', gap: 6 }}>
                      <input type="number" min="0" value={q} onChange={e => setQ(e.target.value)} placeholder="Cant." style={{ padding: '8px 10px', border: '1px solid rgba(217,217,217,.7)', borderRadius: 8, fontSize: 13, background: 'rgba(255,255,255,.70)' }} />
                      {p !== null && <input type="number" min="0" value={p} onChange={e => setP(e.target.value)} placeholder="Precio unit." style={{ padding: '8px 10px', border: '1px solid rgba(217,217,217,.7)', borderRadius: 8, fontSize: 13, background: 'rgba(255,255,255,.70)' }} />}
                    </div>
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#444', display: 'block', marginBottom: 2 }}>Mano de obra ($)</label>
                  <input type="number" min="0" value={matMano} onChange={e => setMatMano(e.target.value)} style={{ width: '100%', padding: '8px 10px', border: '1px solid rgba(217,217,217,.7)', borderRadius: 8, fontSize: 13, background: 'rgba(255,255,255,.70)', boxSizing: 'border-box' }} />
                </div>
              </div>
              
              <div style={{ marginBottom: 10 }}>
                {extras.map((ex, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,.5)', border: '1px solid rgba(200,180,160,.4)', borderRadius: 10, padding: 10, marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#222222' }}>Extra #{i + 1}</span>
                      <button onClick={() => setExtras(extras.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b00020', fontSize: 16 }}>✕</button>
                    </div>
                    <input value={ex.desc} onChange={e => setExtras(extras.map((x, j) => j === i ? { ...x, desc: e.target.value } : x))} placeholder="Descripción" style={{ width: '100%', padding: '8px 10px', border: '1px solid rgba(217,217,217,.7)', borderRadius: 8, fontSize: 13, background: 'rgba(255,255,255,.70)', marginBottom: 6, boxSizing: 'border-box' }} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                      <input type="number" min="0" value={ex.q} onChange={e => setExtras(extras.map((x, j) => j === i ? { ...x, q: e.target.value } : x))} placeholder="Cantidad" style={{ padding: '8px 10px', border: '1px solid rgba(217,217,217,.7)', borderRadius: 8, fontSize: 13, background: 'rgba(255,255,255,.70)' }} />
                      <input type="number" min="0" value={ex.p} onChange={e => setExtras(extras.map((x, j) => j === i ? { ...x, p: e.target.value } : x))} placeholder="Precio unit." style={{ padding: '8px 10px', border: '1px solid rgba(217,217,217,.7)', borderRadius: 8, fontSize: 13, background: 'rgba(255,255,255,.70)' }} />
                    </div>
                  </div>
                ))}
                <Btn outline small onClick={() => setExtras([...extras, { desc: '', q: 0, p: 0 }])}>+ Agregar ítem extra</Btn>
              </div>
              
              {(() => {
                const { filas, mano, total } = getPresupuestoFilas()

                return (
                  <>
                    {filas.length > 0 || mano > 0 ? (
                      <div style={{ border: '1px solid rgba(200,180,160,.4)', borderRadius: 10, overflow: 'hidden', marginTop: 10 }}>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 70px 90px 90px', background: 'rgba(26,26,26,.12)', padding: '7px 12px', fontSize: 11, fontWeight: 800, color: '#222222', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          <span>Ítem</span><span style={{ textAlign:'center' }}>Cant.</span><span style={{ textAlign:'right' }}>P. Unit.</span><span style={{ textAlign:'right' }}>Subtotal</span>
                        </div>
                        
                        {filas.map((f, i) => (
                          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 70px 90px 90px', padding: '7px 12px', fontSize: 13, borderTop: '1px solid rgba(200,180,160,.25)', background: i % 2 === 0 ? 'rgba(255,255,255,.55)' : 'rgba(255,255,255,.3)' }}>
                            <span style={{ fontWeight: 600 }}>{f.label}</span>
                            <span style={{ textAlign:'center', color:'#555' }}>{f.q}</span>
                            <span style={{ textAlign:'right', color:'#555' }}>${(Number(f.p)||0).toLocaleString('es-CL')}</span>
                            <span style={{ textAlign:'right', fontWeight: 700 }}>${((Number(f.q)||0)*(Number(f.p)||0)).toLocaleString('es-CL')}</span>
                          </div>
                        ))}
                        
                        {mano > 0 && (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 70px 90px 90px', padding: '7px 12px', fontSize: 13, borderTop: '1px solid rgba(200,180,160,.25)', background: filas.length % 2 === 0 ? 'rgba(255,255,255,.55)' : 'rgba(255,255,255,.3)' }}>
                            <span style={{ fontWeight: 600 }}>Mano de obra</span>
                            <span style={{ textAlign:'center', color:'#888' }}>—</span>
                            <span style={{ textAlign:'right', color:'#888' }}>—</span>
                            <span style={{ textAlign:'right', fontWeight: 700 }}>${mano.toLocaleString('es-CL')}</span>
                          </div>
                        )}
                        
                        <div style={{ borderTop: '2px solid rgba(26,26,26,.3)', background: 'rgba(26,26,26,.08)', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#222222' }}>TOTAL PRESUPUESTO</span>
                          <span style={{ fontSize: 20, fontWeight: 800, color: '#222222' }}>${total.toLocaleString('es-CL')}</span>
                        </div>
                      </div>
                    ) : (
                      <div style={{ background: 'rgba(26,26,26,.08)', borderRadius: 10, padding: 14, marginTop: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 800, color: '#222222' }}>
                          <span>TOTAL PRESUPUESTO</span>
                          <span>${total.toLocaleString('es-CL')}</span>
                        </div>
                      </div>
                    )}

                    <div style={{ marginTop: 10, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                      <Btn onClick={async () => {
                        const q = cotizaciones.find(c => String(c.id) === calcCotId)
                        try {
                          const payload = {
                            cotizacion: q || null,
                            filas,
                            mano,
                            total,
                            fecha: new Date().toLocaleDateString('es-CL'),
                          }
                          const res = await fetch('/api/pdf/presupuesto', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload),
                          })
                          if (!res.ok) throw new Error('Error al generar PDF')
                          const blob = await res.blob()
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement('a')
                          a.href = url; a.download = `PRESUPUESTO_${q ? q.código : 'SIN'}.pdf`; a.click()
                          URL.revokeObjectURL(url)
                        } catch (e) { alert('No se pudo generar el PDF: ' + e.message) }
                      }}>⬇ Generar PDF presupuesto</Btn>

                      {calcCotId && (
                        <span style={{ fontSize: 12, color: '#888' }}>
                          Para enviar este presupuesto por correo, ve a la pestaña <b>Cotizaciones</b>, abre <b>{cotizaciones.find(c => String(c.id) === calcCotId)?.código}</b> y presiona "✉ Generar correo".
                        </span>
                      )}
                    </div>
                  </>
                )
              })()}
            </Card>
          )}

          
          {section === 'chat' && (
            <Card style={{ padding: 16 }}>
              <h4 style={{ fontWeight: 700, marginBottom: 12 }}>💬 Chat con clientes</h4>
              <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                {[['todos','Todos'],['fabricación','Fabricación'],['entregado','Entregados']].map(([v, l]) => (
                  <button key={v} onClick={() => setChatFilter(v)} className={chatFilter === v ? 'btn-primary btn-sm' : 'btn-outline btn-sm'}>{l}</button>
                ))}
              </div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#444', display: 'block', marginBottom: 4 }}>Selecciónar conversación</label>
              <select value={selectedId || ''} onChange={e => setSelectedId(Number(e.target.value))}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid rgba(217,217,217,.7)', borderRadius: 10, fontSize: 14, background: 'rgba(255,255,255,.70)', marginBottom: 10, boxSizing: 'border-box' }}>
                <option value="">— Selecciónar conversación —</option>
                {chatFiltered.map(q => <option key={q.id} value={q.id}>[{q.código}] {q.nombre} ({ETAPA_LABEL[q.estado]})</option>)}
              </select>
              {cot && (
                <>
                  <p className="muted" style={{ fontSize: 13, marginBottom: 8 }}>Cliente: {cot.nombre} · {cot.email} · Estado: {ETAPA_LABEL[cot.estado]}</p>
                  <div style={{ minHeight: 160, maxHeight: 320, overflowY: 'auto', border: '1px solid rgba(221,221,221,.6)', borderRadius: 8, padding: 10, background: 'rgba(255,255,255,.5)', fontSize: 13, lineHeight: 1.7, marginBottom: 8 }}>
                    {cot.mensajes.map((m, i) => <p key={i} style={{ marginBottom: 4 }}><b style={{ color: m.autor === 'admin' ? '#1a1a1a' : '#1f1f1f' }}>{m.autor}:</b> {m.texto}</p>)}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input value={msgAdmin} onChange={e => setMsgAdmin(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && msgAdmin.trim() && !cot.chatCerrado) { onSendMsg(cot.id, msgAdmin.trim(), 'admin'); setMsgAdmin('') } }}
                      disabled={cot.chatCerrado} placeholder={cot.chatCerrado ? 'Chat cerrado' : 'Escribe tu mensaje...'}
                      style={{ flex: 1, padding: '10px 12px', border: '1px solid rgba(217,217,217,.7)', borderRadius: 10, fontSize: 13, background: 'rgba(255,255,255,.70)', outline: 'none', opacity: cot.chatCerrado ? 0.55 : 1, boxSizing: 'border-box' }} />
                    <Btn disabled={cot.chatCerrado} onClick={() => { if (msgAdmin.trim()) { onSendMsg(cot.id, msgAdmin.trim(), 'admin'); setMsgAdmin('') } }}>Enviar</Btn>
                  </div>
                  <Btn outline small onClick={() => onToggleChat(cot.id, !cot.chatCerrado)}>{cot.chatCerrado ? '🔓 Abrir chat' : '🔒 Cerrar conversación'}</Btn>
                  {cot.chatCerrado && <p className="muted" style={{ marginTop: 8, color: '#b00020' }}>Conversación cerrada.</p>}
                </>
              )}
            </Card>
          )}

          
          {section === 'clientes' && (
            <Card style={{ padding: 24 }}>
              <h3 style={{ fontWeight: 800, marginBottom: 16, color: '#222222' }}>👥 Clientes registrados</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {clientes.filter(c => !c.isAdmin).map(c => (
                  <div key={c.email} style={{ padding: '12px 14px', background: 'rgba(255,255,255,.6)', borderRadius: 10, border: '1px solid rgba(200,180,160,.3)', fontSize: 13 }}>
                    <div style={{ fontWeight: 700 }}>{c.nombres} {c.apellidos}</div>
                    <div style={{ color: '#666' }}>{c.email} · {c.teléfono || '—'}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </Card>
  )
}

/* ════════════════════════════════════════════════════════════
   MODALES OVERLAY
   ════════════════════════════════════════════════════════════ */

/* ════════════════════════════════════════════════════════════
   FOOTER CONTACTO
   ════════════════════════════════════════════════════════════ */
function FooterContacto() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])
  return (
    <div style={{ position: 'fixed', left: 18, right: 18, bottom: 14, zIndex: 60, display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'none' }}>
      <span style={{ color: '#333', fontSize: 12, fontWeight: 600, textShadow: '0 1px 3px rgba(255,255,255,.8)', userSelect: 'none' }}>© 2025 Hernández Muebles</span>
      <div ref={ref} style={{ pointerEvents: 'all', position: 'relative' }}>
        <button id="btn-contacto" onClick={() => setOpen(o => !o)} style={{ background: 'rgba(255,255,255,.82)', border: '1.5px solid rgba(26,26,26,.4)', borderRadius: 999, padding: '7px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#222222', display: 'flex', alignItems: 'center', gap: 6, backdropFilter: 'blur(6px)', boxShadow: '0 2px 8px rgba(0,0,0,.1)' }}>📬 Contacto</button>
        {open && (
          <div style={{ position: 'absolute', bottom: 44, right: 0, background: 'rgba(255,255,255,.97)', border: '1px solid rgba(221,221,221,.8)', borderRadius: 14, padding: '16px 20px', boxShadow: '0 8px 24px rgba(0,0,0,.15)', fontSize: 13, minWidth: 240 }}>
            <button onClick={() => setOpen(false)} style={{ position: 'absolute', top: 8, right: 10, background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#888' }}>✕</button>
            <p style={{ fontWeight: 700, color: '#222222', marginBottom: 8, fontSize: 14 }}>📬 Contacto</p>
            <p style={{ color: '#444', marginBottom: 4 }}>✉ joserhernandezmuebles@gmail.com</p>
            <p style={{ color: '#444' }}>📱 +56 9 XXXX XXXX</p>
          </div>
        )}
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   APP ROOT
   ════════════════════════════════════════════════════════════ */
export default function App() {
  const [page, setPage]               = useState('home')
  const [clientePanel, setClientePanel] = useState('perfil')
  const [currentUser, setCurrentUser] = useState(null)
  const [clientes, setClientes]       = useState(CLIENTES_INIT)
  const [cotizaciones, setCotizaciónes] = useState(COTIZACIONES_INIT)
  const [showAuth, setShowAuth]       = useState(false)
  const [showCotizar, setShowCotizar] = useState(false)
  const [precios, setPrecios]         = useState(PRECIOS_INIT)

  const handleLogin    = user => { setCurrentUser(user); setShowAuth(false) }
  const handleRegister = nuevo => { setClientes(p => [...p, nuevo]); setCurrentUser(nuevo); setShowAuth(false) }
  const handleLogout   = () => { setCurrentUser(null); setPage('home') }

  const handleSubmitCot  = nueva => setCotizaciónes(p => [...p, nueva])
  const handleChangeEstado = (id, estado) => setCotizaciónes(p => p.map(c => c.id === id ? { ...c, estado } : c))
  const handleSendMsg    = (id, texto, autor = 'cliente') => setCotizaciónes(p => p.map(c => c.id === id ? { ...c, mensajes: [...c.mensajes, { autor, texto }] } : c))
  const handleToggleChat = (id, cerrar) => setCotizaciónes(p => p.map(c => c.id === id ? { ...c, chatCerrado: cerrar !== undefined ? cerrar : !c.chatCerrado } : c))
  const handleDeleteCot  = id => { if (!confirm('¿Eliminar esta cotización?')) return; setCotizaciónes(p => p.filter(c => c.id !== id)) }
  const handleAceptar    = id => { handleChangeEstado(id, 'fabricación'); handleSendMsg(id, 'Cotización aceptada. Pasando a fabricación.', 'admin') }
  const handleUpdatePrecio = (tipo, nombre, valor) => {
    setPrecios(p => {
      if (tipo === 'melamina') return { ...p, melamina: { ...p.melamina, [nombre]: valor } }
      if (tipo === 'tapacanto') return { ...p, tapacanto: { ...p.tapacanto, [nombre]: valor } }
      return { ...p, [tipo]: valor }
    })
  }
  const handleUpdateProfile = datos => {
    setClientes(p => p.map(c => c.email === currentUser.email ? { ...c, ...datos } : c))
    setCurrentUser(u => ({ ...u, ...datos }))
  }
  const handleChangePassword = nuevaPass => {
    setClientes(p => p.map(c => c.email === currentUser.email ? { ...c, password: nuevaPass } : c))
    setCurrentUser(u => ({ ...u, password: nuevaPass }))
  }
  const handleResetPassword = (email, nuevaPass) => {
    setClientes(p => p.map(c => c.email === email ? { ...c, password: nuevaPass } : c))
  }

  function handleCotizar() {
    if (!currentUser) { setShowAuth(true); return }
    setShowCotizar(true)
  }


  const navProps = {
    currentUser,
    onShowAuth: () => setShowAuth(true),
    onLogout: handleLogout,
    onGoHome: () => setPage('home'),
    onGoPerfil: () => { setClientePanel('perfil'); setPage('cliente') },
    onGoPedidos: () => { setClientePanel('pedidos'); setPage('cliente') },
    onGoAdmin: () => { if (currentUser?.isAdmin) setPage('admin') },
  }

  return (
    <div className="shell">
      {page === 'home' && (
        <PageHome {...navProps} onCotizar={handleCotizar} />
      )}
      {page === 'cliente' && currentUser && (
        <PageCliente currentUser={currentUser} cotizaciones={cotizaciones} onBack={() => setPage('home')} onSendMsg={handleSendMsg} initialPanel={clientePanel}
          onUpdateProfile={handleUpdateProfile} onChangePassword={handleChangePassword} />
      )}
      {page === 'admin' && currentUser?.isAdmin && (
        <PageAdmin
          cotizaciones={cotizaciones} clientes={clientes} precios={precios}
          onBack={() => setPage('home')} onChangeEstado={handleChangeEstado}
          onSendMsg={handleSendMsg} onToggleChat={handleToggleChat}
          onDeleteCot={handleDeleteCot} onAceptar={handleAceptar}
          onUpdatePrecio={handleUpdatePrecio}
        />
      )}
      {showCotizar && currentUser && (
        <ModalCotizar
          currentUser={currentUser}
          onClose={() => setShowCotizar(false)}
          onSubmit={handleSubmitCot}
        />
      )}
      {showAuth && <ModalAuth
        onClose={() => setShowAuth(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onResetPassword={handleResetPassword}
        clientes={clientes}
      />}
      <FooterContacto />
    </div>
  )
}
