import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs/promises";
import * as path from "path";

export async function POST(req: NextRequest) {
  try {
    const { modelPath } = await req.json();

    if (!modelPath) {
      return NextResponse.json(
        { error: "Model path is required" },
        { status: 400 }
      );
    }

    // Security: prevent directory traversal
    const normalized = path.normalize(modelPath);
    if (normalized.includes("..")) {
      return NextResponse.json(
        { error: "Invalid path" },
        { status: 400 }
      );
    }

    // Check file exists and is GGUF
    const stat = await fs.stat(modelPath);
    
    if (!modelPath.toLowerCase().endsWith(".gguf")) {
      return NextResponse.json(
        { error: "File must be a .gguf model file" },
        { status: 400 }
      );
    }

    if (stat.size < 100 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Model file must be at least 100MB" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      filename: path.basename(modelPath),
      size: (stat.size / (1024 ** 3)).toFixed(2) + " GB",
    });
  } catch (error) {
    return NextResponse.json(
      {
        valid: false,
        error: error instanceof Error ? error.message : "File not found or inaccessible",
      },
      { status: 400 }
    );
  }
}
