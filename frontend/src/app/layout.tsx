import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Elementor Builder — HTML to JSON',
  description: 'Convierte diseños HTML en JSON válido para Elementor Pro v3',
  icons: { icon: '/icon.svg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="min-h-screen bg-bg-light">
        {children}
      </body>
    </html>
  )
}
