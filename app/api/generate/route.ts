import { NextRequest, NextResponse } from 'next/server';
import { generateTemplate } from '@/lib/ai/tools';
import type { GenerationRequest } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: GenerationRequest = await request.json();
    
    // Validate required fields
    if (!body.description || !body.theme || !body.complexity) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: 'Missing required fields: description, theme, complexity' 
          } 
        },
        { status: 400 }
      );
    }

    // Generate template
    const result = await generateTemplate(body);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Template generation API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'GENERATION_ERROR', 
          message: error instanceof Error ? error.message : 'Template generation failed' 
        } 
      },
      { status: 500 }
    );
  }
}