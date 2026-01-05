import { NextRequest, NextResponse } from 'next/server';
import { testNotionAuth } from '@/lib/notion/client';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    
    const result = await testNotionAuth(token);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        data: {
          user_id: result.user_id,
          workspace_id: result.workspace_id,
          workspace_name: result.workspace_name,
        },
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'AUTH_FAILED',
            message: result.error || 'Authentication failed',
          },
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Notion auth API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'API_ERROR',
          message: error instanceof Error ? error.message : 'Authentication check failed',
        },
      },
      { status: 500 }
    );
  }
}