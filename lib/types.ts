// Core Types for Notion Template Generator

export interface Template {
  id: string;
  title: string;
  description: string;
  blocks: TemplateBlock[];
  theme: TemplateTheme;
  created_at: string;
  updated_at: string;
  notion_page_id?: string;
  shared_url?: string;
  is_public: boolean;
}

export interface TemplateBlock {
  id: string;
  type: 'heading' | 'paragraph' | 'database' | 'table' | 'image' | 'quote' | 'code' | 'divider';
  content: string;
  properties?: Record<string, any>;
  children?: TemplateBlock[];
  level?: number; // For headings
}

export interface TemplateTheme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    accent: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  spacing: 'compact' | 'comfortable' | 'spacious';
}

export interface GenerationRequest {
  description: string;
  theme: TemplateTheme;
  useMCP: boolean;
  selectedMCPServers: string[];
  includeImages: boolean;
  targetAudience?: string;
  complexity: 'simple' | 'intermediate' | 'advanced';
}

export interface GenerationResponse {
  success: boolean;
  template?: Template;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    model_used: string;
    generation_time: number;
    token_count: number;
  };
}

// MCP Integration Types

export interface MCPServer {
  id: string;
  name: string;
  url: string;
  auth_type: 'oauth_2.1' | 'bearer' | 'none';
  key?: string;
  active: boolean;
  description?: string;
  version?: string;
  capabilities?: string[];
}

export interface ToolDefinition {
  name: string;
  description: string;
  input_schema: Record<string, any>;
  server_id: string;
}

export interface ToolCall {
  tool_name: string;
  tool_use_id: string;
  parameters: Record<string, any>;
}

export interface MCPResponse {
  content: Array<{
    type: 'text' | 'image' | 'resource';
    text?: string;
    image?: {
      data: string;
      mime_type: string;
    };
    resource?: {
      type: string;
      resource: any;
    };
  }>;
  is_error?: boolean;
}

export interface MCPDiscoveryResponse {
  tools: ToolDefinition[];
  resources?: Array<{
    uri: string;
    name: string;
    description?: string;
    mimeType?: string;
  }>;
  prompts?: Array<{
    name: string;
    description: string;
    arguments?: Array<{
      name: string;
      description: string;
      required?: boolean;
    }>;
  }>;
}

// Notion API Types

export interface NotionAuthResponse {
  success: boolean;
  workspace_id?: string;
  workspace_name?: string;
  user_id?: string;
  error?: string;
}

export interface NotionPageCreate {
  parent: {
    type: 'workspace' | 'page_id' | 'database_id';
    workspace?: boolean;
    page_id?: string;
    database_id?: string;
  };
  properties: Record<string, any>;
  children?: any[];
  icon?: {
    type: 'emoji' | 'external' | 'file';
    emoji?: string;
    external?: { url: string };
    file?: { url: string };
  };
  cover?: {
    type: 'external' | 'file';
    external?: { url: string };
    file?: { url: string };
  };
}

export interface NotionPageResponse {
  id: string;
  url: string;
  title?: string;
  created_time: string;
  last_edited_time: string;
  parent?: any;
  properties?: any;
}

// AI/LLM Types

export interface ModelStatus {
  available: boolean;
  loading: boolean;
  progress?: number;
  error?: string;
  model_path?: string;
  model_size?: number;
  download_url?: string;
}

export interface InferenceRequest {
  prompt: string;
  system_prompt?: string;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  stop?: string[];
  stream?: boolean;
}

export interface InferenceResponse {
  text: string;
  tokens_used?: number;
  finish_reason?: 'stop' | 'length' | 'error';
  model?: string;
}

// Utility Types

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  has_more: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: Record<string, any>;
}

// Form Types

export interface TemplateFormData {
  description: string;
  theme_name: string;
  include_images: boolean;
  use_mcp: boolean;
  selected_servers: string[];
  target_audience?: string;
  complexity: 'simple' | 'intermediate' | 'advanced';
}

// Component Props Types

export interface LoadingStateProps {
  isLoading: boolean;
  message?: string;
  progress?: number;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export interface DashboardStats {
  total_templates: number;
  shared_templates: number;
  api_calls_today: number;
  models_downloaded: number;
}

// Configuration Types

export interface AppConfig {
  notion_api_version: string;
  default_model_path: string;
  max_file_size: number;
  supported_image_types: string[];
  mcp_timeout_ms: number;
  inference_timeout_ms: number;
}