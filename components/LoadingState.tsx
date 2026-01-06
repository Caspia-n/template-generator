'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

type SpinnerSize = 'sm' | 'md' | 'lg'

type LoadingVariant = 'spinner' | 'skeleton'

const spinnerPx: Record<SpinnerSize, number> = {
  sm: 18,
  md: 28,
  lg: 40,
}

export function Spinner({
  size = 'md',
  label = 'Loading…',
}: {
  size?: SpinnerSize
  label?: string
}) {
  const px = spinnerPx[size]

  return (
    <div className="flex flex-col items-center justify-center gap-3" role="status" aria-live="polite">
      <motion.div
        aria-hidden="true"
        className="rounded-full border-4 border-slate-600 border-t-blue-500"
        style={{ width: px, height: px }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      <span className="text-sm text-slate-200/80">{label}</span>
    </div>
  )
}

function SkeletonShimmer() {
  return (
    <motion.div
      aria-hidden="true"
      className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
      animate={{ x: ['-100%', '100%'] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
    />
  )
}

export function SkeletonBlock({ className = '' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-md bg-slate-700/50 ${className}`}>
      <SkeletonShimmer />
    </div>
  )
}

export function SkeletonForm() {
  return (
    <div className="space-y-4" aria-hidden="true">
      <SkeletonBlock className="h-4 w-40" />
      <SkeletonBlock className="h-10 w-full" />
      <SkeletonBlock className="h-4 w-28" />
      <SkeletonBlock className="h-24 w-full" />
      <SkeletonBlock className="h-10 w-full" />
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800 p-4" aria-hidden="true">
      <div className="space-y-3">
        <SkeletonBlock className="h-5 w-2/3" />
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-5/6" />
        <div className="flex gap-2 pt-2">
          <SkeletonBlock className="h-8 w-20" />
          <SkeletonBlock className="h-8 w-20" />
        </div>
      </div>
    </div>
  )
}

export function PageLoadingOverlay({
  isLoading,
  message = 'Loading…',
}: {
  isLoading: boolean
  message?: string
}) {
  if (!isLoading) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label={message}
    >
      <div className="w-full max-w-sm rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-xl">
        <Spinner size="lg" label={message} />
      </div>
    </div>
  )
}

export function LoadingState({
  isLoading,
  variant = 'spinner',
  message,
  children,
}: {
  isLoading: boolean
  variant?: LoadingVariant
  message?: string
  children?: ReactNode
}) {
  if (!isLoading) return children ? <>{children}</> : null

  if (variant === 'skeleton') {
    return <SkeletonForm />
  }

  return <Spinner label={message} />
}
