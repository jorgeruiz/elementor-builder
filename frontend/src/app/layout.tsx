import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Elementor Builder — HTML to JSON',
  description: 'Convierte diseños HTML en JSON válido para Elementor Pro v3',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-bg-light">
        {children}
      </body>
    </html>
  )
}
