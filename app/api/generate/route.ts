import { NextRequest, NextResponse } from 'next/server'
import { GenerationRequestSchema } from '@/lib/validation'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)

  const parsed = GenerationRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request payload',
          details: parsed.error.flatten(),
        },
      },
      { status: 400 }
    )
  }

  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'Template generation is not implemented yet (Task 3+)',
      },
    },
    { status: 501 }
  )
}
