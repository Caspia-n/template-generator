import { writeFile, readFile, access, constants, mkdir } from 'fs/promises';
import { existsSync, createReadStream } from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';
import type { Template, TemplateFormData, ApiResponse } from '@/lib/types';

const STORAGE_DIR = './storage';
const TEMPLATES_FILE = path.join(STORAGE_DIR, 'templates.json');
const SETTINGS_FILE = path.join(STORAGE_DIR, 'settings.json');

/**
 * Ensure storage directory exists
 */
async function ensureStorageDir(): Promise<void> {
  if (!existsSync(STORAGE_DIR)) {
    await mkdir(STORAGE_DIR, { recursive: true });
  }
}

/**
 * Load all templates from storage
 */
export async function loadTemplates(): Promise<Template[]> {
  try {
    await ensureStorageDir();
    
    if (!existsSync(TEMPLATES_FILE)) {
      return [];
    }

    const data = await readFile(TEMPLATES_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to load templates:', error);
    return [];
  }
}

/**
 * Save all templates to storage
 */
export async function saveTemplates(templates: Template[]): Promise<void> {
  try {
    await ensureStorageDir();
    
    const data = JSON.stringify(templates, null, 2);
    await writeFile(TEMPLATES_FILE, data, 'utf-8');
  } catch (error) {
    console.error('Failed to save templates:', error);
    throw new Error(`Failed to save templates: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Save a single template
 */
export async function saveTemplate(template: Template): Promise<void> {
  const templates = await loadTemplates();
  const existingIndex = templates.findIndex(t => t.id === template.id);
  
  if (existingIndex >= 0) {
    templates[existingIndex] = { ...template, updated_at: new Date().toISOString() };
  } else {
    templates.push(template);
  }
  
  await saveTemplates(templates);
}

/**
 * Load a single template by ID
 */
export async function loadTemplate(id: string): Promise<Template | null> {
  const templates = await loadTemplates();
  return templates.find(t => t.id === id) || null;
}

/**
 * Delete a template
 */
export async function deleteTemplate(id: string): Promise<boolean> {
  const templates = await loadTemplates();
  const filtered = templates.filter(t => t.id !== id);
  
  if (filtered.length === templates.length) {
    return false; // Template not found
  }
  
  await saveTemplates(filtered);
  return true;
}

/**
 * Create a new template from form data
 */
export async function createTemplate(formData: TemplateFormData): Promise<Template> {
  const template: Template = {
    id: nanoid(),
    title: generateTitleFromDescription(formData.description),
    description: formData.description,
    blocks: [], // Will be populated during generation
    theme: {
      name: formData.theme_name,
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
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_public: false,
  };

  await saveTemplate(template);
  return template;
}

/**
 * Generate a title from description
 */
function generateTitleFromDescription(description: string): string {
  const words = description.split(' ').slice(0, 6);
  return words.join(' ');
}

/**
 * List templates with pagination and filtering
 */
export async function listTemplates(
  page = 1,
  limit = 20,
  search?: string,
  isPublic?: boolean
): Promise<{
  items: Template[];
  total: number;
  page: number;
  per_page: number;
  has_more: boolean;
}> {
  const templates = await loadTemplates();
  
  let filtered = templates;
  
  // Apply search filter
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(template =>
      template.title.toLowerCase().includes(searchLower) ||
      template.description.toLowerCase().includes(searchLower)
    );
  }
  
  // Apply public filter
  if (isPublic !== undefined) {
    filtered = filtered.filter(template => template.is_public === isPublic);
  }
  
  // Sort by updated_at (newest first)
  filtered.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  
  const total = filtered.length;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const items = filtered.slice(startIndex, endIndex);
  const has_more = endIndex < total;
  
  return {
    items,
    total,
    page,
    per_page: limit,
    has_more,
  };
}

/**
 * Update template properties
 */
export async function updateTemplate(
  id: string,
  updates: Partial<Template>
): Promise<Template | null> {
  const template = await loadTemplate(id);
  if (!template) {
    return null;
  }
  
  const updated = {
    ...template,
    ...updates,
    updated_at: new Date().toISOString(),
  };
  
  await saveTemplate(updated);
  return updated;
}

/**
 * Toggle template public status
 */
export async function toggleTemplatePublic(id: string): Promise<Template | null> {
  const template = await loadTemplate(id);
  if (!template) {
    return null;
  }
  
  const updated = {
    ...template,
    is_public: !template.is_public,
    updated_at: new Date().toISOString(),
  };
  
  await saveTemplate(updated);
  return updated;
}

/**
 * Export templates as JSON
 */
export async function exportTemplates(format: 'json' | 'csv' = 'json'): Promise<string> {
  const templates = await loadTemplates();
  
  if (format === 'csv') {
    // Simple CSV export
    const headers = ['ID', 'Title', 'Description', 'Created', 'Updated', 'Public'];
    const rows = templates.map(t => [
      t.id,
      t.title,
      t.description,
      t.created_at,
      t.updated_at,
      t.is_public ? 'Yes' : 'No',
    ]);
    
    return [headers, ...rows].map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');
  }
  
  // JSON export
  return JSON.stringify(templates, null, 2);
}

/**
 * Import templates from JSON
 */
export async function importTemplates(jsonData: string): Promise<{ imported: number; errors: string[] }> {
  try {
    const data = JSON.parse(jsonData);
    const templates = Array.isArray(data) ? data : [data];
    
    const errors: string[] = [];
    let imported = 0;
    
    for (const templateData of templates) {
      try {
        // Validate template structure
        if (!templateData.id || !templateData.title || !templateData.description) {
          errors.push(`Invalid template structure for item: ${templateData.title || 'Unknown'}`);
          continue;
        }
        
        // Ensure unique ID
        if (await loadTemplate(templateData.id)) {
          templateData.id = nanoid(); // Generate new ID if exists
        }
        
        const template: Template = {
          ...templateData,
          updated_at: new Date().toISOString(),
        };
        
        await saveTemplate(template);
        imported++;
      } catch (error) {
        errors.push(`Failed to import template: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    return { imported, errors };
  } catch (error) {
    return {
      imported: 0,
      errors: [`Invalid JSON data: ${error instanceof Error ? error.message : 'Unknown error'}`],
    };
  }
}

/**
 * Get template statistics
 */
export async function getTemplateStats(): Promise<{
  total: number;
  public: number;
  private: number;
  recently_updated: Template[];
}> {
  const templates = await loadTemplates();
  
  return {
    total: templates.length,
    public: templates.filter(t => t.is_public).length,
    private: templates.filter(t => !t.is_public).length,
    recently_updated: templates
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 5),
  };
}

/**
 * Clean up old templates (older than specified days)
 */
export async function cleanupOldTemplates(daysOld = 90): Promise<number> {
  const templates = await loadTemplates();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  const filtered = templates.filter(template => 
    new Date(template.updated_at) > cutoffDate
  );
  
  const deleted = templates.length - filtered.length;
  
  if (deleted > 0) {
    await saveTemplates(filtered);
  }
  
  return deleted;
}

/**
 * Get storage usage statistics
 */
export async function getStorageStats(): Promise<{
  templates_count: number;
  total_size: number;
  last_updated: string | null;
}> {
  try {
    await ensureStorageDir();
    
    let templatesCount = 0;
    let totalSize = 0;
    let lastUpdated: string | null = null;
    
    if (existsSync(TEMPLATES_FILE)) {
      const stats = await readFile(TEMPLATES_FILE, 'utf-8');
      const templates = JSON.parse(stats);
      templatesCount = Array.isArray(templates) ? templates.length : 0;
      totalSize = Buffer.byteLength(stats, 'utf-8');
      
      if (templatesCount > 0) {
        const latest = templates.sort((a: Template, b: Template) => 
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        )[0];
        lastUpdated = latest.updated_at;
      }
    }
    
    return {
      templates_count: templatesCount,
      total_size: totalSize,
      last_updated: lastUpdated,
    };
  } catch (error) {
    console.error('Failed to get storage stats:', error);
    return {
      templates_count: 0,
      total_size: 0,
      last_updated: null,
    };
  }
}