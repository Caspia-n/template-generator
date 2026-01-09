import type { Metadata } from 'next'
import { Providers } from '@/components/Providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'Notion Template Generator',
  description: 'Generate high-quality Notion templates with local AI',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
