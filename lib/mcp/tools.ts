import type { ToolDefinition, ToolCall, MCPServer } from '@/lib/types';
import { mcpClient } from './client';

/**
 * Tool registry for managing available MCP tools
 */
export class ToolRegistry {
  private tools: Map<string, ToolDefinition> = new Map();
  private serverTools: Map<string, Set<string>> = new Map();

  constructor() {
    this.initializeDefaultTools();
  }

  /**
   * Initialize default tools from configured servers
   */
  private initializeDefaultTools() {
    const servers = mcpClient.getActiveServers();
    
    servers.forEach(server => {
      this.loadServerTools(server.id);
    });
  }

  /**
   * Load tools from a specific server
   */
  async loadServerTools(serverId: string): Promise<ToolDefinition[]> {
    try {
      const discovery = await mcpClient.discoverTools(serverId);
      const tools = discovery.tools || [];

      // Register tools
      tools.forEach(tool => {
        this.registerTool(tool);
        this.addServerTool(serverId, tool.name);
      });

      return tools;
    } catch (error) {
      console.error(`Failed to load tools from server ${serverId}:`, error);
      return [];
    }
  }

  /**
   * Register a tool in the registry
   */
  registerTool(tool: ToolDefinition): void {
    this.tools.set(tool.name, tool);
  }

  /**
   * Add tool to server's tool set
   */
  private addServerTool(serverId: string, toolName: string): void {
    if (!this.serverTools.has(serverId)) {
      this.serverTools.set(serverId, new Set());
    }
    this.serverTools.get(serverId)!.add(toolName);
  }

  /**
   * Get all registered tools
   */
  getAllTools(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get tools for a specific server
   */
  getServerTools(serverId: string): ToolDefinition[] {
    const toolNames = this.serverTools.get(serverId) || new Set();
    return Array.from(toolNames).map(name => this.tools.get(name)).filter(Boolean) as ToolDefinition[];
  }

  /**
   * Get a specific tool by name
   */
  getTool(toolName: string): ToolDefinition | undefined {
    return this.tools.get(toolName);
  }

  /**
   * Check if a tool exists
   */
  hasTool(toolName: string): boolean {
    return this.tools.has(toolName);
  }

  /**
   * Get tools by category/capability
   */
  getToolsByCapability(capability: string): ToolDefinition[] {
    return this.getAllTools().filter(tool => {
      // This would be implemented based on tool metadata
      // For now, return all tools
      return true;
    });
  }

  /**
   * Execute a tool call
   */
  async executeToolCall(toolCall: ToolCall): Promise<any> {
    const tool = this.getTool(toolCall.tool_name);
    if (!tool) {
      throw new Error(`Tool not found: ${toolCall.tool_name}`);
    }

    // Validate parameters against schema
    this.validateToolParameters(tool, toolCall.parameters);

    try {
      // Find which server hosts this tool
      const serverId = this.findServerForTool(toolCall.tool_name);
      if (!serverId) {
        throw new Error(`No server found for tool: ${toolCall.tool_name}`);
      }

      // Execute the tool via MCP client
      const response = await mcpClient.callTool(serverId, toolCall);
      
      return response;
    } catch (error) {
      console.error(`Tool execution failed for ${toolCall.tool_name}:`, error);
      throw error;
    }
  }

  /**
   * Validate tool parameters against schema
   */
  private validateToolParameters(tool: ToolDefinition, parameters: Record<string, any>): void {
    const schema = tool.input_schema;
    if (!schema || !schema.properties) {
      return; // No schema validation available
    }

    const required = schema.required || [];
    
    // Check required parameters
    required.forEach((param: string) => {
      if (!(param in parameters)) {
        throw new Error(`Missing required parameter: ${param}`);
      }
    });

    // Validate parameter types
    Object.entries(parameters).forEach(([key, value]) => {
      if (schema.properties[key]) {
        const expectedType = schema.properties[key].type;
        if (!this.validateType(value, expectedType)) {
          throw new Error(`Invalid type for parameter ${key}. Expected: ${expectedType}`);
        }
      }
    });
  }

  /**
   * Validate parameter type
   */
  private validateType(value: any, expectedType: string): boolean {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      case 'null':
        return value === null;
      default:
        return true; // Unknown type, skip validation
    }
  }

  /**
   * Find which server hosts a specific tool
   */
  private findServerForTool(toolName: string): string | null {
    for (const [serverId, toolNames] of this.serverTools.entries()) {
      if (toolNames.has(toolName)) {
        return serverId;
      }
    }
    return null;
  }

  /**
   * Get tool execution statistics
   */
  getToolStats(): Record<string, { total_calls: number; success_rate: number; avg_execution_time: number }> {
    // This would be implemented with actual execution tracking
    // For now, return mock data
    return {};
  }

  /**
   * Clear tool registry
   */
  clear(): void {
    this.tools.clear();
    this.serverTools.clear();
  }
}

// Export singleton instance
export const toolRegistry = new ToolRegistry();

/**
 * Utility functions for tool management
 */

/**
 * Create a tool call with proper formatting
 */
export function createToolCall(
  toolName: string,
  parameters: Record<string, any>,
  toolUseId?: string
): ToolCall {
  return {
    tool_name: toolName,
    tool_use_id: toolUseId || `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    parameters,
  };
}

/**
 * Batch execute multiple tool calls
 */
export async function executeBatchToolCalls(toolCalls: ToolCall[]): Promise<any[]> {
  const results = await Promise.allSettled(
    toolCalls.map(toolCall => toolRegistry.executeToolCall(toolCall))
  );

  return results.map((result, index) => ({
    tool_call: toolCalls[index],
    success: result.status === 'fulfilled',
    result: result.status === 'fulfilled' ? result.value : null,
    error: result.status === 'rejected' ? result.reason : null,
  }));
}

/**
 * Get available tools for a specific use case
 */
export function getToolsForUseCase(useCase: 'template_generation' | 'page_creation' | 'database_management'): ToolDefinition[] {
  switch (useCase) {
    case 'template_generation':
      return toolRegistry.getToolsByCapability('template');
    case 'page_creation':
      return toolRegistry.getAllTools().filter(tool => 
        tool.name.includes('page') || tool.name.includes('create')
      );
    case 'database_management':
      return toolRegistry.getAllTools().filter(tool => 
        tool.name.includes('database') || tool.name.includes('query')
      );
    default:
      return toolRegistry.getAllTools();
  }
}