import { describe, it, expect } from '@jest/globals'
import { GenerationRequestSchema, TemplateSchema } from '@/lib/validation'

describe('Validation Schemas', () => {
  describe('GenerationRequestSchema', () => {
    it('should validate correct generation request', () => {
      const validRequest = {
        description: 'A fitness tracker with weekly goals and progress charts',
        theme: 'dark',
        useMCP: true,
        selectedServers: ['notion-mcp'],
      }

      const parsed = GenerationRequestSchema.parse(validRequest)
      expect(parsed).toEqual(validRequest)
    })

    it('should apply defaults', () => {
      const parsed = GenerationRequestSchema.parse({
        description: 'A project tracker with tasks and milestones',
        theme: 'system',
      })

      expect(parsed.useMCP).toBe(true)
      expect(parsed.selectedServers).toEqual([])
    })

    it('should reject short descriptions', () => {
      const result = GenerationRequestSchema.safeParse({
        description: 'Too short',
        theme: 'dark',
      })

      expect(result.success).toBe(false)
    })

    it('should reject invalid theme', () => {
      const result = GenerationRequestSchema.safeParse({
        description: 'A valid description that is long enough',
        theme: 'neon',
      })

      expect(result.success).toBe(false)
    })
  })

  describe('TemplateSchema', () => {
    it('should validate a template', () => {
      const template = {
        id: 'template-123',
        title: 'My Template',
        description: 'This is a template description',
        theme: 'light',
        createdAt: '2024-01-01T00:00:00.000Z',
        blocks: [
          { id: 'b1', type: 'heading', content: 'Heading' },
          { id: 'b2', type: 'paragraph', content: 'Paragraph' },
          { id: 'b3', type: 'database', content: 'Tasks' },
          { id: 'b4', type: 'table', content: 'Table' },
        ],
      }

      const parsed = TemplateSchema.parse(template)
      expect(parsed).toEqual(template)
    })

    it('should reject unknown block types', () => {
      const result = TemplateSchema.safeParse({
        id: 'template-123',
        title: 'My Template',
        description: 'This is a template description',
        theme: 'light',
        createdAt: '2024-01-01T00:00:00.000Z',
        blocks: [{ id: 'b1', type: 'quote', content: 'Nope' }],
      })

      expect(result.success).toBe(false)
    })
  })
})
