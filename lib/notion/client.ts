import { Client } from '@notionhq/client';
import type { 
  NotionPageCreate, 
  NotionPageResponse, 
  NotionAuthResponse, 
  Template, 
  TemplateBlock 
} from '@/lib/types';

/**
 * Create a Notion client with the configured API version
 */
export function createNotionClient(token?: string): Client {
  const apiVersion = process.env.NOTION_API_VERSION || '2025-09-03';
  
  return new Client({
    auth: token || process.env.NOTION_TOKEN,
    notionVersion: apiVersion,
  });
}

/**
 * Test Notion API authentication
 */
export async function testNotionAuth(token?: string): Promise<NotionAuthResponse> {
  try {
    const client = createNotionClient(token);
    
    // Get user info to test auth
    const user = await client.users.me({});
    
    // Get workspace info
    const workspaces = await client.users.list({});
    
    return {
      success: true,
      user_id: user.id,
      workspace_id: workspaces.results[0]?.id,
      workspace_name: workspaces.results[0]?.name || undefined,
    };
  } catch (error) {
    console.error('Notion auth test failed:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Authentication failed',
    };
  }
}

/**
 * Convert internal template blocks to Notion blocks format
 */
function convertBlocksToNotion(blocks: TemplateBlock[]): any[] {
  return blocks.map(block => {
    switch (block.type) {
      case 'heading':
        const headingType = block.level === 1 ? 'heading_1' : 
                           block.level === 2 ? 'heading_2' : 'heading_3';
        return {
          object: 'block',
          type: headingType,
          [headingType]: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: block.content,
                },
              },
            ],
          },
        };

      case 'paragraph':
        return {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: block.content,
                },
              },
            ],
          },
        };

      case 'divider':
        return {
          object: 'block',
          type: 'divider',
          divider: {},
        };

      case 'image':
        return {
          object: 'block',
          type: 'image',
          image: {
            type: 'external',
            external: {
              url: block.content,
            },
          },
        };

      case 'quote':
        return {
          object: 'block',
          type: 'quote',
          quote: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: block.content,
                },
              },
            ],
          },
        };

      case 'code':
        return {
          object: 'block',
          type: 'code',
          code: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: block.content,
                },
              },
            ],
            language: 'plain text',
          },
        };

      case 'database':
        // For databases, we'll create a placeholder and let the user set up properties
        return {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: `📊 Database: ${block.content} (configure properties in Notion)`,
                },
              },
            ],
          },
        };

      case 'table':
        // For tables, we'll create a placeholder
        return {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: `📋 Table: ${block.content} (create table in Notion)`,
                },
              },
            ],
          },
        };

      default:
        return {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: block.content,
                },
              },
            ],
          },
        };
    }
  });
}

/**
 * Create a Notion page from a template
 */
