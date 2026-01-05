import { NextRequest, NextResponse } from 'next/server';
import { createNotionPage } from '@/lib/notion/client';
import type { Template } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { template, parentOptions } = await request.json();
    
    // Validate required fields
    if (!template || !template.title || !template.description) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Template with title and description is required',
          },
        },
        { status: 400 }
      );
    }

    // Create Notion page
    const result = await createNotionPage(template as Template, parentOptions);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Notion create page API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CREATE_FAILED',
          message: error instanceof Error ? error.message : 'Failed to create Notion page',
        },
      },
      { status: 500 }
    );
  }
}