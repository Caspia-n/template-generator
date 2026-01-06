import { NextRequest, NextResponse } from "next/server";
import { generateTemplate } from "@/lib/ai/inference";
import { GenerationRequestSchema } from "@/lib/validation";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate request
    const validatedData = GenerationRequestSchema.parse(body);
    
    // Get model path from request or header
    const modelPath = body.modelPath || req.headers.get("x-model-path");
    
    if (!modelPath) {
      return NextResponse.json(
        { error: "No model selected. Please select a GGUF model first." },
        { status: 400 }
      );
    }

    console.log("[API] Generation request received:", validatedData.description);
    console.log("[API] Using model:", modelPath);

    // Generate template
    const result = await generateTemplate(validatedData, modelPath);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    if (!result.template) {
      return NextResponse.json(
        { error: "Failed to generate template" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      template: result.template,
      toolCalls: result.toolCalls || [],
    });
  } catch (error) {
    console.error("[API] Error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request format", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
