import type { Template } from '@/lib/types'

const STORAGE_KEY = 'templates'

export function saveTemplate(template: Template): void {
  const templates = loadAllTemplates()
  const index = templates.findIndex((t) => t.id === template.id)
  if (index >= 0) {
    templates[index] = template
  } else {
    templates.push(template)
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates))
}

export function loadTemplate(id: string): Template | null {
  const templates = loadAllTemplates()
  return templates.find((t) => t.id === id) || null
}

export function loadAllTemplates(): Template[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return []
  try {
    return JSON.parse(stored) as Template[]
  } catch {
    return []
  }
}

export function deleteTemplate(id: string): void {
  const templates = loadAllTemplates().filter((t) => t.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates))
}
