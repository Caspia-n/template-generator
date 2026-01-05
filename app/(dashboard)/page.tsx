'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { TemplateForm } from '@/components/TemplateForm';
import { TemplatePreview } from '@/components/TemplatePreview';
import { GeneratingTemplateLoading } from '@/components/LoadingState';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import type { TemplateFormData, Template } from '@/lib/types';
import { toasts, loadingStates } from '@/components/Toasts';

export default function HomePage() {
  const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateTemplate = async (formData: TemplateFormData) => {
    try {
      setIsGenerating(true);
      loadingStates.generating();

      // Call the generation API
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: formData.description,
          theme: {
            name: formData.theme_name,
            colors: {
              primary: '#3b82f6',
              secondary: '#64748b',
              background: '#ffffff',
              surface: '#f8fafc',
              text: '#1e293b',
              accent: '#0ea5e9',
            },
            fonts: {
              heading: 'Inter',
              body: 'Inter',
            },
            spacing: 'comfortable',
          },
          useMCP: formData.use_mcp,
          selectedMCPServers: formData.selected_servers,
          includeImages: formData.include_images,
          targetAudience: formData.target_audience,
          complexity: formData.complexity,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Generation failed');
      }

      const result = await response.json();
      
      if (result.success && result.template) {
        setCurrentTemplate(result.template);
        toasts.templateGenerationSuccess(result.template.title);
      } else {
        throw new Error(result.error?.message || 'Generation failed');
      }
    } catch (error) {
      toasts.templateGenerationError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateNew = () => {
    setCurrentTemplate(null);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
              Notion Template Generator
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Create powerful, customized Notion templates using AI with local inference and MCP integration
            </p>
          </motion.div>

          <div className="max-w-7xl mx-auto">
            {isGenerating ? (
              <div className="flex justify-center">
                <GeneratingTemplateLoading />
              </div>
            ) : currentTemplate ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                {/* Actions */}
                <div className="flex justify-center">
                  <button
                    onClick={handleCreateNew}
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                  >
                    Create Another Template
                  </button>
                </div>

                {/* Template Preview */}
                <TemplatePreview
                  template={currentTemplate}
                  isPreviewMode={true}
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start"
              >
                {/* Form */}
                <div className="space-y-6">
                  <div className="text-center lg:text-left">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Generate Your Template
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Describe your ideal Notion workspace and let AI create it for you
                    </p>
                  </div>
                  
                  <TemplateForm
                    onSubmit={handleGenerateTemplate}
                    isLoading={isGenerating}
                  />
                </div>

                {/* Info Panel */}
                <div className="space-y-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      ✨ Features
                    </h3>
                    <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                      <li className="flex items-start space-x-2">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span>AI-powered template generation</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span>Local inference with node-llama-cpp</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span>MCP integration for advanced workflows</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span>Direct Notion integration</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span>Multiple themes and complexity levels</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span>Export and share capabilities</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      🚀 Getting Started
                    </h3>
                    <ol className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li className="flex items-start space-x-2">
                        <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                        <span>Describe your template needs</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                        <span>Choose theme and complexity</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                        <span>Generate with AI</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">4</span>
                        <span>Export to Notion</span>
                      </li>
                    </ol>
                  </div>

                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
                    <h3 className="text-lg font-semibold mb-2">
                      💡 Pro Tip
                    </h3>
                    <p className="text-sm opacity-90">
                      Be specific in your description. Include details about your workflow, 
                      the type of content you'll manage, and any specific features you need.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}