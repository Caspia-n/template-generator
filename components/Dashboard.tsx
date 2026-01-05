'use client';

import { useState, useEffect } from 'react';
import { Button, Card, CardBody, Input, Select, SelectItem, Chip, Avatar } from '';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Calendar,
  Users,
  FileText,
  Eye,
  Share2,
  Edit3,
  Trash2
} from 'lucide-react';
import type { Template, DashboardStats } from '@/lib/types';
import { TemplatePreview } from './TemplatePreview';
import { toasts } from '@/components/Toasts';

interface DashboardProps {
  onCreateNew: () => void;
  onViewTemplate: (templateId: string) => void;
}

/**
 * Dashboard component for managing and viewing templates
 */
export function Dashboard({ onCreateNew, onViewTemplate }: DashboardProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total_templates: 0,
    shared_templates: 0,
    api_calls_today: 0,
    models_downloaded: 0,
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTheme, setFilterTheme] = useState('all');
  const [filterPublic, setFilterPublic] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, searchQuery, filterTheme, filterPublic]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load templates
      const templatesResponse = await fetch('/api/templates');
      if (templatesResponse.ok) {
        const templatesData = await templatesResponse.json();
        setTemplates(templatesData.items || []);
      }

      // Load stats
      const statsResponse = await fetch('/api/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toasts.unexpectedError('dashboard', 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const filterTemplates = () => {
    let filtered = [...templates];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(template =>
        template.title.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query)
      );
    }

    // Apply theme filter
    if (filterTheme !== 'all') {
      filtered = filtered.filter(template => template.theme.name === filterTheme);
    }

    // Apply public filter
    if (filterPublic !== 'all') {
      const isPublic = filterPublic === 'public';
      filtered = filtered.filter(template => template.is_public === isPublic);
    }

    setFilteredTemplates(filtered);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTemplates(templates.filter(t => t.id !== templateId));
        toasts.templateDeleted('Template');
      } else {
        throw new Error('Failed to delete template');
      }
    } catch (error) {
      toasts.unexpectedError('template deletion', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleTogglePublic = async (templateId: string) => {
    try {
      const response = await fetch(`/api/templates/${templateId}/toggle-public`, {
        method: 'PATCH',
      });

      if (response.ok) {
        const updated = await response.json();
        setTemplates(templates.map(t => t.id === templateId ? updated : t));
        toasts.templateShared(updated.title);
      } else {
        throw new Error('Failed to update template visibility');
      }
    } catch (error) {
      toasts.unexpectedError('template visibility', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleDuplicateTemplate = async (template: Template) => {
    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...template,
          id: undefined, // Let the API generate a new ID
          title: `${template.title} (Copy)`,
          is_public: false,
        }),
      });

      if (response.ok) {
        const duplicated = await response.json();
        setTemplates([duplicated, ...templates]);
        toasts.operationSuccess('Template duplicated', duplicated.title);
      } else {
        throw new Error('Failed to duplicate template');
      }
    } catch (error) {
      toasts.unexpectedError('template duplication', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const uniqueThemes = Array.from(new Set(templates.map(t => t.theme.name)));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-6">
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-8 bg-gray-200 rounded animate-pulse" />
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-6">
              <div className="h-6 bg-gray-200 rounded animate-pulse mb-4" />
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Template Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and organize your Notion templates
          </p>
        </div>
        <Button
          color="primary"
          startContent={<Plus className="w-4 h-4" />}
          onPress={onCreateNew}
          size="lg"
        >
          Create New Template
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardBody className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Templates</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.total_templates}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardBody className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <Share2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Public Templates</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.shared_templates}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardBody className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">API Calls Today</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.api_calls_today}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardBody className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                  <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Models Available</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.models_downloaded}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardBody className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                startContent={<Search className="w-4 h-4 text-gray-400" />}
                className="w-full"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-4">
              <Select
                placeholder="Theme"
                selectedKeys={filterTheme !== 'all' ? [filterTheme] : []}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string;
                  setFilterTheme(value || 'all');
                }}
                className="w-32"
              >
                <SelectItem key="all">All Themes</SelectItem>
                {uniqueThemes.map(theme => (
                  <SelectItem key={theme} value={theme}>
                    {theme}
                  </SelectItem>
                ))}
              </Select>

              <Select
                placeholder="Visibility"
                selectedKeys={[filterPublic]}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string;
                  setFilterPublic(value);
                }}
                className="w-32"
              >
                <SelectItem key="all">All</SelectItem>
                <SelectItem key="public">Public</SelectItem>
                <SelectItem key="private">Private</SelectItem>
              </Select>

              {/* View Mode Toggle */}
              <div className="flex border rounded-lg overflow-hidden">
                <Button
                  isIconOnly
                  variant={viewMode === 'grid' ? 'solid' : 'light'}
                  onPress={() => setViewMode('grid')}
                  className="rounded-none"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  isIconOnly
                  variant={viewMode === 'list' ? 'solid' : 'light'}
                  onPress={() => setViewMode('list')}
                  className="rounded-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {(searchQuery || filterTheme !== 'all' || filterPublic !== 'all') && (
            <div className="flex flex-wrap gap-2 mt-4">
              {searchQuery && (
                <Chip
                  size="sm"
                  onClose={() => setSearchQuery('')}
                  variant="flat"
                  color="primary"
                >
                  Search: {searchQuery}
                </Chip>
              )}
              {filterTheme !== 'all' && (
                <Chip
                  size="sm"
                  onClose={() => setFilterTheme('all')}
                  variant="flat"
                  color="primary"
                >
                  Theme: {filterTheme}
                </Chip>
              )}
              {filterPublic !== 'all' && (
                <Chip
                  size="sm"
                  onClose={() => setFilterPublic('all')}
                  variant="flat"
                  color="primary"
                >
                  {filterPublic === 'public' ? 'Public' : 'Private'}
                </Chip>
              )}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Templates Grid/List */}
      {filteredTemplates.length === 0 ? (
        <Card>
          <CardBody className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {templates.length === 0 ? 'No templates yet' : 'No templates match your filters'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {templates.length === 0 
                ? 'Create your first Notion template to get started'
                : 'Try adjusting your search or filter criteria'
              }
            </p>
            {templates.length === 0 && (
              <Button
                color="primary"
                startContent={<Plus className="w-4 h-4" />}
                onPress={onCreateNew}
              >
                Create First Template
              </Button>
            )}
          </CardBody>
        </Card>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {filteredTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {viewMode === 'grid' ? (
                <TemplatePreview
                  template={template}
                  onEdit={() => onViewTemplate(template.id)}
                  onShare={() => handleTogglePublic(template.id)}
                  onDelete={() => handleDeleteTemplate(template.id)}
                  onDuplicate={() => handleDuplicateTemplate(template)}
                />
              ) : (
                <Card>
                  <CardBody className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                          {template.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {template.description.slice(0, 100)}
                          {template.description.length > 100 ? '...' : ''}
                        </p>
                        <div className="flex items-center gap-2">
                          <Chip size="sm" color="primary" variant="flat">
                            {template.theme.name}
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
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onPress={() => onViewTemplate(template.id)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onPress={() => handleTogglePublic(template.id)}
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onPress={() => handleDeleteTemplate(template.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}