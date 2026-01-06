import type { ThemeOption } from '@/lib/types'

export const SYSTEM_PROMPT = `You are an expert Notion template generator. Always respond with valid JSON.`

export function buildPrompt(description: string, theme: ThemeOption) {
  return `Generate a Notion template.\n\nDescription: ${description}\nTheme: ${theme}`
}
