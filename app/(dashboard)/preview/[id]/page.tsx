'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@heroui';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Share2, ExternalLink, Copy, Loader2 } from 'lucide-react';
import { TemplatePreview } from '@/components/TemplatePreview';
import { LoadingState, PageLoading } from '@/components/LoadingState';
import { ErrorBoundary, ErrorMessage } from '@/components/ErrorBoundary';
import { toasts } from '@/components/Toasts';
import type { Template } from '@/lib/types';

export default function PreviewPage() {
  const params = useParams();
  const templateId = params.id as string;
  
  const [template, setTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingNotionPage, setIsCreatingNotionPage] = useState(false);

  useEffect(() => {
    if (templateId) {
      loadTemplate();
    }
  }, [templateId]);

  const loadTemplate = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/templates/${templateId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Template not found');
        }
        throw new Error('Failed to load template');
      }
      
      const data = await response.json();
      setTemplate(data);
    } catch (error) {
      console.error('Failed to load template:', error);
      setError(error instanceof Error ? error.message : 'Failed to load template');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNotionPage = async () => {
    if (!template) return;
    
    try {
      setIsCreatingNotionPage(true);
      toasts.showLoading('Creating Notion page...');

      const response = await fetch('/api/notion/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template,
          parentOptions: {
            parent_type: 'workspace',
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to create Notion page');
      }

      const result = await response.json();
      
      if (result.success && result.data?.url) {
        // Update template with Notion page info
        const updatedTemplate = {
          ...template,
          notion_page_id: result.data.id,
          shared_url: result.data.url,
        };
        setTemplate(updatedTemplate);
        
        toasts.notionPageCreated(template.title);
      } else {
        throw new Error('Failed to create Notion page');
      }
    } catch (error) {
      toasts.notionPageError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsCreatingNotionPage(false);
    }
  };

  const handleShareTemplate = async () => {
    if (!template) return;
    
    try {
      const response = await fetch(`/api/templates/${templateId}/toggle-public`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Failed to update template visibility');
      }

      const updatedTemplate = await response.json();
      setTemplate(updatedTemplate);
      
      toasts.templateShared(updatedTemplate.title);
    } catch (error) {
      toasts.unexpectedError('sharing template', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleCopyNotionUrl = async () => {
    if (!template?.shared_url) return;
    
    try {
      await navigator.clipboard.writeText(template.shared_url);
      toasts.showSuccess('Notion URL copied to clipboard');
    } catch (error) {
      toasts.showError('Failed to copy URL');
    }
  };

  const handleExportJson = () => {
    if (!template) return;
    
    try {
      const dataStr = JSON.stringify(template, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${template.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toasts.showSuccess('Template exported as JSON');
    } catch (error) {
      toasts.showError('Failed to export template');
    }
  };

  const handleGoBack = () => {
    window.history.back();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <PageLoading isLoading={true} message="Loading template..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Button
              variant="light"
              startContent={<ArrowLeft className="w-4 h-4" />}
              onPress={handleGoBack}
              className="mb-6"
            >
              Back
            </Button>
            
            <ErrorMessage
              message={error}
              onRetry={loadTemplate}
            />
          </div>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Template Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The template you're looking for doesn't exist or has been deleted.
            </p>
            <Button
              color="primary"
              startContent={<ArrowLeft className="w-4 h-4" />}
              onPress={handleGoBack}
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
            <div className="flex items-center justify-between">
              <Button
                variant="light"
                startContent={<ArrowLeft className="w-4 h-4" />}
                onPress={handleGoBack}
              >
                Back
              </Button>
              
              <div className="flex items-center space-x-3">
                {!template.notion_page_id && (
                  <Button
                    color="primary"
                    onPress={handleCreateNotionPage}
                    isLoading={isCreatingNotionPage}
                    startContent={
                      isCreatingNotionPage ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <ExternalLink className="w-4 h-4" />
                      )
                    }
                  >
                    Create Notion Page
                  </Button>
                )}
                
                {template.shared_url && (
                  <Button
                    variant="bordered"
                    startContent={<ExternalLink className="w-4 h-4" />}
                    onPress={() => window.open(template.shared_url, '_blank')}
                  >
                    Open in Notion
                  </Button>
                )}
                
                <Button
                  variant="bordered"
                  onPress={handleShareTemplate}
                >
                  <Share2 className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="bordered"
                  onPress={handleCopyNotionUrl}
                  isDisabled={!template.shared_url}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="bordered"
                  onPress={handleExportJson}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Template Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <TemplatePreview
              template={template}
              isPreviewMode={true}
            />
          </motion.div>
        </div>
      </div>
    </ErrorBoundary>
  );
}