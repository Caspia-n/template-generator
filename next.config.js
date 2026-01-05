/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    esmExternals: true,
  },
  images: {
    domains: [
      'mcp.notion.com',
      'www.notion.so',
      'notion.so',
      'prod-files-secure.s3.us-west-2.amazonaws.com',
    ],
  },
  env: {
    NEXT_PUBLIC_MCP_NOTION_URL: process.env.MCP_NOTION_URL,
  },
}

module.exports = nextConfig