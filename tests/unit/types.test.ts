import { describe, it, expect } from '@jest/globals';
import type { 
  Template, 
  TemplateBlock, 
  TemplateTheme, 
  GenerationRequest, 
  GenerationResponse,
  MCPServer,
  ToolDefinition,
  ToolCall,
  MCPResponse,
  TemplateFormData,
  NotionPageCreate,
  ModelStatus,
  InferenceRequest,
  InferenceResponse
} from '@/lib/types';

describe('Type Definitions', () => {
  describe('Template', () => {
    it('should have correct structure for template', () => {
      const template: Template = {
        id: 'template-123',
        title: 'Test Template',
        description: 'This is a test template',
        blocks: [],
        theme: {
          name: 'minimal',
          colors: {
            primary: '#3b82f6',
            secondary: '#64748b',
            background: '#ffffff',
            surface: '#f8fafc',
            text: '#1e293b',
            accent: '#0ea5e9',
          },
          fonts: {
            heading: 'Inter',
            body: 'Inter',
          },
          spacing: 'comfortable',
        },
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
        is_public: false,
      };

      expect(template.id).toBe('template-123');
      expect(template.title).toBe('Test Template');
      expect(template.blocks).toEqual([]);
      expect(template.is_public).toBe(false);
    });

    it('should handle template with optional fields', () => {
      const template: Template = {
        id: 'template-456',
        title: 'Template with Notion',
        description: 'This template has Notion integration',
        blocks: [],
        theme: {
          name: 'modern',
          colors: {
            primary: '#8b5cf6',
            secondary: '#ec4899',
            background: '#0f172a',
            surface: '#1e293b',
            text: '#f1f5f9',
            accent: '#06b6d4',
          },
          fonts: {
            heading: 'Inter',
            body: 'Inter',
          },
          spacing: 'spacious',
        },
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
        is_public: true,
        notion_page_id: 'notion-page-123',
        shared_url: 'https://notion.so/template-456',
      };

      expect(template.notion_page_id).toBe('notion-page-123');
      expect(template.shared_url).toBe('https://notion.so/template-456');
      expect(template.is_public).toBe(true);
    });
  });

  describe('TemplateBlock', () => {
    it('should handle different block types', () => {
      const blocks: TemplateBlock[] = [
        {
          id: 'block-1',
          type: 'heading',
          level: 1,
          content: 'Main Heading',
        },
        {
          id: 'block-2',
          type: 'paragraph',
          content: 'This is a paragraph.',
        },
        {
          id: 'block-3',
          type: 'divider',
          content: '',
        },
        {
          id: 'block-4',
          type: 'image',
          content: 'https://example.com/image.jpg',
        },
        {
          id: 'block-5',
          type: 'quote',
          content: 'This is a quote.',
        },
        {
          id: 'block-6',
          type: 'code',
          content: 'console.log("Hello, world!");',
        },
        {
          id: 'block-7',
          type: 'database',
          content: 'Tasks Database',
          properties: {
            Name: 'title',
            Status: 'select',
            Priority: 'select',
            DueDate: 'date',
          },
        },
        {
          id: 'block-8',
          type: 'table',
          content: 'Comparison Table',
        },
      ];

      expect(blocks[0].type).toBe('heading');
      expect(blocks[0].level).toBe(1);
      expect(blocks[1].type).toBe('paragraph');
      expect(blocks[2].type).toBe('divider');
      expect(blocks[3].type).toBe('image');
      expect(blocks[4].type).toBe('quote');
      expect(blocks[5].type).toBe('code');
      expect(blocks[6].type).toBe('database');
      expect(blocks[7].type).toBe('table');
    });

    it('should handle block with children', () => {
      const blockWithChildren: TemplateBlock = {
        id: 'parent-block',
        type: 'heading',
        level: 2,
        content: 'Parent Section',
        children: [
          {
            id: 'child-block-1',
            type: 'paragraph',
            content: 'Child paragraph',
          },
          {
            id: 'child-block-2',
            type: 'paragraph',
            content: 'Another child paragraph',
          },
        ],
      };

      expect(blockWithChildren.children).toHaveLength(2);
      expect(blockWithChildren.children?.[0].id).toBe('child-block-1');
    });
  });

  describe('TemplateTheme', () => {
    it('should handle different theme types', () => {
      const themes: TemplateTheme[] = [
        {
          name: 'minimal',
          colors: {
            primary: '#3b82f6',
            secondary: '#64748b',
            background: '#ffffff',
            surface: '#f8fafc',
            text: '#1e293b',
            accent: '#0ea5e9',
          },
          fonts: {
            heading: 'Inter',
            body: 'Inter',
          },
          spacing: 'compact',
        },
        {
          name: 'modern',
          colors: {
            primary: '#8b5cf6',
            secondary: '#ec4899',
            background: '#0f172a',
            surface: '#1e293b',
            text: '#f1f5f9',
            accent: '#06b6d4',
          },
          fonts: {
            heading: 'Inter',
            body: 'Inter',
          },
          spacing: 'spacious',
        },
        {
          name: 'professional',
          colors: {
            primary: '#1f2937',
            secondary: '#4b5563',
            background: '#ffffff',
            surface: '#f9fafb',
            text: '#111827',
            accent: '#3b82f6',
          },
          fonts: {
            heading: 'Georgia',
            body: 'Inter',
          },
          spacing: 'comfortable',
        },
      ];

      expect(themes[0].spacing).toBe('compact');
      expect(themes[1].spacing).toBe('spacious');
      expect(themes[2].spacing).toBe('comfortable');
    });
  });

  describe('GenerationRequest', () => {
    it('should have correct generation request structure', () => {
      const request: GenerationRequest = {
        description: 'A comprehensive project management template',
        theme: {
          name: 'professional',
          colors: {
            primary: '#1f2937',
            secondary: '#4b5563',
            background: '#ffffff',
            surface: '#f9fafb',
            text: '#111827',
            accent: '#3b82f6',
          },
          fonts: {
            heading: 'Georgia',
            body: 'Inter',
          },
          spacing: 'comfortable',
        },
        useMCP: true,
        selectedMCPServers: ['notion-mcp', 'github-mcp'],
        includeImages: true,
        targetAudience: 'software development teams',
        complexity: 'advanced',
      };

      expect(request.description).toBe('A comprehensive project management template');
      expect(request.useMCP).toBe(true);
      expect(request.selectedMCPServers).toEqual(['notion-mcp', 'github-mcp']);
      expect(request.complexity).toBe('advanced');
      expect(request.targetAudience).toBe('software development teams');
    });
  });

  describe('GenerationResponse', () => {
    it('should handle successful generation response', () => {
      const response: GenerationResponse = {
        success: true,
        template: {
          id: 'generated-template',
          title: 'Generated Template',
          description: 'AI-generated template',
          blocks: [],
          theme: {
            name: 'minimal',
            colors: {
              primary: '#3b82f6',
              secondary: '#64748b',
              background: '#ffffff',
              surface: '#f8fafc',
              text: '#1e293b',
              accent: '#0ea5e9',
            },
            fonts: {
              heading: 'Inter',
              body: 'Inter',
            },
            spacing: 'comfortable',
          },
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-01-01T00:00:00.000Z',
          is_public: false,
        },
        metadata: {
          model_used: 'qwen3-30b',
          generation_time: 5000,
          token_count: 1500,
        },
      };

      expect(response.success).toBe(true);
      expect(response.template).toBeDefined();
      expect(response.metadata?.model_used).toBe('qwen3-30b');
    });

    it('should handle error generation response', () => {
      const response: GenerationResponse = {
        success: false,
        error: {
          code: 'GENERATION_FAILED',
          message: 'AI model not available',
          details: 'Model file not found',
        },
      };

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('GENERATION_FAILED');
      expect(response.template).toBeUndefined();
    });
  });

  describe('MCPServer', () => {
    it('should handle different authentication types', () => {
      const servers: MCPServer[] = [
        {
          id: 'notion-mcp',
          name: 'Notion MCP',
          url: 'https://mcp.notion.com/mcp',
          auth_type: 'oauth_2.1',
          active: true,
          description: 'Official Notion MCP server',
          version: '1.0.0',
          capabilities: ['database', 'page', 'search'],
        },
        {
          id: 'custom-mcp',
          name: 'Custom MCP Server',
          url: 'https://custom.example.com/mcp',
          auth_type: 'bearer',
          key: 'Bearer token here',
          active: true,
        },
        {
          id: 'public-mcp',
          name: 'Public MCP Server',
          url: 'https://public.example.com/mcp',
          auth_type: 'none',
          active: true,
        },
      ];

      expect(servers[0].auth_type).toBe('oauth_2.1');
      expect(servers[1].auth_type).toBe('bearer');
      expect(servers[1].key).toBe('Bearer token here');
      expect(servers[2].auth_type).toBe('none');
    });
  });

  describe('ToolDefinition', () => {
    it('should have correct tool definition structure', () => {
      const tool: ToolDefinition = {
        name: 'create_database',
        description: 'Create a new database',
        input_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            properties: { type: 'object' },
          },
          required: ['title'],
        },
        server_id: 'notion-mcp',
      };

      expect(tool.name).toBe('create_database');
      expect(tool.input_schema.type).toBe('object');
      expect(tool.server_id).toBe('notion-mcp');
    });
  });

  describe('ToolCall', () => {
    it('should have correct tool call structure', () => {
      const toolCall: ToolCall = {
        tool_name: 'create_database',
        tool_use_id: 'tool-123',
        parameters: {
          title: 'My Database',
          properties: {
            Name: 'title',
            Status: 'select',
          },
        },
      };

      expect(toolCall.tool_name).toBe('create_database');
      expect(toolCall.tool_use_id).toBe('tool-123');
      expect(toolCall.parameters.title).toBe('My Database');
    });
  });

  describe('MCPResponse', () => {
    it('should handle different response content types', () => {
      const response: MCPResponse = {
        content: [
          {
            type: 'text',
            text: 'Database created successfully',
          },
          {
            type: 'image',
            image: {
              data: 'base64-encoded-image-data',
              mime_type: 'image/png',
            },
          },
          {
            type: 'resource',
            resource: {
              type: 'database',
              resource: {
                id: 'db-123',
                title: 'My Database',
              },
            },
          },
        ],
      };

      expect(response.content).toHaveLength(3);
      expect(response.content[0].type).toBe('text');
      expect(response.content[1].type).toBe('image');
      expect(response.content[2].type).toBe('resource');
    });

    it('should handle error responses', () => {
      const errorResponse: MCPResponse = {
        content: [
          {
            type: 'text',
            text: 'Error: Invalid parameters',
          },
        ],
        is_error: true,
      };

      expect(errorResponse.is_error).toBe(true);
      expect(errorResponse.content[0].text).toBe('Error: Invalid parameters');
    });
  });

  describe('TemplateFormData', () => {
    it('should have correct form data structure', () => {
      const formData: TemplateFormData = {
        description: 'A comprehensive project management template for agile teams',
        theme_name: 'professional',
        include_images: true,
        use_mcp: true,
        selected_servers: ['notion-mcp'],
        target_audience: 'project managers',
        complexity: 'intermediate',
      };

      expect(formData.description).toBe('A comprehensive project management template for agile teams');
      expect(formData.theme_name).toBe('professional');
      expect(formData.use_mcp).toBe(true);
      expect(formData.selected_servers).toEqual(['notion-mcp']);
      expect(formData.complexity).toBe('intermediate');
    });
  });

  describe('ModelStatus', () => {
    it('should handle different model status states', () => {
      const statuses: ModelStatus[] = [
        {
          available: false,
          loading: false,
          error: 'Model file not found',
        },
        {
          available: false,
          loading: true,
          progress: 50,
        },
        {
          available: true,
          loading: false,
          model_path: './public/models/Qwen3-30B-A3B-Instruct-2507-UD-Q5_K_XL.gguf',
          model_size: 18000000000,
          download_url: 'https://huggingface.co/unsloth/Qwen3-30B-A3B-Instruct-2507-UD-GGUF',
        },
      ];

      expect(statuses[0].available).toBe(false);
      expect(statuses[1].loading).toBe(true);
      expect(statuses[2].available).toBe(true);
      expect(statuses[2].model_size).toBe(18000000000);
    });
  });

  describe('InferenceRequest', () => {
    it('should have correct inference request structure', () => {
      const request: InferenceRequest = {
        prompt: 'Generate a project management template',
        system_prompt: 'You are a helpful assistant that creates Notion templates.',
        max_tokens: 2048,
        temperature: 0.7,
        top_p: 0.9,
        stop: ['###', '```'],
        stream: false,
      };

      expect(request.prompt).toBe('Generate a project management template');
      expect(request.max_tokens).toBe(2048);
      expect(request.temperature).toBe(0.7);
      expect(request.stop).toEqual(['###', '```']);
    });
  });

  describe('InferenceResponse', () => {
    it('should have correct inference response structure', () => {
      const response: InferenceResponse = {
        text: 'Generated template content here...',
        tokens_used: 1500,
        finish_reason: 'stop',
        model: 'qwen3-30b',
      };

      expect(response.text).toBe('Generated template content here...');
      expect(response.tokens_used).toBe(1500);
      expect(response.finish_reason).toBe('stop');
      expect(response.model).toBe('qwen3-30b');
    });
  });
});