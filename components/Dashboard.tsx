'use client'

import type { Template } from '@/lib/types'
import { deleteTemplate as deleteFromStorage, loadAllTemplates } from '@/lib/storage'
import { Button, Card, CardBody, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { useToast } from './Toasts'
import { MCPConfigEditor } from './MCPConfigEditor'
import { SkeletonCard } from './LoadingState'
import { Copy, Download, Plus, Search, Trash2, Eye, Settings2 } from 'lucide-react'
import { motion } from 'framer-motion'

function formatRelative(iso: string): string {
  const date = new Date(iso)
  const diff = Date.now() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days} day${days === 1 ? '' : 's'} ago`
  if (hours > 0) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  if (minutes > 0) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  return 'just now'
}

export function Dashboard() {
  const router = useRouter()
  const toast = useToast()

  const [templates, setTemplates] = useState<Template[]>([])
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null)
  const [isConfigOpen, setIsConfigOpen] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    const loaded = loadAllTemplates()
    setTemplates(loaded)
    setIsLoading(false)
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return templates
    return templates.filter((t) => {
      return t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
    })
  }, [templates, query])

  const handleDelete = (t: Template) => {
    setTemplateToDelete(t)
  }

  const confirmDelete = () => {
    if (!templateToDelete) return
    deleteFromStorage(templateToDelete.id)
    setTemplates((prev) => prev.filter((t) => t.id !== templateToDelete.id))
    toast.success('Template deleted')
    setTemplateToDelete(null)
  }

  const exportTemplate = (t: Template) => {
    try {
      const blob = new Blob([JSON.stringify(t, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${t.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Exported JSON')
    } catch {
      toast.error('Export failed')
    }
  }

  const shareTemplate = async (t: Template) => {
    const url = `${window.location.origin}/preview/${t.id}`
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Share link copied')
    } catch {
      toast.error('Failed to copy share link')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <Input
            value={query}
            onValueChange={setQuery}
            placeholder="Search templates…"
            startContent={<Search className="h-4 w-4 text-slate-400" />}
            aria-label="Search templates"
          />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            color="primary"
            startContent={<Plus className="h-4 w-4" />}
            onPress={() => router.push('/')}
            aria-label="New Template"
          >
            New Template
          </Button>
          <Button
            variant="bordered"
            startContent={<Settings2 className="h-4 w-4" />}
            onPress={() => setIsConfigOpen(true)}
            aria-label="Edit MCP Config"
          >
            Edit MCP Config
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardBody className="p-10 text-center">
            <div className="mx-auto max-w-md space-y-3">
              <h2 className="text-lg font-semibold text-slate-100">No templates</h2>
              <p className="text-sm text-slate-300">
                {templates.length === 0 ? 'Create your first template to get started.' : 'No templates match your search.'}
              </p>
              {templates.length === 0 && (
                <Button color="primary" onPress={() => router.push('/')} aria-label="Create new template">
                  Create New
                </Button>
              )}
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              whileHover={{ scale: 1.01 }}
            >
              <Card className="h-full">
                <CardBody className="flex h-full flex-col gap-4 p-5">
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="line-clamp-2 text-base font-semibold text-slate-100">{t.title}</h3>
                      <span className="rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 text-xs capitalize text-slate-200">
                        {t.theme}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-3 text-sm text-slate-300">{t.description}</p>
                    <p className="mt-3 text-xs text-slate-400">Created {formatRelative(t.createdAt)}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="flat"
                      startContent={<Eye className="h-4 w-4" />}
                      onPress={() => router.push(`/preview/${t.id}`)}
                      aria-label={`Preview ${t.title}`}
                    >
                      Preview
                    </Button>
                    <Button
                      variant="bordered"
                      startContent={<Download className="h-4 w-4" />}
                      onPress={() => exportTemplate(t)}
                      aria-label={`Export ${t.title}`}
                    >
                      Export
                    </Button>
                    <Button
                      variant="bordered"
                      startContent={<Copy className="h-4 w-4" />}
                      onPress={() => shareTemplate(t)}
                      aria-label={`Share ${t.title}`}
                    >
                      Share
                    </Button>
                    <Button
                      color="danger"
                      variant="bordered"
                      startContent={<Trash2 className="h-4 w-4" />}
                      onPress={() => handleDelete(t)}
                      aria-label={`Delete ${t.title}`}
                    >
                      Delete
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={!!templateToDelete} onOpenChange={() => setTemplateToDelete(null)} aria-label="Delete confirmation">
        <ModalContent>
          <ModalHeader>Delete template</ModalHeader>
          <ModalBody>
            <p className="text-sm text-slate-300">
              Are you sure you want to delete <span className="font-medium text-slate-100">{templateToDelete?.title}</span>?
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="bordered" onPress={() => setTemplateToDelete(null)} aria-label="Cancel deletion">
              Cancel
            </Button>
            <Button color="danger" onPress={confirmDelete} aria-label="Confirm deletion">
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <MCPConfigEditor isOpen={isConfigOpen} onOpenChange={setIsConfigOpen} />
    </div>
  )
}
