'use client'

import type { MCPServer } from '@/lib/types'
import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, Textarea } from '@heroui/react'
import { useEffect, useMemo, useState } from 'react'
import { useToast } from './Toasts'
import { Controller, useForm } from 'react-hook-form'
import { nanoid } from 'nanoid'
import { Trash2, RefreshCcw, Save } from 'lucide-react'

type AddServerForm = {
  name: string
  url: string
  auth_type: MCPServer['auth_type']
  key?: string
}

function toId(name: string) {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  return slug || nanoid(10)
}

export function MCPConfigEditor({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}) {
  const toast = useToast()

  const [servers, setServers] = useState<MCPServer[]>([])
  const [jsonText, setJsonText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const { control, handleSubmit, reset } = useForm<AddServerForm>({
    defaultValues: {
      name: '',
      url: '',
      auth_type: 'none',
      key: '',
    },
  })

  const parsedJsonServers = useMemo(() => {
    try {
      const parsed = JSON.parse(jsonText)
      return Array.isArray(parsed?.servers) ? (parsed.servers as MCPServer[]) : null
    } catch {
      return null
    }
  }, [jsonText])

  const loadConfig = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/mcp/config')
      const data = await res.json()
      const loaded = (data?.data ?? []) as MCPServer[]
      setServers(loaded)
      setJsonText(JSON.stringify({ servers: loaded }, null, 2))
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load MCP config')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) loadConfig()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const onAddServer = handleSubmit((values) => {
    const urlOk = (() => {
      try {
        // eslint-disable-next-line no-new
        new URL(values.url)
        return true
      } catch {
        return false
      }
    })()

    if (!values.name.trim()) {
      toast.error('Name is required')
      return
    }

    if (!urlOk) {
      toast.error('URL must be a valid URL')
      return
    }

    const server: MCPServer = {
      id: toId(values.name),
      name: values.name.trim(),
      url: values.url.trim(),
      auth_type: values.auth_type,
      key: values.key?.trim() || null,
      active: true,
    }

    const nextServers = [...servers, server]
    setServers(nextServers)
    setJsonText(JSON.stringify({ servers: nextServers }, null, 2))

    reset()
    toast.success('Server added')
  })

  const onDeleteServer = (id: string) => {
    const nextServers = servers.filter((s) => s.id !== id)
    setServers(nextServers)
    setJsonText(JSON.stringify({ servers: nextServers }, null, 2))
    toast.success('Server removed')
  }

  const onSave = async () => {
    try {
      setIsSaving(true)

      const nextServers = parsedJsonServers
      if (!nextServers) {
        toast.error('Config JSON is invalid')
        return
      }

      for (const s of nextServers) {
        if (!s.name || !s.url || !s.auth_type) {
          toast.error('Each server must include name, url, auth_type')
          return
        }
        try {
          // eslint-disable-next-line no-new
          new URL(s.url)
        } catch {
          toast.error(`Invalid URL for server: ${s.name}`)
          return
        }
      }

      const res = await fetch('/api/mcp/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', servers: nextServers }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error?.message || 'Save failed')
      }

      toast.success('Configuration saved')
      setServers(nextServers)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="3xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex items-center justify-between gap-4">
          <span>MCP Configuration</span>
          <div className="flex gap-2">
            <Button
              variant="bordered"
              startContent={<RefreshCcw className="h-4 w-4" />}
              onPress={loadConfig}
              isDisabled={isLoading || isSaving}
              aria-label="Reload from file"
            >
              Reload
            </Button>
            <Button
              color="primary"
              startContent={<Save className="h-4 w-4" />}
              onPress={onSave}
              isLoading={isSaving}
              isDisabled={isLoading}
              aria-label="Save configuration"
            >
              Save
            </Button>
          </div>
        </ModalHeader>

        <ModalBody>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <Textarea
                label="mcp-servers.json"
                value={jsonText}
                onValueChange={setJsonText}
                minRows={16}
                isDisabled={isLoading || isSaving}
                aria-label="MCP servers JSON"
              />
              {parsedJsonServers === null && (
                <p className="text-sm text-red-400" role="alert">
                  Invalid JSON. Fix the JSON before saving.
                </p>
              )}
            </div>

            <div className="space-y-6">
              <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
                <h3 className="text-sm font-semibold text-slate-100">Add server</h3>
                <form className="mt-4 space-y-4" onSubmit={onAddServer}>
                  <Controller
                    name="name"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label="Name"
                        placeholder="Notion MCP"
                        isRequired
                        isDisabled={isLoading || isSaving}
                        aria-label="Server name"
                      />
                    )}
                  />

                  <Controller
                    name="url"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label="URL"
                        placeholder="https://mcp.example.com"
                        isRequired
                        isDisabled={isLoading || isSaving}
                        aria-label="Server URL"
                      />
                    )}
                  />

                  <Controller
                    name="auth_type"
                    control={control}
                    render={({ field }) => (
                      <Select
                        label="Auth type"
                        selectedKeys={[field.value]}
                        onSelectionChange={(keys) => {
                          const next = Array.from(keys)[0] as MCPServer['auth_type']
                          if (next) field.onChange(next)
                        }}
                        isDisabled={isLoading || isSaving}
                        aria-label="Auth type"
                      >
                        <SelectItem key="oauth_2.1">oauth_2.1</SelectItem>
                        <SelectItem key="bearer">bearer</SelectItem>
                        <SelectItem key="none">none</SelectItem>
                      </Select>
                    )}
                  />

                  <Controller
                    name="key"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label="API key (optional)"
                        placeholder=""
                        type="password"
                        isDisabled={isLoading || isSaving}
                        aria-label="API key"
                      />
                    )}
                  />

                  <Button type="submit" color="primary" className="w-full" aria-label="Add Server">
                    Add Server
                  </Button>
                </form>
              </div>

              <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
                <h3 className="text-sm font-semibold text-slate-100">Existing servers</h3>
                <div className="mt-4 space-y-2">
                  {servers.length === 0 ? (
                    <p className="text-sm text-slate-300">No servers configured.</p>
                  ) : (
                    servers.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-slate-700 bg-slate-900/30 p-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-100">{s.name}</p>
                          <p className="truncate text-xs text-slate-300">{s.url}</p>
                        </div>
                        <Button
                          isIconOnly
                          variant="light"
                          color="danger"
                          onPress={() => onDeleteServer(s.id)}
                          aria-label={`Delete ${s.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="bordered" onPress={() => onOpenChange(false)} aria-label="Close">
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
