'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { 
  Plus, 
  FileText, 
  Settings, 
  BarChart3, 
  Download,
  Upload,
  Trash2,
  Eye,
  Edit3,
  Share2
} from 'lucide-react';
import { Dashboard } from '@/components/Dashboard';
import { MCPConfigEditor } from '@/components/MCPConfigEditor';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { toasts } from '@/components/Toasts';
import type { MCPServer } from '@/lib/types';

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'settings'>('dashboard');
  const [mcpServers, setMCPServers] = useState<MCPServer[]>([]);
  const [isLoadingServers, setIsLoadingServers] = useState(true);

  useEffect(() => {
    loadMCPServers();
  }, []);

  const loadMCPServers = async () => {
    try {
      setIsLoadingServers(true);
      const response = await fetch('/api/mcp/config');
      
      if (response.ok) {
        const data = await response.json();
        setMCPServers(data.data || []);
      } else {
        console.error('Failed to load MCP servers');
      }
    } catch (error) {
      console.error('Error loading MCP servers:', error);
      toasts.unexpectedError('loading MCP servers', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoadingServers(false);
    }
  };

  const handleMCPServersChange = (servers: MCPServer[]) => {
    setMCPServers(servers);
    // Optionally save to API immediately
    saveMCPServers(servers);
  };

  const saveMCPServers = async (servers: MCPServer[]) => {
    try {
      const response = await fetch('/api/mcp/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'save',
          servers,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save MCP configuration');
      }
    } catch (error) {
      console.error('Error saving MCP servers:', error);
      toasts.unexpectedError('saving MCP servers', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleCreateNew = () => {
    router.push('/');
  };

  const handleViewTemplate = (templateId: string) => {
    router.push(`/preview/${templateId}`);
  };

  const tabs = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Template Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage your Notion templates and settings
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button
                  variant="bordered"
                  startContent={<Upload className="w-4 h-4" />}
                  onPress={() => {
                    // TODO: Implement import functionality
                    toasts.showInfo('Import functionality coming soon');
                  }}
                >
                  Import
                </Button>
                
                <Button
                  variant="bordered"
                  startContent={<Download className="w-4 h-4" />}
                  onPress={() => {
                    // TODO: Implement export functionality
                    toasts.showInfo('Export functionality coming soon');
                  }}
                >
                  Export All
                </Button>
                
                <Button
                  color="primary"
                  startContent={<Plus className="w-4 h-4" />}
                  onPress={handleCreateNew}
                >
                  New Template
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Navigation Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.key
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'dashboard' && (
              <Dashboard
                onCreateNew={handleCreateNew}
                onViewTemplate={handleViewTemplate}
              />
            )}

            {activeTab === 'settings' && (
              <div className="space-y-8">
                {/* MCP Configuration */}
                <MCPConfigEditor
                  servers={mcpServers}
                  onServersChange={handleMCPServersChange}
                  isLoading={isLoadingServers}
                />

                {/* Additional Settings Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Model Settings */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      🤖 AI Model Settings
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Model Path
                        </label>
                        <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-2 rounded">
                          {process.env.MODEL_PATH || './public/models/Qwen3-30B-A3B-Instruct-2507-UD-Q5_K_XL.gguf'}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Auto Download
                          </p>
                          <p className="text-xs text-gray-500">
                            Automatically download model on first use
                          </p>
                        </div>
                        <div className="text-sm text-green-600 bg-green-100 dark:bg-green-900/20 px-2 py-1 rounded">
                          Enabled
                        </div>
                      </div>
                      
                      <Button
                        size="sm"
                        variant="bordered"
                        onPress={() => {
                          toasts.showInfo('Model management coming soon');
                        }}
                      >
                        Manage Models
                      </Button>
                    </div>
                  </div>

                  {/* Notion Settings */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      📄 Notion Integration
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            API Version
                          </p>
                          <p className="text-xs text-gray-500">
                            Current Notion API version
                          </p>
                        </div>
                        <div className="text-sm text-blue-600 bg-blue-100 dark:bg-blue-900/20 px-2 py-1 rounded">
                          2025-09-03
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Connection Status
                          </p>
                          <p className="text-xs text-gray-500">
                            Test your Notion API connection
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="bordered"
                          onPress={async () => {
                            try {
                              const response = await fetch('/api/notion/auth', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({}),
                              });
                              
                              if (response.ok) {
                                toasts.notionAuthSuccess();
                              } else {
                                toasts.notionAuthError('Connection failed');
                              }
                            } catch (error) {
                              toasts.notionAuthError('Connection test failed');
                            }
                          }}
                        >
                          Test Connection
                        </Button>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        Make sure your NOTION_TOKEN is configured in environment variables
                      </div>
                    </div>
                  </div>
                </div>

                {/* System Information */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 border">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    ℹ️ System Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">Node.js Version</p>
                      <p className="text-gray-600 dark:text-gray-400">{process.version}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">Next.js Version</p>
                      <p className="text-gray-600 dark:text-gray-400">14.2.3</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">Environment</p>
                      <p className="text-gray-600 dark:text-gray-400 capitalize">
                        {process.env.NODE_ENV || 'development'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </ErrorBoundary>
  );
}