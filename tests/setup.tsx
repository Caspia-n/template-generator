import '@testing-library/jest-dom';

// Mock environment variables for testing
(process.env as any).NODE_ENV = 'test';
process.env.NOTION_TOKEN = 'test-token';
process.env.NOTION_API_VERSION = '2025-09-03';
process.env.MODEL_PATH = './public/models/test-model.gguf';
process.env.MCP_CONFIG_PATH = './mcp-servers.json';

// Mock fetch globally
global.fetch = jest.fn();

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Setup cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Mock next/navigation for client components
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

// Mock next/font
jest.mock('next/font', () => ({
  Inter: () => ({
    className: 'font-inter',
    style: {
      fontFamily: 'Inter, sans-serif',
    },
  }),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      const React = require('react');
      return React.createElement('div', props, children);
    },
    span: ({ children, ...props }: any) => {
      const React = require('react');
      return React.createElement('span', props, children);
    },
    p: ({ children, ...props }: any) => {
      const React = require('react');
      return React.createElement('p', props, children);
    },
    h1: ({ children, ...props }: any) => {
      const React = require('react');
      return React.createElement('h1', props, children);
    },
    h2: ({ children, ...props }: any) => {
      const React = require('react');
      return React.createElement('h2', props, children);
    },
    h3: ({ children, ...props }: any) => {
      const React = require('react');
      return React.createElement('h3', props, children);
    },
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => {
  const toast = {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
    dismiss: jest.fn(),
  };

  return {
    __esModule: true,
    default: toast,
    Toaster: () => null,
  };
});