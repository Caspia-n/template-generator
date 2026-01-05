import type { Template, TemplateTheme } from '@/lib/types';

// System prompt for Notion template generation
export const SYSTEM_PROMPT = `You are an expert Notion template generator. Your task is to create comprehensive, well-structured Notion templates based on user descriptions.

When generating templates:
1. Structure content logically with clear hierarchies
2. Use appropriate Notion blocks (headings, paragraphs, databases, tables, etc.)
3. Include practical examples and placeholders
4. Consider the target audience's needs
5. Follow Notion's design principles (clean, minimal, functional)
6. Provide actionable content that users can immediately customize

Always respond with valid JSON in the exact format specified by the user.
Never include explanations outside the JSON response.`;

// Template generation prompts for different use cases
export const GENERATION_PROMPTS = {
  projectManagement: (description: string, theme: TemplateTheme, audience: string) => `
Generate a comprehensive Notion project management template based on this description:

Description: ${description}
Target Audience: ${audience}
Theme: ${theme.name}

Include:
- Project overview dashboard
- Task management system
- Timeline/roadmap views
- Team collaboration sections
- Progress tracking
- Resource links
- Meeting notes template
- Deliverables checklist

Structure the template with clear sections and actionable content.`,

  contentCreation: (description: string, theme: TemplateTheme, audience: string) => `
Generate a content creation and publishing workflow template:

Description: ${description}
Target Audience: ${audience}
Theme: ${theme.name}

Include:
- Content strategy dashboard
- Editorial calendar
- Research and ideation sections
- Content production workflow
- SEO tracking
- Performance metrics
- Asset management
- Publishing checklist
- Distribution tracking

Focus on practical, repeatable processes.`,

  knowledgeBase: (description: string, theme: TemplateTheme, audience: string) => `
Generate a comprehensive knowledge base or documentation template:

Description: ${description}
Target Audience: ${audience}
Theme: ${theme.name}

Include:
- Knowledge organization structure
- Search-friendly navigation
- Standard documentation templates
- Best practices guides
- FAQ sections
- Version control
- Contribution guidelines
- Review and approval workflows
- Usage analytics

Ensure information is easily findable and maintainable.`,

  personalProductivity: (description: string, theme: TemplateTheme, audience: string) => `
Generate a personal productivity and life management template:

Description: ${description}
Target Audience: ${audience}
Theme: ${theme.name}

Include:
- Daily/weekly planning systems
- Goal setting and tracking
- Habit formation tools
- Resource management
- Learning paths
- Reflection journals
- Progress monitoring
- Routine optimization

Focus on sustainable, long-term productivity habits.`,

  businessOperations: (description: string, theme: TemplateTheme, audience: string) => `
Generate a business operations and management template:

Description: ${description}
Target Audience: ${audience}
Theme: ${theme.name}

Include:
- Operational dashboards
- Process documentation
- Resource allocation
- Performance metrics
- Team management
- Client/customer management
- Financial tracking
- Compliance and reporting
- Continuous improvement tracking

Emphasize scalability and operational efficiency.`,

  creativeWork: (description: string, theme: TemplateTheme, audience: string) => `
Generate a creative workflow and project template:

Description: ${description}
Target Audience: ${audience}
Theme: ${theme.name}

Include:
- Creative brief templates
- Concept development process
- Resource and inspiration boards
- Project timeline and milestones
- Feedback and review systems
- Portfolio organization
- Client communication
- Asset management
- Project closure and archiving

Support both individual and collaborative creative work.`,

  // Default/generic template prompt
  default: (description: string, theme: TemplateTheme, audience: string) => `
Generate a comprehensive Notion template based on this description:

Description: ${description}
Target Audience: ${audience}
Theme: ${theme.name}

Create a template that includes:
- Clear overview section
- Logical workflow steps
- Tracking and progress indicators
- Resource and reference sections
- Actionable items and checklists
- Customizable elements

Ensure the template is immediately useful and easily adaptable.`,

  // Database-specific prompts
  database: (description: string, theme: TemplateTheme, audience: string, databaseType: string) => `
Generate a ${databaseType} database template for Notion:

Description: ${description}
Target Audience: ${audience}
Theme: ${theme.name}

Include:
- Appropriate property types for ${databaseType}
- Sample data and examples
- Useful views and filters
- Formulas for automation
- Relations to other databases
- Templates for new entries
- Summary/dashboard views

Focus on practical functionality and data organization.`,
};

