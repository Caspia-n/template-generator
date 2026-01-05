import { NextRequest, NextResponse } from 'next/server';
import { loadMCPConfig, saveMCPConfig, validateMCPServer, initializeMCPConfig } from '@/lib/mcp/config';
import type { MCPServer } from '@/lib/types';

export async function GET() {
  try {
    // Initialize config if it doesn't exist
    await initializeMCPConfig();
    
    // Load current configuration
    const servers = await loadMCPConfig();

    return NextResponse.json({
      success: true,
      data: servers,
    });
  } catch (error) {
    console.error('MCP config load API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'LOAD_FAILED',
          message: error instanceof Error ? error.message : 'Failed to load MCP configuration',
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Handle different actions
    switch (body.action) {
      case 'save':
        return await handleSaveConfig(body.servers);
        
      case 'test':
        return await handleTestConnection(body.serverId);
        
      case 'add':
        return await handleAddServer(body.server);
        
      case 'update':
        return await handleUpdateServer(body.serverId, body.updates);
        
      case 'delete':
        return await handleDeleteServer(body.serverId);
        
      default:
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_ACTION',
              message: 'Invalid action specified',
            },
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('MCP config API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'API_ERROR',
          message: error instanceof Error ? error.message : 'Configuration operation failed',
        },
      },
      { status: 500 }
    );
  }
}

async function handleSaveConfig(servers: MCPServer[]) {
  try {
    // Validate all servers
    for (const server of servers) {
      const validation = validateMCPServer(server);
      if (!validation.success) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: `Invalid server configuration: ${validation.errors.join(', ')}`,
            },
          },
          { status: 400 }
        );
      }
    }

    // Save configuration
    await saveMCPConfig(servers);

    return NextResponse.json({
      success: true,
      message: 'Configuration saved successfully',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SAVE_FAILED',
          message: error instanceof Error ? error.message : 'Failed to save configuration',
        },
      },
      { status: 500 }
    );
  }
}

async function handleTestConnection(serverId: string) {
  try {
    // Load current configuration
    const servers = await loadMCPConfig();
    const server = servers.find(s => s.id === serverId);
    
    if (!server) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SERVER_NOT_FOUND',
            message: 'Server not found',
          },
        },
        { status: 404 }
      );
    }

    // Test connection (this would be implemented in the MCP client)
    // For now, we'll return a mock response
    const isConnected = true; // TODO: Implement actual connection test

    return NextResponse.json({
      success: true,
      data: {
        serverId,
        connected: isConnected,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'TEST_FAILED',
          message: error instanceof Error ? error.message : 'Connection test failed',
        },
      },
      { status: 500 }
    );
  }
}

async function handleAddServer(server: MCPServer) {
  try {
    // Validate server
    const validation = validateMCPServer(server);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: `Invalid server: ${validation.errors.join(', ')}`,
          },
        },
        { status: 400 }
      );
    }

    // Load current configuration
    const servers = await loadMCPConfig();
    
    // Check for duplicate IDs
    if (servers.some(s => s.id === server.id)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DUPLICATE_ID',
            message: 'Server ID already exists',
          },
        },
        { status: 400 }
      );
    }

    // Add server and save
    servers.push(server);
    await saveMCPConfig(servers);

    return NextResponse.json({
      success: true,
      data: server,
      message: 'Server added successfully',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'ADD_FAILED',
          message: error instanceof Error ? error.message : 'Failed to add server',
        },
      },
      { status: 500 }
    );
  }
}

async function handleUpdateServer(serverId: string, updates: Partial<MCPServer>) {
  try {
    // Load current configuration
    const servers = await loadMCPConfig();
    const serverIndex = servers.findIndex(s => s.id === serverId);
    
    if (serverIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SERVER_NOT_FOUND',
            message: 'Server not found',
          },
        },
        { status: 404 }
      );
    }

    // Update server
    servers[serverIndex] = { ...servers[serverIndex], ...updates };
    
    // Validate updated server
    const validation = validateMCPServer(servers[serverIndex]);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: `Invalid server update: ${validation.errors.join(', ')}`,
          },
        },
        { status: 400 }
      );
    }

    // Save configuration
    await saveMCPConfig(servers);

    return NextResponse.json({
      success: true,
      data: servers[serverIndex],
      message: 'Server updated successfully',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UPDATE_FAILED',
          message: error instanceof Error ? error.message : 'Failed to update server',
        },
      },
      { status: 500 }
    );
  }
}

async function handleDeleteServer(serverId: string) {
  try {
    // Load current configuration
    const servers = await loadMCPConfig();
    const filteredServers = servers.filter(s => s.id !== serverId);
    
    if (filteredServers.length === servers.length) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SERVER_NOT_FOUND',
            message: 'Server not found',
          },
        },
        { status: 404 }
      );
    }

    // Save configuration
    await saveMCPConfig(filteredServers);

    return NextResponse.json({
      success: true,
      message: 'Server deleted successfully',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DELETE_FAILED',
          message: error instanceof Error ? error.message : 'Failed to delete server',
        },
      },
      { status: 500 }
    );
  }
}