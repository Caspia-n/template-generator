# Notion Template Generator

A production-ready Next.js 14 application with AI-powered Notion template generation, local inference, and MCP integration.

## Features

- 🤖 **AI-Powered Template Generation**: Create custom Notion templates using local AI inference
- 🔗 **MCP Integration**: Model Context Protocol support for advanced workflow integrations  
- 📄 **Direct Notion Integration**: Seamlessly create and share templates directly to Notion
- 🎨 **Multiple Themes**: Choose from various visual themes and complexity levels
- 🛡️ **Production Ready**: Built with Next.js 14, TypeScript, and modern development practices

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Setup environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your NOTION_TOKEN
   ```

3. **Start development**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   npm run start
   ```

## Environment Setup

Required environment variables:
```env
NOTION_TOKEN=sk-proj-your-internal-token
NOTION_API_VERSION=2025-09-03
MODEL_PATH=./public/models/Qwen3-30B-A3B-Instruct-2507-UD-Q5_K_XL.gguf
AUTO_DOWNLOAD_MODEL=true
```

## Project Structure

- `app/` - Next.js App Router pages and API routes
- `components/` - React components  
- `lib/` - Core utilities and integrations
- `public/models/` - AI model files (auto-downloaded)

## Key Features Implemented

✅ Next.js 14 with App Router
✅ TypeScript with strict mode
✅ Tailwind CSS styling
✅ AI template generation with node-llama-cpp
✅ Notion API integration
✅ MCP protocol support
✅ Form validation with react-hook-form
✅ Error boundaries and loading states
✅ Toast notifications
✅ Jest testing setup
✅ Production build configuration

## API Endpoints

- `POST /api/generate` - Generate Notion templates
- `POST /api/notion/auth` - Test Notion authentication
- `POST /api/notion/create` - Create Notion pages
- `GET/POST /api/mcp/config` - MCP server management

## Development

```bash
npm run dev          # Start development server
npm run build        # Build for production  
npm run start        # Start production server
npm run test         # Run tests
npm run type-check   # TypeScript validation
```

For complete documentation, see the full README.md file.