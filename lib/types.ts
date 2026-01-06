// Core Types for Notion Template Generator

export type ThemeOption = 'light' | 'dark' | 'system' | 'custom'

export type TemplateBlockType = 'heading' | 'paragraph' | 'database' | 'table'

export interface TemplateBlock {
  id: string
  type: TemplateBlockType
  content: string
  properties?: Record<string, unknown>
}

export interface Template {
  id: string
  title: string
  description: string
  theme: ThemeOption
  blocks: TemplateBlock[]
  createdAt: string
  notionPageId?: string
  sharedUrl?: string
}

export interface GenerationRequest {
  description: string
  theme: ThemeOption
  useMCP: boolean
  selectedServers: string[]
}

export interface GenerationResponse {
  success: boolean
  template?: Template
  error?: {
    code: string
    message: string
    details?: unknown
  }
}

// MCP Integration Types

export interface MCPServer {
  id: string
  name: string
  url: string
  auth_type: 'oauth_2.1' | 'bearer' | 'none'
  key?: string | null
  active: boolean
  description?: string
  version?: string
  capabilities?: string[]
}

export interface ToolDefinition {
  name: string
  description: string
  input_schema: Record<string, any>
  server_id: string
}

export interface ToolCall {
  tool_name: string
  tool_use_id: string
  parameters: Record<string, any>
}

export interface MCPResponse {
  content: Array<{
    type: 'text' | 'image' | 'resource'
    text?: string
    image?: {
      data: string
      mime_type: string
    }
    resource?: {
      type: string
      resource: any
    }
  }>
  is_error?: boolean
}

export interface MCPDiscoveryResponse {
  tools: ToolDefinition[]
  resources?: Array<{
    uri: string
    name: string
    description?: string
    mimeType?: string
  }>
  prompts?: Array<{
    name: string
    description: string
    arguments?: Array<{
      name: string
      description: string
      required?: boolean
    }>
  }>
}

// Notion API Types

export interface NotionAuthResponse {
  success: boolean
  workspace_id?: string
  workspace_name?: string
  user_id?: string
  error?: string
}

export interface NotionPageCreate {
  parent: {
    type: 'workspace' | 'page_id' | 'database_id'
    workspace?: boolean
    page_id?: string
    database_id?: string
  }
  properties: Record<string, any>
  children?: any[]
  icon?: {
    type: 'emoji' | 'external' | 'file'
    emoji?: string
    external?: { url: string }
    file?: { url: string }
  }
  cover?: {
    type: 'external' | 'file'
    external?: { url: string }
    file?: { url: string }
  }
}

export interface NotionPageResponse {
  id: string
  url: string
  title?: string
  created_time: string
  last_edited_time: string
  parent?: any
  properties?: any
}

// AI/LLM Types (stubs for future backend integration)

export interface ModelStatus {
  available: boolean
  loading: boolean
  progress?: number
  error?: string
  model_path?: string
  model_size?: number
  download_url?: string
}

export interface InferenceRequest {
  prompt: string
  system_prompt?: string
  max_tokens?: number
  temperature?: number
  top_p?: number
  stop?: string[]
  stream?: boolean
}

export interface InferenceResponse {
  text: string
  tokens_used?: number
  finish_reason?: 'stop' | 'length' | 'error'
  model?: string
}

// Utility Types

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  metadata?: Record<string, any>
}
