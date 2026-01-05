import { describe, it, expect } from '@jest/globals';
import { validateTemplateForm, validateGenerationRequest, validateMCPServer, validateTemplate } from '@/lib/validation';

describe('Validation Functions', () => {
  describe('validateTemplateForm', () => {
    it('should validate correct form data', () => {
      const validData = {
        description: 'This is a valid template description for testing purposes',
        theme_name: 'minimal',
        include_images: false,
        use_mcp: true,
        selected_servers: ['notion-mcp'],
        target_audience: 'project managers',
        complexity: 'intermediate' as const,
      };

      const result = validateTemplateForm(validData);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validData);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject form data with short description', () => {
      const invalidData = {
        description: 'Too short',
        theme_name: 'minimal',
        include_images: false,
        use_mcp: false,
        selected_servers: [],
        complexity: 'simple' as const,
      };

      const result = validateTemplateForm(invalidData);
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Description must be at least 10 characters');
    });

    it('should reject form data with invalid theme', () => {
      const invalidData = {
        description: 'This is a valid template description for testing purposes',
        theme_name: '',
        include_images: false,
        use_mcp: false,
        selected_servers: [],
        complexity: 'simple' as const,
      };

      const result = validateTemplateForm(invalidData);
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject form data with invalid complexity', () => {
      const invalidData = {
        description: 'This is a valid template description for testing purposes',
        theme_name: 'minimal',
        include_images: false,
        use_mcp: false,
        selected_servers: [],
        complexity: 'invalid' as any,
      };

      const result = validateTemplateForm(invalidData);
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateGenerationRequest', () => {
    it('should validate correct generation request', () => {
      const validRequest = {
        description: 'A comprehensive project management template for software teams',
        theme: {
          name: 'professional',
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
          spacing: 'comfortable' as const,
        },
        useMCP: true,
        selectedMCPServers: ['notion-mcp'],
        includeImages: true,
        targetAudience: 'software development teams',
        complexity: 'advanced' as const,
      };

      const result = validateGenerationRequest(validRequest);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validRequest);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject request with missing theme', () => {
      const invalidRequest = {
        description: 'A comprehensive project management template',
        useMCP: false,
        selectedMCPServers: [],
        includeImages: false,
        complexity: 'simple' as const,
      } as any;

      const result = validateGenerationRequest(invalidRequest);
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject request with invalid color format', () => {
      const invalidRequest = {
        description: 'A comprehensive project management template',
        theme: {
          name: 'minimal',
          colors: {
            primary: 'invalid-color', // Invalid hex format
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
          spacing: 'comfortable' as const,
        },
        useMCP: false,
        selectedMCPServers: [],
        includeImages: false,
        complexity: 'simple' as const,
      };

      const result = validateGenerationRequest(invalidRequest);
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateMCPServer', () => {
    it('should validate correct MCP server', () => {
      const validServer = {
        id: 'test-mcp',
        name: 'Test MCP Server',
        url: 'https://mcp.example.com',
        auth_type: 'oauth_2.1' as const,
        active: true,
        description: 'A test MCP server for validation',
        version: '1.0.0',
        capabilities: ['database', 'page'],
      };

      const result = validateMCPServer(validServer);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validServer);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject server with invalid ID', () => {
      const invalidServer = {
        id: 'Invalid ID With Spaces', // Invalid format
        name: 'Test MCP Server',
        url: 'https://mcp.example.com',
        auth_type: 'none' as const,
        active: true,
      };

      const result = validateMCPServer(invalidServer);
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Server ID is required');
    });

    it('should reject server with invalid URL', () => {
      const invalidServer = {
        id: 'test-mcp',
        name: 'Test MCP Server',
        url: 'not-a-valid-url',
        auth_type: 'bearer' as const,
        key: 'test-token',
        active: true,
      };

      const result = validateMCPServer(invalidServer);
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject server with invalid auth type', () => {
      const invalidServer = {
        id: 'test-mcp',
        name: 'Test MCP Server',
        url: 'https://mcp.example.com',
        auth_type: 'invalid-auth' as any,
        active: true,
      };

      const result = validateMCPServer(invalidServer);
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateTemplate', () => {
    it('should validate correct template', () => {
      const validTemplate = {
        id: 'template-123',
        title: 'Test Template',
        description: 'This is a test template description',
        blocks: [
          {
            id: 'block-1',
            type: 'heading' as const,
            level: 1,
            content: 'Main Heading',
          },
          {
            id: 'block-2',
            type: 'paragraph' as const,
            content: 'This is a paragraph block.',
          },
        ],
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
          spacing: 'comfortable' as const,
        },
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
        is_public: false,
      };

      const result = validateTemplate(validTemplate);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validTemplate);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject template with missing required fields', () => {
      const invalidTemplate = {
        id: 'template-123',
        // Missing title
        description: 'This is a test template description',
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
          spacing: 'comfortable' as const,
        },
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
        is_public: false,
      } as any;

      const result = validateTemplate(invalidTemplate);
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject template with invalid date format', () => {
      const invalidTemplate = {
        id: 'template-123',
        title: 'Test Template',
        description: 'This is a test template description',
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
          spacing: 'comfortable' as const,
        },
        created_at: 'invalid-date',
        updated_at: '2024-01-01T00:00:00.000Z',
        is_public: false,
      };

      const result = validateTemplate(invalidTemplate);
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});