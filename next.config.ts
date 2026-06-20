import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Oculta el indicador flotante de Next.js (esquina inferior)
  devIndicators: false,
  // PDFKit usa módulos nativos de Node — excluirlos del bundle del cliente
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false, stream: false, zlib: false, path: false,
      }
    }
    return config
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Permite importar fuentes binarias de PDFKit
  serverExternalPackages: ['pdfkit'],
}

export default nextConfig
