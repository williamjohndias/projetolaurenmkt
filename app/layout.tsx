import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Rumo ao Natal Campeão - Dashboard',
  description: 'Campanha de vendas - Dashboard de métricas e pontuação',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
