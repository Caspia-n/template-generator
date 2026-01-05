import { writeFile, readFile, access, constants } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import type { MCPServer } from '@/lib/types';

const CONFIG_PATH = './mcp-servers.json';

/**
 * Load MCP server configuration from file
 */
export async function loadMCPConfig(): Promise<MCPServer[]> {
  try {
    // Try to read from file first
    if (existsSync(CONFIG_PATH)) {
      const data = await readFile(CONFIG_PATH, 'utf-8');
      const config = JSON.parse(data);
      return config.servers || [];
    }
  } catch (error) {
    console.error('Failed to load MCP config from file:', error);
  }

  // Fallback to environment-based configuration
  const servers: MCPServer[] = [];

  // Load Notion MCP from environment
  if (process.env.NOTION_MCP_URL) {
    servers.push({
      id: 'notion-mcp',
      name: 'Notion MCP',
      url: process.env.NOTION_MCP_URL,
      auth_type: 'oauth_2.1',
      active: true,
      description: 'Official Notion MCP server for database and page operations',
      version: '1.0.0',
      capabilities: ['database', 'page', 'search', 'template'],
    });
  }

  return servers;
}

/**
 * Save MCP server configuration to file
 */
export async function saveMCPConfig(servers: MCPServer[]): Promise<void> {
  try {
    const config = {
      servers,
      updated_at: new Date().toISOString(),
      version: '1.0',
    };

    await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error('Failed to save MCP config:', error);
    throw new Error(`Failed to save configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validate MCP server configuration
 */
export function validateMCPServer(server: Partial<MCPServer>): string[] {
  const errors: string[] = [];

  if (!server.id || typeof server.id !== 'string') {
    errors.push('Server ID is required');
  }

  if (!server.name || typeof server.name !== 'string') {
    errors.push('Server name is required');
  }

  if (!server.url || typeof server.url !== 'string') {
    errors.push('Server URL is required');
  }

  if (!server.auth_type || !['oauth_2.1', 'bearer', 'none'].includes(server.auth_type)) {
    errors.push('Valid auth_type is required (oauth_2.1, bearer, none)');
  }

  // Validate URL format
  if (server.url && !isValidUrl(server.url)) {
    errors.push('Invalid URL format');
  }

  return errors;
}

/**
 * Check if string is a valid URL
 */
function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get default MCP configuration
 */
export function getDefaultMCPConfig(): MCPServer[] {
  return [
    {
      id: 'notion-mcp',
      name: 'Notion MCP',
      url: 'https://mcp.notion.com/mcp',
      auth_type: 'oauth_2.1',
      active: true,
      description: 'Official Notion MCP server for database and page operations',
      version: '1.0.0',
      capabilities: ['database', 'page', 'search', 'template'],
    },
  ];
}

/**
 * Initialize MCP configuration if it doesn't exist
 */
export async function initializeMCPConfig(): Promise<void> {
  try {
    // Check if config file exists
    await access(CONFIG_PATH, constants.F_OK);
  } catch {
    // File doesn't exist, create with defaults
    const defaultConfig = getDefaultMCPConfig();
    await saveMCPConfig(defaultConfig);
  }
}