export async function createNotionPage(
  template: Template,
  parentOptions?: {
    parent_type?: 'workspace' | 'page_id' | 'database_id';
    parent_id?: string;
  }
): Promise<NotionPageResponse> {
  try {
    const client = createNotionClient();
    
    // Determine parent
    let parent: any;
    
    if (parentOptions?.parent_type && parentOptions?.parent_id) {
      switch (parentOptions.parent_type) {
        case 'page_id':
          parent = { type: 'page_id', page_id: parentOptions.parent_id };
          break;
        case 'database_id':
          parent = { type: 'database_id', database_id: parentOptions.parent_id };
          break;
        default:
          parent = { type: 'workspace', workspace: true };
      }
    } else {
      // Default to workspace
      parent = { type: 'workspace', workspace: true };
    }

    // Create page properties
    const properties: Record<string, any> = {
      title: {
        title: [
          {
            text: {
              content: template.title,
            },
          },
        ],
      },
    };

    // Add description as a property if available
    if (template.description) {
      properties.description = {
        rich_text: [
          {
            text: {
              content: template.description,
            },
          },
        ],
      };
    }

    // Convert template blocks to Notion format
    const children = convertBlocksToNotion(template.blocks);

    // Create the page
    const response = await client.pages.create({
      parent,
      properties,
      children,
    });

    return {
      id: response.id,
      url: (response as any).url,
      title: template.title,
      created_time: (response as any).created_time,
      last_edited_time: (response as any).last_edited_time,
      parent: (response as any).parent,
      properties: (response as any).properties,
    };
  } catch (error) {
    console.error('Failed to create Notion page:', error);
    throw new Error(`Failed to create Notion page: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Share a Notion page publicly
 */
export async function shareNotionPage(pageId: string): Promise<{ url: string }> {
  try {
    const client = createNotionClient();
    
    // Get page info
    const page = await client.pages.retrieve({ page_id: pageId });
    
    // Notion API doesn't have a direct "share publicly" endpoint
    // Instead, we return the page URL which can be shared
    // Users can manually set sharing permissions in Notion
    
    const pageUrl = (page as any).url;
    
    return {
      url: pageUrl,
    };
  } catch (error) {
    console.error('Failed to get page share info:', error);
    throw new Error(`Failed to get page share info: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * List user's pages and databases
 */
export async function listUserPages(limit = 50): Promise<any[]> {
  try {
    const client = createNotionClient();
    
    // Search for pages and databases
    const response = await client.search({
      filter: {
        property: 'object',
        value: 'page',
      },
      sort: {
        direction: 'descending',
        timestamp: 'last_edited_time',
      },
      page_size: limit,
    });

    return response.results;
  } catch (error) {
    console.error('Failed to list user pages:', error);
    throw new Error(`Failed to list user pages: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get template structure from an existing Notion page
 */
export async function extractTemplateFromPage(pageId: string): Promise<Partial<Template>> {
  try {
    const client = createNotionClient();
    
    // Get page blocks
    const blocks = await client.blocks.children.list({
      block_id: pageId,
    });

    // Convert Notion blocks back to our template format
    const templateBlocks: TemplateBlock[] = blocks.results.map((block: any) => {
      const blockType = Object.keys(block).find(key => 
        ['heading_1', 'heading_2', 'heading_3', 'paragraph', 'divider', 'image', 'quote', 'code'].includes(key)
      );

      if (!blockType) {
        return {
          id: block.id,
          type: 'paragraph',
          content: 'Unknown block type',
        };
      }

      const blockContent = block[blockType];
      let content = '';
      let type: TemplateBlock['type'] = 'paragraph';
      let level = 1;

      if (blockContent.rich_text) {
        content = blockContent.rich_text
          .map((richText: any) => richText.plain_text || richText.text?.content || '')
          .join('');
      } else if (blockContent.external?.url) {
        content = blockContent.external.url;
      }

      switch (blockType) {
        case 'heading_1':
          type = 'heading';
          level = 1;
          break;
        case 'heading_2':
          type = 'heading';
          level = 2;
          break;
        case 'heading_3':
          type = 'heading';
          level = 3;
          break;
        case 'divider':
          type = 'divider';
          content = '';
          break;
        case 'image':
          type = 'image';
          break;
        case 'quote':
          type = 'quote';
          break;
        case 'code':
          type = 'code';
          break;
        default:
          type = 'paragraph';
      }

      return {
        id: block.id,
        type,
        content,
        level,
      };
    });

    // Get page properties
    const page = await client.pages.retrieve({ page_id: pageId });
    const properties = (page as any).properties;

    let title = 'Untitled';
    let description = '';

    if (properties.title?.title?.[0]?.plain_text) {
      title = properties.title.title[0].plain_text;
    }

    if (properties.description?.rich_text?.[0]?.plain_text) {
      description = properties.description.rich_text[0].plain_text;
    }

    return {
      title,
      description,
      blocks: templateBlocks,
      created_at: (page as any).created_time,
      updated_at: (page as any).last_edited_time,
      notion_page_id: pageId,
    };
  } catch (error) {
    console.error('Failed to extract template from page:', error);
    throw new Error(`Failed to extract template: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}