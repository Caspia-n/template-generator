'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { Template } from '@/lib/types'
import { loadTemplate } from '@/lib/storage'
import { LoadingState } from '@/components/LoadingState'
import { TemplatePreview } from '@/components/TemplatePreview'
import { Button, Card } from '@heroui/react'
import { ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'

export default function PreviewPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [template, setTemplate] = useState<Template | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    try {
      const t = loadTemplate(id)
      if (!t) {
        setError('Template not found')
        setTemplate(null)
      } else {
        setTemplate(t)
        setError(null)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load template')
      setTemplate(null)
    } finally {
      setIsLoading(false)
    }
  }, [id])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800"
    >
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onPress={() => router.back()}
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <LoadingState isLoading={isLoading} message="Loading template…">
          {error ? (
            <Card>
              <Card.Content className="p-8 text-center">
                <h1 className="text-xl font-semibold text-slate-100">{error}</h1>
                <p className="mt-2 text-sm text-slate-300">Try creating a new template from the home page.</p>
                <div className="mt-6">
                  <Button variant="primary" onPress={() => router.push('/')} aria-label="Go home">
                    Go Home
                  </Button>
                </div>
              </Card.Content>
            </Card>
          ) : template ? (
            <TemplatePreview template={template} />
          ) : null}
        </LoadingState>
      </div>
    </motion.div>
  )
}
