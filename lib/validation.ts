import { z } from 'zod';
import type { 
  GenerationRequest, 
  Template, 
  TemplateTheme,
  MCPServer,
  TemplateFormData,
  ToolCall,
  NotionPageCreate 
} from '@/lib/types';

// Simple validation schemas without circular references
export const TemplateBlockSchema = z.object({
  id: z.string(),
  type: z.enum(['heading', 'paragraph', 'database', 'table', 'image', 'quote', 'code', 'divider']),
  content: z.string(),
  properties: z.record(z.any()).optional(),
  children: z.array(z.any()).optional(),
  level: z.number().min(1).max(3).optional(),
});

export const TemplateThemeSchema = z.object({
  name: z.string().min(1),
  colors: z.object({
    primary: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
    secondary: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
    background: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
    surface: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
    text: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
    accent: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
  }),
  fonts: z.object({
    heading: z.string().min(1),
    body: z.string().min(1),
  }),
  spacing: z.enum(['compact', 'comfortable', 'spacious']),
});

export const TemplateSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  blocks: z.array(TemplateBlockSchema).min(1),
  theme: TemplateThemeSchema,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  notion_page_id: z.string().optional(),
  shared_url: z.string().url().optional(),
  is_public: z.boolean(),
});

export const GenerationRequestSchema = z.object({
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
  theme: TemplateThemeSchema,
  useMCP: z.boolean(),
  selectedMCPServers: z.array(z.string()),
  includeImages: z.boolean(),
  targetAudience: z.string().max(200).optional(),
  complexity: z.enum(['simple', 'intermediate', 'advanced']),
});

export const MCPServerSchema = z.object({
  id: z.string().min(1).regex(/^[a-z0-9-_]+$/),
  name: z.string().min(1).max(100),
  url: z.string().url(),
  auth_type: z.enum(['oauth_2.1', 'bearer', 'none']),
  key: z.string().optional(),
  active: z.boolean(),
  description: z.string().max(500).optional(),
  version: z.string().optional(),
  capabilities: z.array(z.string()).optional(),
});

export const TemplateFormDataSchema = z.object({
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
  theme_name: z.string().min(1),
  include_images: z.boolean(),
  use_mcp: z.boolean(),
  selected_servers: z.array(z.string()),
  target_audience: z.string().max(200).optional(),
  complexity: z.enum(['simple', 'intermediate', 'advanced']),
});

export const ToolCallSchema = z.object({
  tool_name: z.string().min(1),
  tool_use_id: z.string().min(1),
  parameters: z.record(z.any()),
});

export const NotionPageCreateSchema = z.object({
  parent: z.object({
    type: z.enum(['workspace', 'page_id', 'database_id']),
    workspace: z.boolean().optional(),
    page_id: z.string().optional(),
    database_id: z.string().optional(),
  }),
  properties: z.record(z.any()),
  children: z.array(z.any()).optional(),
  icon: z.object({
    type: z.enum(['emoji', 'external', 'file']),
    emoji: z.string().optional(),
    external: z.object({ url: z.string().url() }).optional(),
    file: z.object({ url: z.string().url() }).optional(),
  }).optional(),
  cover: z.object({
    type: z.enum(['external', 'file']),
    external: z.object({ url: z.string().url() }).optional(),
    file: z.object({ url: z.string().url() }).optional(),
  }).optional(),
});

// Validation utility functions

/**
 * Validate and return structured error
 */
export function validateWithErrors<T>(schema: z.ZodSchema<T>, data: unknown): { 
  success: boolean; 
  data?: T; 
  errors: string[] 
} {
  try {
    const result = schema.parse(data);
    return {
      success: true,
      data: result,
      errors: [],
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      );
      return {
        success: false,
        errors,
      };
    }
    return {
      success: false,
      errors: ['Unknown validation error'],
    };
  }
}

/**
 * Validate template form data
 */
export function validateTemplateForm(data: unknown): { 
  success: boolean; 
  data?: TemplateFormData; 
  errors: string[] 
} {
  return validateWithErrors(TemplateFormDataSchema, data);
}

/**
 * Validate generation request
 */
export function validateGenerationRequest(data: unknown): { 
  success: boolean; 
  data?: GenerationRequest; 
  errors: string[] 
} {
  return validateWithErrors(GenerationRequestSchema, data);
}

/**
 * Validate template
 */
