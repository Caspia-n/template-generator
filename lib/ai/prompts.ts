import { ToolDefinition } from "@/lib/types";

export function getSystemPrompt(useMCP: boolean, tools?: ToolDefinition[]): string {
  let prompt = `You are an expert Notion template creator. Your task is to generate high-quality Notion template structures based on user descriptions.

Rules:
1. Generate templates as JSON with a 'blocks' array.
2. Each block must have: id (unique string), type (heading|paragraph|database|table), content (string), and optional properties (object).
3. Keep templates modular and reusable.
4. Support 3-5 block variations for variety.
5. Always return valid JSON.
6. Maximum 100 blocks per template.
7. Be creative but professional.`;

  if (useMCP && tools && tools.length > 0) {
    prompt += `

You have access to the following MCP tools:
${tools
  .map(
    (tool) => `- ${tool.name}: ${tool.description}
  Input schema: ${JSON.stringify(tool.input_schema)}`
  )
  .join("\n")}

When you want to use a tool, return JSON with a "tool_calls" array like this:
{
  "template": {...},
  "tool_calls": [
    {
      "tool_name": "notion_create_page",
      "tool_use_id": "unique_id",
      "parameters": {...}
    }
  ]
}`;
  }

  return prompt;
}

export function getUserPrompt(description: string, theme: string): string {
  return `Create a Notion template with the following specifications:
Description: ${description}
Theme: ${theme}

Generate a complete template structure ready for immediate use.`;
}

export function toolCallingPrompt(
  toolName: string,
  toolDescription: string,
  parameters: Record<string, unknown>
): string {
  return `You just executed the MCP tool "${toolName}".
Tool description: ${toolDescription}
Tool result: ${JSON.stringify(parameters)}

Now, update the template based on this tool result if applicable.`;
}
