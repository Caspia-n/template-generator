/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    esmExternals: true,
  },
  serverExternalPackages: ["node-llama-cpp", "@reflink/reflink"],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mcp.notion.com',
      },
      {
        protocol: 'https',
        hostname: 'www.notion.so',
      },
      {
        protocol: 'https',
        hostname: 'notion.so',
      },
      {
        protocol: 'https',
        hostname: 'prod-files-secure.s3.us-west-2.amazonaws.com',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_MCP_NOTION_URL: process.env.MCP_NOTION_URL,
  },
}

module.exports = nextConfig