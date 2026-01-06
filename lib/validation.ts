import { z } from 'zod'

export const GenerationRequestSchema = z.object({
  description: z.string().min(10).max(500),
  theme: z.enum(['light', 'dark', 'system', 'custom']),
  useMCP: z.boolean(),
  selectedServers: z.array(z.string()),
})

export type GenerationRequest = z.infer<typeof GenerationRequestSchema>

export const TemplateSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  theme: z.enum(['light', 'dark', 'system', 'custom']),
  blocks: z.array(
    z.object({
      id: z.string(),
      type: z.enum(['heading', 'paragraph', 'database', 'table']),
      content: z.string(),
      properties: z.record(z.any()).optional(),
    })
  ),
  createdAt: z.string().datetime(),
  notionPageId: z.string().optional(),
  sharedUrl: z.string().optional(),
})

export type Template = z.infer<typeof TemplateSchema>
