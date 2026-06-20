import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Hernández Muebles',
  description: 'Sistema de cotizaciones y panel administrativo — Carpintería artesanal',
  icons: { icon: '/LOGO_LANDING.png' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
