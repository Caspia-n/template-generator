import { NextRequest, NextResponse } from 'next/server';
import { getModelStatus } from '@/lib/ai/llama';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'status';
    
    switch (action) {
      case 'status':
        return await handleGetStatus();
      case 'download':
        return await handleDownloadModel();
      case 'cleanup':
        return await handleCleanupModel();
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
    console.error('Model status API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'API_ERROR',
          message: error instanceof Error ? error.message : 'Model operation failed',
        },
      },
      { status: 500 }
    );
  }
}

async function handleGetStatus() {
  try {
    const status = await getModelStatus();
    
    return NextResponse.json({
      success: true,
      data: status,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'STATUS_FAILED',
          message: error instanceof Error ? error.message : 'Failed to get model status',
        },
      },
      { status: 500 }
    );
  }
}

async function handleDownloadModel() {
  try {
    // This would implement actual model download logic
    // For now, return a mock response
    
    return NextResponse.json({
      success: true,
      data: {
        status: 'downloading',
        progress: 0,
        message: 'Model download not implemented yet',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DOWNLOAD_FAILED',
          message: error instanceof Error ? error.message : 'Model download failed',
        },
      },
      { status: 500 }
    );
  }
}

async function handleCleanupModel() {
  try {
    // This would implement model cleanup logic
    // For now, return a mock response
    
    return NextResponse.json({
      success: true,
      data: {
        status: 'cleaned',
        message: 'Model cleanup not implemented yet',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CLEANUP_FAILED',
          message: error instanceof Error ? error.message : 'Model cleanup failed',
        },
      },
      { status: 500 }
    );
  }
}