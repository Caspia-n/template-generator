'use client'

import { ThemeProvider } from 'next-themes'
import { Toaster } from 'react-hot-toast'
import { ReactNode } from 'react'
import { HeroUIProvider } from '@heroui/react'
import { useRouter } from 'next/navigation'
import { ErrorBoundary } from './ErrorBoundary'

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter()

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <HeroUIProvider navigate={router.push}>
        <ErrorBoundary>{children}</ErrorBoundary>
      </HeroUIProvider>
      <Toaster position="top-right" />
    </ThemeProvider>
  )
}
