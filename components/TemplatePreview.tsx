'use client';

import { useState } from 'react';
import { Button, Card, CardBody, Chip, Dropdown, DropdownMenu, DropdownItem, DropdownTrigger } from '';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  Share2, 
  Edit3, 
  Download, 
  MoreVertical, 
  ExternalLink,
  Copy,
  Trash2,
  FileText,
  Image as ImageIcon,
  Table,
  Database
} from 'lucide-react';
import type { Template, TemplateBlock } from '@/lib/types';
import { toasts } from '@/components/Toasts';

interface TemplatePreviewProps {
  template: Template;
  onEdit?: () => void;
  onShare?: () => void;
  onDelete?: () => void;
  onExport?: () => void;
  onDuplicate?: () => void;
  isPreviewMode?: boolean;
}

/**
 * Template preview component for displaying generated templates
 */
export function TemplatePreview({ 
  template, 
  onEdit, 
  onShare, 
  onDelete, 
  onExport, 
  onDuplicate,
  isPreviewMode = false 
}: TemplatePreviewProps) {
  const [activeBlock, setActiveBlock] = useState<string | null>(null);
  const [showRawJson, setShowRawJson] = useState(false);

  const handleCopyNotionUrl = async () => {
    try {
      await navigator.clipboard.writeText(template.shared_url || '');
      toasts.showSuccess('Notion URL copied to clipboard');
    } catch (error) {
      toasts.showError('Failed to copy URL');
    }
  };

  const handleExportJson = () => {
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

  const getBlockIcon = (type: TemplateBlock['type']) => {
    switch (type) {
      case 'heading':
        return <FileText className="w-4 h-4" />;
      case 'image':
        return <ImageIcon className="w-4 h-4" />;
      case 'database':
        return <Database className="w-4 h-4" />;
      case 'table':
        return <Table className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const renderBlock = (block: TemplateBlock) => {
    const isActive = activeBlock === block.id;

    switch (block.type) {
      case 'heading':
        const HeadingTag = `h${block.level || 1}` as keyof JSX.IntrinsicElements;
        return (
          <HeadingTag
            className={`font-bold ${block.level === 1 ? 'text-2xl' : block.level === 2 ? 'text-xl' : 'text-lg'} mb-4`}
            style={{ color: template.theme.colors.primary }}
          >
            {block.content}
          </HeadingTag>
        );

      case 'paragraph':
        return (
          <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            {block.content}
          </p>
        );

      case 'divider':
        return (
          <hr 
            className="my-6 border-t"
            style={{ borderColor: template.theme.colors.secondary }}
          />
        );

      case 'image':
        return (
          <div className="my-4">
            <img
              src={block.content}
              alt="Template image"
              className="max-w-full h-auto rounded-lg border"
              style={{ borderColor: template.theme.colors.surface }}
            />
          </div>
        );

      case 'quote':
        return (
          <blockquote
            className="border-l-4 pl-4 py-2 my-4 italic"
            style={{ 
              borderColor: template.theme.colors.accent,
              backgroundColor: template.theme.colors.surface + '20'
            }}
          >
            {block.content}
          </blockquote>
        );

      case 'database':
        return (
          <div
            className="border rounded-lg p-4 my-4"
            style={{ 
              borderColor: template.theme.colors.primary + '30',
              backgroundColor: template.theme.colors.surface
            }}
          >
            <div className="flex items-center space-x-2 mb-2">
              <Database className="w-5 h-5" style={{ color: template.theme.colors.primary }} />
              <h4 className="font-medium">{block.content}</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Database properties will be configured in Notion
            </p>
          </div>
        );

      case 'table':
        return (
          <div
            className="border rounded-lg p-4 my-4 overflow-x-auto"
            style={{ 
              borderColor: template.theme.colors.primary + '30',
              backgroundColor: template.theme.colors.surface
            }}
          >
            <div className="flex items-center space-x-2 mb-2">
              <Table className="w-5 h-5" style={{ color: template.theme.colors.primary }} />
              <h4 className="font-medium">{block.content}</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Table structure will be created in Notion
            </p>
          </div>
        );

      default:
        return (
          <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded border mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {block.content}
            </p>
          </div>
        );
    }
  };

  if (isPreviewMode) {
    return (
      <div 
        className="max-w-4xl mx-auto p-6 rounded-lg border"
        style={{
          backgroundColor: template.theme.colors.background,
          color: template.theme.colors.text,
          borderColor: template.theme.colors.surface
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Template Header */}
            <div className="mb-8">
              <h1 
                className="text-3xl font-bold mb-2"
                style={{ color: template.theme.colors.primary }}
              >
                {template.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {template.description}
              </p>
              <div className="flex flex-wrap gap-2">
                <Chip 
                  size="sm" 
                  style={{ 
                    backgroundColor: template.theme.colors.accent + '20',
                    color: template.theme.colors.accent 
                  }}
                >
                  {template.theme.name}
                </Chip>
                <Chip size="sm" variant="bordered">
                  {template.blocks.length} blocks
                </Chip>
                <Chip size="sm" variant="bordered">
                  {template.is_public ? 'Public' : 'Private'}
                </Chip>
              </div>
            </div>

            {/* Template Blocks */}
            <div className="space-y-4">
              {template.blocks.map((block, index) => (
                <motion.div
                  key={block.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative group"
                  onMouseEnter={() => setActiveBlock(block.id)}
                  onMouseLeave={() => setActiveBlock(null)}
                >
                  {renderBlock(block)}
                  
                  {/* Block indicator */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute -left-2 top-0 bottom-0 w-0.5"
                        style={{ backgroundColor: template.theme.colors.primary }}
                      />
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardBody className="p-6">
        {/* Template Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {template.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
              {template.description}
            </p>
            <div className="flex flex-wrap gap-2">
              <Chip size="sm" color="primary" variant="flat">
                {template.theme.name}
              </Chip>
              <Chip size="sm" variant="bordered">
                {template.blocks.length} blocks
              </Chip>
              <Chip 
                size="sm" 
                variant="bordered"
                color={template.is_public ? 'success' : 'default'}
              >
                {template.is_public ? 'Public' : 'Private'}
              </Chip>
            </div>
          </div>
          
          {/* Actions Dropdown */}
          <Dropdown>
            <DropdownTrigger>
              <Button isIconOnly variant="light">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Template actions">
              <DropdownItem
                key="preview"
                startContent={<Eye className="w-4 h-4" />}
                onPress={() => window.open(`/preview/${template.id}`, '_blank')}
              >
                Preview
              </DropdownItem>
              
              {template.shared_url && (
                <DropdownItem
                  key="open-notion"
                  startContent={<ExternalLink className="w-4 h-4" />}
                  onPress={() => window.open(template.shared_url, '_blank')}
                >
                  Open in Notion
                </DropdownItem>
              )}
              
              <DropdownItem
                key="copy-url"
                startContent={<Copy className="w-4 h-4" />}
                onPress={handleCopyNotionUrl}
              >
                Copy Notion URL
              </DropdownItem>
              
              <DropdownItem
                key="export-json"
                startContent={<Download className="w-4 h-4" />}
                onPress={handleExportJson}
              >
                Export as JSON
              </DropdownItem>
              
              <DropdownItem
                key="duplicate"
                startContent={<Copy className="w-4 h-4" />}
                onPress={onDuplicate}
              >
                Duplicate
              </DropdownItem>
              
              <DropdownItem
                key="edit"
                startContent={<Edit3 className="w-4 h-4" />}
                onPress={onEdit}
              >
                Edit
              </DropdownItem>
              
              {onShare && (
                <DropdownItem
                  key="share"
                  startContent={<Share2 className="w-4 h-4" />}
                  onPress={onShare}
                >
                  {template.is_public ? 'Make Private' : 'Share Publicly'}
                </DropdownItem>
              )}
              
              <DropdownItem
                key="delete"
                className="text-danger"
                startContent={<Trash2 className="w-4 h-4" />}
                onPress={onDelete}
              >
                Delete
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>

        {/* Template Blocks Preview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Template Structure
            </h3>
            <Button
              size="sm"
              variant="light"
              onPress={() => setShowRawJson(!showRawJson)}
            >
              {showRawJson ? 'Hide' : 'Show'} JSON
            </Button>
          </div>
          
          {showRawJson ? (
            <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded border overflow-x-auto">
              {JSON.stringify(template, null, 2)}
            </pre>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {template.blocks.slice(0, 10).map((block, index) => (
                <div
                  key={block.id}
                  className="flex items-start space-x-3 p-2 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex-shrink-0 mt-1">
                    {getBlockIcon(block.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {block.content.slice(0, 60)}{block.content.length > 60 ? '...' : ''}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {block.type}
                      {block.level && ` (Level ${block.level})`}
                    </p>
                  </div>
                </div>
              ))}
              
              {template.blocks.length > 10 && (
                <p className="text-xs text-gray-500 text-center py-2">
                  ... and {template.blocks.length - 10} more blocks
                </p>
              )}
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}