import { nanoid } from 'nanoid'
import type { GenerationRequest, GenerationResponse, Template } from '@/lib/types'

export async function generateTemplate(request: GenerationRequest): Promise<GenerationResponse> {
  const template: Template = {
    id: nanoid(),
    title: request.description.split(/\s+/).slice(0, 6).join(' ') || 'Generated Template',
    description: request.description,
    theme: request.theme,
    createdAt: new Date().toISOString(),
    blocks: [
      { id: nanoid(), type: 'heading', content: 'Overview' },
      { id: nanoid(), type: 'paragraph', content: request.description },
      { id: nanoid(), type: 'database', content: 'Tasks' },
      { id: nanoid(), type: 'table', content: 'Weekly goals' },
    ],
  }

  return {
    success: true,
    template,
  }
}
