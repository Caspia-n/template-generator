'use client'

import { TemplateForm } from '@/components/TemplateForm'
import { ModelPicker } from '@/components/ModelPicker'
import { Divider, Button } from '@heroui/react'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function HomePage() {
  const { theme, resolvedTheme, setTheme } = useTheme()

  const isDark = (resolvedTheme ?? theme) !== 'light'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800"
    >
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-10 sm:px-8">
        <header className="relative mb-10">
          <Button
            isIconOnly
            variant="light"
            className="absolute right-0 top-0"
            onPress={() => setTheme(isDark ? 'light' : 'dark')}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <h1 className="text-3xl font-bold text-slate-50 sm:text-4xl">Notion Template Generator</h1>
          <p className="mt-2 text-slate-300">Create production-ready Notion templates with AI</p>
        </header>

        <main className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-[600px] space-y-6">
            {/* Model Picker */}
            <div className="rounded-2xl border border-slate-700 bg-slate-900/50 p-6 shadow-xl">
              <ModelPicker />
            </div>

            {/* Template Form */}
            <div className="rounded-2xl border border-slate-700 bg-slate-900/50 p-6 shadow-xl">
              <TemplateForm />
            </div>
          </div>
        </main>

        <footer className="mt-10">
          <Divider className="mb-6" />
          <div className="flex flex-col items-center justify-between gap-3 text-sm text-slate-300 sm:flex-row">
            <div className="flex gap-4">
              <Link href="/dashboard" className="hover:text-slate-50" aria-label="Go to Dashboard">
                Dashboard
              </Link>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-slate-50"
                aria-label="Open GitHub"
              >
                GitHub
              </a>
            </div>
            <span className="text-slate-500">UI shell ready for API integration</span>
          </div>
        </footer>
      </div>
    </motion.div>
  )
}
