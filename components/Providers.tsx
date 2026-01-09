'use client'

import { ThemeProvider } from 'next-themes'
import { Toaster } from 'react-hot-toast'
import { ReactNode } from 'react'
import { ErrorBoundary } from './ErrorBoundary'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <ErrorBoundary>{children}</ErrorBoundary>
      <Toaster position="top-right" />
    </ThemeProvider>
  )
}
