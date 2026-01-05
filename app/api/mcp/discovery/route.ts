import { NextRequest, NextResponse } from 'next/server';
import { mcpClient } from '@/lib/mcp/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serverId = searchParams.get('serverId');
    
    if (!serverId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Server ID is required',
          },
        },
        { status: 400 }
      );
    }

    // Discover tools from the MCP server
    const result = await mcpClient.discoverTools(serverId);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('MCP discovery API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DISCOVERY_FAILED',
          message: error instanceof Error ? error.message : 'Tool discovery failed',
        },
      },
      { status: 500 }
    );
  }
}