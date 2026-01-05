import { z } from 'zod';
import type { 
  GenerationRequest, 
  GenerationResponse, 
  Template, 
  TemplateBlock, 
  TemplateTheme 
} from '@/lib/types';
import { generateWithInference } from './llama';
import { buildPrompt } from './prompts';

// Validation schemas
export const GenerationRequestSchema = z.object({
  description: z.string().min(10, 'Description must be at least 10 characters'),
  theme: z.object({
    name: z.string(),
    colors: z.object({
      primary: z.string(),
      secondary: z.string(),
      background: z.string(),
      surface: z.string(),
      text: z.string(),
      accent: z.string(),
    }),
    fonts: z.object({
      heading: z.string(),
      body: z.string(),
    }),
    spacing: z.enum(['compact', 'comfortable', 'spacious']),
  }),
  useMCP: z.boolean(),
  selectedMCPServers: z.array(z.string()),
  includeImages: z.boolean(),
  targetAudience: z.string().optional(),
  complexity: z.enum(['simple', 'intermediate', 'advanced']),
});

// Default theme templates
export const DEFAULT_THEMES: Record<string, TemplateTheme> = {
  minimal: {
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
  modern: {
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
  professional: {
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
  creative: {
    name: 'creative',
    colors: {
      primary: '#f59e0b',
      secondary: '#ef4444',
      background: '#fef7ed',
      surface: '#fff7ed',
      text: '#451a03',
      accent: '#10b981',
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Source Sans Pro',
    },
    spacing: 'spacious',
  },
};

/**
 * Generate a Notion template using AI
 */
export async function generateTemplate(request: GenerationRequest): Promise<GenerationResponse> {
  try {
    // Validate request
    const validatedRequest = GenerationRequestSchema.parse(request);

    // Build AI prompt
    const prompt = buildPrompt(
      validatedRequest.description,
      validatedRequest.theme,
      validatedRequest.targetAudience || 'general users',
      validatedRequest.complexity
    );

    // Generate template using AI
    const aiResponse = await generateWithInference({
      prompt,
      system_prompt: `You are a Notion template generator. Always respond with valid JSON.`,
      max_tokens: 4000,
      temperature: 0.7,
    });

    // Parse AI response and create template structure
    const template = await parseAIResponse(aiResponse.text, validatedRequest);

    return {
      success: true,
      template,
      metadata: {
        model_used: 'qwen3-30b',
        generation_time: Date.now(), // TODO: Calculate actual time
        token_count: aiResponse.tokens_used || 0,
      },
    };
  } catch (error) {
    console.error('Template generation failed:', error);
    
    return {
      success: false,
      error: {
        code: 'GENERATION_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error,
      },
    };
  }
}

/**
 * Parse AI response and create structured template
 */
async function parseAIResponse(aiText: string, request: GenerationRequest): Promise<Template> {
  try {
    // Try to extract JSON from AI response
    let jsonContent = aiText;
    
    // Look for JSON in code blocks or plain text
    const jsonMatch = aiText.match(/```json\s*([\s\S]*?)\s*```/) || aiText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1] || jsonMatch[0];
    }

    // Parse JSON content
    let parsedContent;
    try {
      parsedContent = JSON.parse(jsonContent);
    } catch {
      // If JSON parsing fails, create a structured template from text
      parsedContent = createStructuredTemplate(aiText, request);
    }

    // Create template object
    const template: Template = {
      id: generateId(),
      title: parsedContent.template?.title || 'Generated Template',
      description: parsedContent.template?.description || request.description,
      blocks: parsedContent.template?.blocks || createDefaultBlocks(request),
      theme: request.theme,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_public: false,
    };

    return template;
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    
    // Return fallback template
    return createFallbackTemplate(request);
  }
}

/**
 * Create structured template from unstructured AI text
 */
function createStructuredTemplate(text: string, request: GenerationRequest): any {
  const sections = text.split(/\n\s*\n/).filter(section => section.trim());
  
  const blocks: TemplateBlock[] = [
    {
      id: generateId(),
      type: 'heading',
      level: 1,
      content: request.description.split(' ').slice(0, 6).join(' '),
    },
    {
      id: generateId(),
      type: 'paragraph',
      content: request.description,
    },
  ];

  sections.slice(0, 10).forEach((section, index) => {
    const lines = section.split('\n').filter(line => line.trim());
    
    if (lines.length > 0) {
      const firstLine = lines[0].trim();
      
      if (firstLine.length < 100) {
        blocks.push({
          id: generateId(),
          type: 'heading',
          level: 2,
          content: firstLine.replace(/^#+\s*/, ''),
        });
      } else {
        blocks.push({
          id: generateId(),
          type: 'paragraph',
          content: firstLine,
        });
      }

      if (lines.length > 1) {
        blocks.push({
          id: generateId(),
          type: 'paragraph',
          content: lines.slice(1).join('\n'),
        });
      }
    }
  });

  return {
    template: {
      title: request.description.split(' ').slice(0, 6).join(' '),
      description: request.description,
      blocks,
    },
  };
}

/**
 * Create default blocks for a template
 */
function createDefaultBlocks(request: GenerationRequest): TemplateBlock[] {
  return [
    {
      id: generateId(),
      type: 'heading',
      level: 1,
      content: request.description.split(' ').slice(0, 6).join(' '),
    },
    {
      id: generateId(),
      type: 'paragraph',
      content: request.description,
    },
    {
      id: generateId(),
      type: 'heading',
      level: 2,
      content: 'Overview',
    },
    {
      id: generateId(),
      type: 'paragraph',
      content: 'This template helps you organize and manage your workflow effectively.',
    },
    {
      id: generateId(),
      type: 'heading',
      level: 2,
      content: 'Getting Started',
    },
    {
      id: generateId(),
      type: 'paragraph',
      content: 'Follow these steps to get started with your template:',
    },
    {
      id: generateId(),
      type: 'divider',
      content: '',
    },
  ];
}

/**
 * Create a fallback template when parsing fails
 */
function createFallbackTemplate(request: GenerationRequest): Template {
  return {
    id: generateId(),
    title: `Generated: ${request.description.split(' ').slice(0, 3).join(' ')}`,
    description: request.description,
    blocks: [
      {
        id: generateId(),
        type: 'heading',
        level: 1,
        content: request.description,
      },
      {
        id: generateId(),
        type: 'paragraph',
        content: 'A customizable template generated for your workflow.',
      },
    ],
    theme: request.theme,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_public: false,
  };
}

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Export individual ID generator for use above
function getId(): string {
  return generateId();
}