export function validateTemplate(data: unknown): { 
  success: boolean; 
  data?: Template; 
  errors: string[] 
} {
  return validateWithErrors(TemplateSchema, data);
}

/**
 * Validate MCP server configuration
 */
export function validateMCPServer(data: unknown): { 
  success: boolean; 
  data?: MCPServer; 
  errors: string[] 
} {
  return validateWithErrors(MCPServerSchema, data);
}

/**
 * Validate tool call
 */
export function validateToolCall(data: unknown): { 
  success: boolean; 
  data?: ToolCall; 
  errors: string[] 
} {
  return validateWithErrors(ToolCallSchema, data);
}

/**
 * Validate Notion page creation data
 */
export function validateNotionPageCreate(data: unknown): { 
  success: boolean; 
  data?: NotionPageCreate; 
  errors: string[] 
} {
  return validateWithErrors(NotionPageCreateSchema, data);
}

/**
 * Validate color hex string
 */
export function isValidColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

/**
 * Validate URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate email address
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string, maxLength = 1000): string {
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, ''); // Remove potential HTML tags
}

/**
 * Validate template complexity
 */
export function validateComplexity(
  complexity: string, 
  blockCount: number
): { valid: boolean; message?: string } {
  switch (complexity) {
    case 'simple':
      if (blockCount > 20) {
        return { valid: false, message: 'Simple templates should have 20 blocks or fewer' };
      }
      break;
    case 'intermediate':
      if (blockCount > 50) {
        return { valid: false, message: 'Intermediate templates should have 50 blocks or fewer' };
      }
      break;
    case 'advanced':
      if (blockCount > 100) {
        return { valid: false, message: 'Advanced templates should have 100 blocks or fewer' };
      }
      break;
  }
  return { valid: true };
}

/**
 * Validate template title
 */
export function validateTemplateTitle(title: string): { 
  valid: boolean; 
  message?: string 
} {
  if (!title || title.trim().length === 0) {
    return { valid: false, message: 'Title is required' };
  }
  
  if (title.length < 3) {
    return { valid: false, message: 'Title must be at least 3 characters' };
  }
  
  if (title.length > 200) {
    return { valid: false, message: 'Title must be 200 characters or less' };
  }
  
  return { valid: true };
}

/**
 * Validate template description
 */
export function validateTemplateDescription(description: string): { 
  valid: boolean; 
  message?: string 
} {
  if (!description || description.trim().length === 0) {
    return { valid: false, message: 'Description is required' };
  }
  
  if (description.length < 10) {
    return { valid: false, message: 'Description must be at least 10 characters' };
  }
  
  if (description.length > 2000) {
    return { valid: false, message: 'Description must be 2000 characters or less' };
  }
  
  return { valid: true };
}

/**
 * Validate theme configuration
 */
export function validateTheme(theme: TemplateTheme): { 
  valid: boolean; 
  errors: string[] 
} {
  const errors: string[] = [];
  
  // Validate colors
  const colors = Object.values(theme.colors);
  colors.forEach((color, index) => {
    if (!isValidColor(color)) {
      errors.push(`Invalid color at index ${index}: ${color}`);
    }
  });
  
  // Validate fonts
  if (!theme.fonts.heading || !theme.fonts.body) {
    errors.push('Both heading and body fonts are required');
  }
  
  // Validate spacing
  if (!['compact', 'comfortable', 'spacious'].includes(theme.spacing)) {
    errors.push('Invalid spacing value');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Batch validate multiple items
 */
export function batchValidate<T>(
  items: T[], 
  validator: (item: T) => { valid: boolean; message?: string }
): { 
  valid: boolean; 
  results: Array<{ item: T; valid: boolean; message?: string }> 
} {
  const results = items.map(item => {
    const result = validator(item);
    return {
      item,
      valid: result.valid,
      message: result.message,
    };
  });
  
  const valid = results.every(r => r.valid);
  
  return {
    valid,
    results,
  };
}

/**
 * Validate API request payload
 */
export function validateApiRequest<T>(
  payload: any, 
  schema: z.ZodSchema<T>
): { 
  success: boolean; 
  data?: T; 
  error?: { 
    code: string; 
    message: string; 
    details?: string[] 
  } 
} {
  try {
    const result = schema.parse(payload);
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: error.errors.map(err => `${err.path.join('.')}: ${err.message}`),
        },
      };
    }
    
    return {
      success: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred during validation',
      },
    };
  }
}