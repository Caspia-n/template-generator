import { describe, it, expect } from '@jest/globals'
import type { Template, TemplateBlock, MCPServer } from '@/lib/types'

describe('Type Definitions', () => {
  describe('Template', () => {
    it('should support required fields', () => {
      const template: Template = {
        id: 'template-123',
        title: 'Test Template',
        description: 'This is a test template',
        theme: 'dark',
        createdAt: '2024-01-01T00:00:00.000Z',
        blocks: [],
      }

      expect(template.id).toBe('template-123')
      expect(template.theme).toBe('dark')
    })

    it('should support optional share fields', () => {
      const template: Template = {
        id: 'template-456',
        title: 'Shared Template',
        description: 'Shared',
        theme: 'system',
        createdAt: '2024-01-01T00:00:00.000Z',
        blocks: [],
        notionPageId: 'page_123',
        sharedUrl: 'https://notion.so/page_123',
      }

      expect(template.notionPageId).toBe('page_123')
      expect(template.sharedUrl).toContain('notion.so')
    })
  })

  describe('TemplateBlock', () => {
    it('should support allowed block types', () => {
      const blocks: TemplateBlock[] = [
        { id: 'b1', type: 'heading', content: 'Heading' },
        { id: 'b2', type: 'paragraph', content: 'Paragraph' },
        { id: 'b3', type: 'database', content: 'Database' },
        { id: 'b4', type: 'table', content: 'Table' },
      ]

      expect(blocks.map((b) => b.type)).toEqual(['heading', 'paragraph', 'database', 'table'])
    })
  })

  describe('MCPServer', () => {
    it('should support auth types', () => {
      const server: MCPServer = {
        id: 'notion-mcp',
        name: 'Notion MCP',
        url: 'https://mcp.notion.com/mcp',
        auth_type: 'oauth_2.1',
        active: true,
      }

      expect(server.auth_type).toBe('oauth_2.1')
    })
  })
})
