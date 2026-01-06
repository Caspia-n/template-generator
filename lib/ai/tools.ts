import { ToolDefinition } from "@/lib/types";

export const DEFAULT_MCP_TOOLS: ToolDefinition[] = [
  {
    name: "notion_search",
    description: "Search for existing Notion pages and templates",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query" },
        limit: { type: "number", description: "Max results (default: 10)" },
      },
      required: ["query"],
    },
    server_id: "notion",
  },
  {
    name: "notion_create_page",
    description: "Create a new Notion page with the generated template",
    input_schema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Page title" },
        content: { type: "string", description: "Page content (JSON blocks)" },
        parentId: { type: "string", description: "Parent page/database ID" },
      },
      required: ["title", "content"],
    },
    server_id: "notion",
  },
  {
    name: "notion_update_database",
    description: "Create or update a Notion database with template schema",
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Database name" },
        properties: { type: "object", description: "Database properties/columns" },
        parentId: { type: "string", description: "Parent page ID" },
      },
      required: ["name", "properties"],
    },
    server_id: "notion",
  },
];

export function getToolSchemas(): ToolDefinition[] {
  return DEFAULT_MCP_TOOLS;
}
