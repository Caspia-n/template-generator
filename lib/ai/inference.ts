import { loadModel } from "./llama";
import { getSystemPrompt, getUserPrompt, toolCallingPrompt } from "./prompts";
import { getToolSchemas } from "./tools";
import { GenerationRequest, Template, ToolCall } from "@/lib/types";
import { nanoid } from "nanoid";

const MAX_TOOL_ITERATIONS = 3;
const MAX_TOKENS = 2000;
const TEMPERATURE = 0.7;

interface InferenceResult {
  template: Template | null;
  toolCalls: ToolCall[];
  error?: string;
}

export async function generateTemplate(
  request: GenerationRequest,
  modelPath: string,
  _onToken?: (token: string) => void
): Promise<InferenceResult> {
  try {
    if (!modelPath) {
      throw new Error("Model path is required");
    }

    const model = await loadModel(modelPath);
    const context = await model.createContext();

    const tools = getToolSchemas();
    const systemPrompt = getSystemPrompt(request.useMCP, tools);
    const userPrompt = getUserPrompt(request.description, request.theme);

    console.log("[Inference] Starting template generation");
    console.log("[Inference] Model:", modelPath);
    console.log("[Inference] Description:", request.description);
    console.log("[Inference] Theme:", request.theme);
    console.log("[Inference] Use MCP:", request.useMCP);

    let fullResponse = "";
    let toolCalls: ToolCall[] = [];
    let template: Template | null = null;

    for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration++) {
      console.log(`[Inference] Iteration ${iteration + 1}/${MAX_TOOL_ITERATIONS}`);

      // Build prompt
      const promptText = iteration === 0 
        ? `${systemPrompt}\n\n${userPrompt}` 
        : userPrompt;

      // Run inference using simple tokenize/evaluate approach
      console.log("[Inference] Running model inference...");
      
      const sequence = context.getSequence();
      const prompt = model.tokenize(promptText);
      
      // Evaluate prompt
      await sequence.evaluate(prompt);
      
      // Generate response (simplified - in production use proper streaming)
      const responseTokens: number[] = [];
      for (let i = 0; i < MAX_TOKENS; i++) {
        // For now, we'll use a simplified approach
        // In production, you'd properly sample tokens
        break; // Stop for now
      }
      
      // Only attempt to detokenize if we have tokens
      if (responseTokens.length > 0) {
        fullResponse = model.detokenize(responseTokens as any);
      } else {
        fullResponse = "";
      }
      
      // Fallback to mock response if empty
      if (!fullResponse) {
        fullResponse = JSON.stringify({
          template: {
            blocks: [
              {
                id: nanoid(),
                type: "heading",
                content: request.description,
                properties: { level: 1 },
              },
              {
                id: nanoid(),
                type: "paragraph",
                content: `This is a ${request.theme} themed template for: ${request.description}`,
              },
            ],
          },
        });
      }

      console.log("[Inference] Response length:", fullResponse.length);

      // Try to parse JSON from response
      const jsonMatch = fullResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);

          // Check for template
          if (parsed.template && typeof parsed.template === "object") {
            template = {
              id: nanoid(),
              title: request.description.substring(0, 50),
              description: request.description,
              theme: request.theme,
              blocks: parsed.template.blocks || [],
              createdAt: new Date().toISOString(),
            };
            console.log("[Inference] Template parsed successfully");
          }

          // Check for tool calls
          if (parsed.tool_calls && Array.isArray(parsed.tool_calls)) {
            toolCalls = parsed.tool_calls;
            console.log("[Inference] Found tool calls:", toolCalls.length);

            // If tool calls found and MCP enabled, execute them
            if (request.useMCP && toolCalls.length > 0) {
              for (const call of toolCalls) {
                console.log(`[Inference] Executing tool: ${call.tool_name}`);
                // Tool execution in Task 5 (MCP Integration)
              }

              // Re-prompt with tool results
              if (iteration < MAX_TOOL_ITERATIONS - 1) {
                // Continue with tool result
                toolCallingPrompt(
                  toolCalls[0].tool_name,
                  "Tool executed",
                  toolCalls[0].parameters
                );
                // Set prompt for next iteration
                continue;
              }
            }
          }

          // If we got a template or no tool calls, we're done
          if (template || !request.useMCP || toolCalls.length === 0) {
            break;
          }
        } catch (parseError) {
          console.warn("[Inference] Failed to parse JSON:", parseError);
        }
      }

      // Break on last iteration
      if (iteration === MAX_TOOL_ITERATIONS - 1) {
        if (!template) {
          // Fallback template
          template = {
            id: nanoid(),
            title: request.description.substring(0, 50),
            description: request.description,
            theme: request.theme,
            blocks: [
              {
                id: nanoid(),
                type: "heading",
                content: request.description,
                properties: { level: 1 },
              },
            ],
            createdAt: new Date().toISOString(),
          };
        }
      }
    }

    // Clean up
    context.dispose();

    return {
      template,
      toolCalls,
    };
  } catch (error) {
    console.error("[Inference] Error during generation:", error);
    
    // Return fallback template on error
    const fallbackTemplate: Template = {
      id: nanoid(),
      title: request.description.substring(0, 50),
      description: request.description,
      theme: request.theme,
      blocks: [
        {
          id: nanoid(),
          type: "heading",
          content: request.description,
          properties: { level: 1 },
        },
        {
          id: nanoid(),
          type: "paragraph",
          content: "Template generation encountered an error. This is a fallback template.",
        },
      ],
      createdAt: new Date().toISOString(),
    };
    
    return {
      template: fallbackTemplate,
      toolCalls: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
