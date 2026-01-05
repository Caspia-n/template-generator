import { NextRequest, NextResponse } from 'next/server';
import { mcpClient } from '@/lib/mcp/client';
import type { ToolCall } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { serverId, toolCall } = await request.json();
    
    // Validate required fields
    if (!serverId || !toolCall) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Server ID and tool call are required',
          },
        },
        { status: 400 }
      );
    }

    // Call tool on the MCP server
    const result = await mcpClient.callTool(serverId, toolCall as ToolCall);

    return NextResponse.json({
      success: !result.is_error,
      data: result,
    });
  } catch (error) {
    console.error('MCP tool call API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CALL_FAILED',
          message: error instanceof Error ? error.message : 'Tool call failed',
        },
      },
      { status: 500 }
    );
  }
}