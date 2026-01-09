'use client'

import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { GenerationRequestSchema, type GenerationRequest } from '@/lib/validation'
import type { MCPServer, Template } from '@/lib/types'
import { Button, Select, Switch, TextArea, ListBox, ListBoxItem } from '@heroui/react'
import { useRouter } from 'next/navigation'
import { useToast } from './Toasts'
import { nanoid } from 'nanoid'
import { saveTemplate } from '@/lib/storage'
import { motion } from 'framer-motion'

type FormValues = GenerationRequest

function buildMockTemplate(values: FormValues): Template {
  const title = values.description
    .trim()
    .split(/\s+/)
    .slice(0, 6)
    .join(' ')

  return {
    id: nanoid(),
    title: title || 'New Template',
    description: values.description,
    theme: values.theme,
    createdAt: new Date().toISOString(),
    blocks: [
      {
        id: nanoid(),
        type: 'heading',
        content: title || 'Template',
      },
      {
        id: nanoid(),
        type: 'paragraph',
        content: values.description,
      },
      {
        id: nanoid(),
        type: 'database',
        content: 'Tasks',
        properties: {
          Name: 'title',
          Status: 'select',
        },
      },
      {
        id: nanoid(),
        type: 'table',
        content: 'Weekly Goals',
        properties: {
          columns: ['Goal', 'Progress', 'Notes'],
        },
      },
    ],
  }
}

export function TemplateForm() {
  const router = useRouter()
  const toast = useToast()

  const [servers, setServers] = useState<MCPServer[]>([])
  const [formError, setFormError] = useState<string | null>(null)
  const [modelPath, setModelPath] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<GenerationRequest>({
    resolver: zodResolver(GenerationRequestSchema),
    defaultValues: {
      description: '',
      theme: 'system',
      useMCP: true,
      selectedServers: [],
    },
    mode: 'onChange',
  })

  const useMCP = watch('useMCP')

  useEffect(() => {
    let isMounted = true

    async function loadServers() {
      try {
        const res = await fetch('/mcp-servers.json')
        if (!res.ok) return
        const json = await res.json()
        const parsed = (json?.servers ?? []) as MCPServer[]
        if (isMounted) setServers(parsed)
      } catch {
        // ignore (optional feature)
      }
    }

    loadServers()
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    // Load model path from localStorage
    const saved = localStorage.getItem("selectedModelPath");
    console.log("[TemplateForm] Loading model path from localStorage:", saved);
    setModelPath(saved);
    if (saved) {
      console.log("[TemplateForm] Model path loaded successfully");
    } else {
      console.log("[TemplateForm] No model path found in localStorage");
    }
  }, [])

  const availableServerItems = useMemo(() => {
    return servers.filter((s) => s.active)
  }, [servers])

  const onSubmit = async (values: FormValues) => {
    console.log("[TemplateForm] Form submission started", {
      hasModelPath: !!modelPath,
      modelPath: modelPath,
      description: values.description,
      theme: values.theme
    });
    
    setFormError(null);

    if (!modelPath) {
      console.log("[TemplateForm] Form submission failed: no model path");
      toast.error("Please select an AI model first");
      return;
    }

    console.log("[TemplateForm] Submitting generation request to /api/generate");
    
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-model-path": modelPath,
        },
        body: JSON.stringify({ ...values, modelPath }),
      });

      console.log("[TemplateForm] API response status:", response.status);

      if (!response.ok) {
        const result = await response.json();
        console.error("[TemplateForm] API error:", result);
        throw new Error(result.error || "Generation failed");
      }

      const result = await response.json();
      console.log("[TemplateForm] Generation successful:", result);
      
      // Save template to local storage
      saveTemplate(result.template);
      
      toast.success("Template generated successfully!");
      router.push(`/preview/${result.template.id}`);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to create template'
      console.error("[TemplateForm] Form submission error:", e);
      setFormError(message)
      toast.error(message)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <TextArea
              label="Describe your template"
              placeholder='e.g., "fitness tracker with weekly goals"'
              minRows={4}
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              isRequired
              isDisabled={isSubmitting}
              isInvalid={!!errors.description}
              errorMessage={errors.description?.message}
              aria-label="Describe your template"
            />
          )}
        />

        <Controller
          name="theme"
          control={control}
          render={({ field }) => (
            <Select
              selectedKey={field.value}
              onSelectionChange={(key) => field.onChange(key as FormValues['theme'])}
              isDisabled={isSubmitting}
              isInvalid={!!errors.theme}
              placeholder="Select a theme"
              label="Theme"
              aria-label="Theme picker"
            >
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  <ListBoxItem id="light">Light</ListBoxItem>
                  <ListBoxItem id="dark">Dark</ListBoxItem>
                  <ListBoxItem id="system">System</ListBoxItem>
                  <ListBoxItem id="custom">Custom</ListBoxItem>
                </ListBox>
              </Select.Popover>
            </Select>
          )}
        />

        <Controller
          name="useMCP"
          control={control}
          render={({ field }) => (
            <div className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-800 p-4">
              <div>
                <p className="text-sm font-medium text-slate-100">Use MCP for tool calling</p>
                <p className="text-xs text-slate-300">Enable Model Context Protocol integrations</p>
              </div>
              <Switch
                isSelected={field.value}
                onValueChange={field.onChange}
                isDisabled={isSubmitting}
                aria-label="Use MCP for tool calling"
              />
            </div>
          )}
        />

        <details className="rounded-xl border border-slate-700 bg-slate-800 p-4" open={useMCP}>
          <summary className="cursor-pointer select-none text-sm font-medium text-slate-100">
            Available MCP servers
          </summary>
          <div className="mt-4">
            <Controller
              name="selectedServers"
              control={control}
              render={({ field }) => (
                <Select
                  selectionMode="multiple"
                  selectedKeys={new Set(field.value)}
                  onSelectionChange={(keys) => field.onChange(Array.from(keys) as string[])}
                  isDisabled={isSubmitting || !useMCP || availableServerItems.length === 0}
                  placeholder={availableServerItems.length ? 'Select servers' : 'No servers found'}
                  label="MCP Servers"
                  aria-label="Available MCP servers"
                >
                  <Select.Trigger>
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox items={availableServerItems}>
                      {(server) => <ListBoxItem id={server.id}>{server.name}</ListBoxItem>}
                    </ListBox>
                  </Select.Popover>
                </Select>
              )}
            />
            {errors.selectedServers?.message && (
              <p className="mt-2 text-sm text-red-400">{errors.selectedServers.message}</p>
            )}
          </div>
        </details>

        {formError && (
          <div className="rounded-lg border border-red-800/40 bg-red-950/30 p-3 text-sm text-red-200" role="alert">
            {formError}
          </div>
        )}

        <Button
          type="submit"
          color={modelPath ? "primary" : "default"}
          isLoading={isSubmitting}
          isDisabled={isSubmitting || !modelPath}
          className="w-full"
          aria-label="Generate Template"
        >
          {!modelPath ? "Select Model First" : isSubmitting ? "Generating..." : "Generate Template"}
        </Button>
      </form>
    </motion.div>
  )
}
