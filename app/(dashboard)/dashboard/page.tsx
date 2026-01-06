'use client'

import { Dashboard } from '@/components/Dashboard'
import { motion } from 'framer-motion'

export default function DashboardPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800"
    >
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-50">My Templates</h1>
          <p className="mt-2 text-slate-300">Manage, export, and share your generated templates</p>
        </header>

        <Dashboard />
      </div>
    </motion.div>
  )
}
