import { NextRequest, NextResponse } from 'next/server';
import { shareNotionPage } from '@/lib/notion/client';

export async function POST(request: NextRequest) {
  try {
    const { pageId } = await request.json();
    
    // Validate required fields
    if (!pageId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Page ID is required',
          },
        },
        { status: 400 }
      );
    }

    // Get page share info
    const result = await shareNotionPage(pageId);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Notion share page API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SHARE_FAILED',
          message: error instanceof Error ? error.message : 'Failed to get page share info',
        },
      },
      { status: 500 }
    );
  }
}