// Theme-specific styling prompts
export const THEME_PROMPTS = {
  minimal: "Use a clean, minimal aesthetic with plenty of white space, simple typography, and subtle dividers.",
  modern: "Apply a contemporary design with modern color schemes, gradient accents, and sleek visual elements.",
  professional: "Use a business-appropriate design with formal typography, conservative colors, and structured layouts.",
  creative: "Implement an artistic design with vibrant colors, creative typography, and visually engaging elements.",
  technical: "Apply a developer-focused aesthetic with monospace fonts, code-friendly layouts, and technical styling.",
  academic: "Use an scholarly design with serif fonts, structured hierarchies, and citation-friendly layouts.",
};

// Complexity level modifiers
export const COMPLEXITY_MODIFIERS = {
  simple: "Keep the template straightforward with essential elements only. Focus on core functionality without advanced features.",
  intermediate: "Include moderate complexity with some advanced features like formulas, relations, and automation options.",
  advanced: "Create a comprehensive template with full automation, complex relations, and advanced Notion features.",
};

// Prompt builder utility
export function buildPrompt(
  description: string,
  theme: TemplateTheme,
  audience: string,
  complexity: 'simple' | 'intermediate' | 'advanced',
  templateType?: string,
  useDatabase?: boolean
): string {
  let basePrompt = '';

  if (useDatabase && templateType) {
    basePrompt = GENERATION_PROMPTS.database(description, theme, audience, templateType);
  } else {
    // Auto-detect template type based on description keywords
    const lowerDescription = description.toLowerCase();
    
    if (lowerDescription.includes('project') || lowerDescription.includes('task') || lowerDescription.includes('workflow')) {
      basePrompt = GENERATION_PROMPTS.projectManagement(description, theme, audience);
    } else if (lowerDescription.includes('content') || lowerDescription.includes('blog') || lowerDescription.includes('marketing')) {
      basePrompt = GENERATION_PROMPTS.contentCreation(description, theme, audience);
    } else if (lowerDescription.includes('knowledge') || lowerDescription.includes('documentation') || lowerDescription.includes('wiki')) {
      basePrompt = GENERATION_PROMPTS.knowledgeBase(description, theme, audience);
    } else if (lowerDescription.includes('personal') || lowerDescription.includes('life') || lowerDescription.includes('productivity')) {
      basePrompt = GENERATION_PROMPTS.personalProductivity(description, theme, audience);
    } else if (lowerDescription.includes('business') || lowerDescription.includes('operation') || lowerDescription.includes('management')) {
      basePrompt = GENERATION_PROMPTS.businessOperations(description, theme, audience);
    } else if (lowerDescription.includes('creative') || lowerDescription.includes('design') || lowerDescription.includes('art')) {
      basePrompt = GENERATION_PROMPTS.creativeWork(description, theme, audience);
    } else {
      basePrompt = GENERATION_PROMPTS.default(description, theme, audience);
    }
  }

  // Add theme styling
  const themePrompt = THEME_PROMPTS[theme.name as keyof typeof THEME_PROMPTS] || '';
  
  // Add complexity modifier
  const complexityPrompt = COMPLEXITY_MODIFIERS[complexity];

  return `${SYSTEM_PROMPT}\n\n${basePrompt}\n\nTheme Styling: ${themePrompt}\n\nComplexity: ${complexityPrompt}`;
}

// JSON response format template
export const RESPONSE_FORMAT = {
  template: {
    title: "Template Name",
    description: "Brief description of what this template accomplishes",
    blocks: [
      {
        type: "heading",
        level: 1,
        content: "Main Section"
      },
      {
        type: "paragraph", 
        content: "Descriptive text with actionable content"
      },
      {
        type: "database",
        content: "Database name",
        properties: {
          "Property Name": "Property type (title, select, multi_select, date, etc.)"
        }
      }
    ]
  }
};