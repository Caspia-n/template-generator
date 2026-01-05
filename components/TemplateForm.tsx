'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { TemplateFormData } from '@/lib/types';
import { validateTemplateForm } from '@/lib/validation';
import { toasts } from '@/components/Toasts';

interface TemplateFormProps {
  onSubmit: (data: TemplateFormData) => Promise<void>;
  isLoading?: boolean;
}

/**
 * Template generation form component
 */
export function TemplateForm({ onSubmit, isLoading = false }: TemplateFormProps) {
  const [useMCP, setUseMCP] = useState(false);
  const [selectedServers, setSelectedServers] = useState<string[]>([]);
  
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<TemplateFormData>({
    defaultValues: {
      description: '',
      theme_name: 'minimal',
      include_images: false,
      use_mcp: false,
      selected_servers: [],
      target_audience: '',
      complexity: 'intermediate',
    },
  });

  const watchedUseMCP = watch('use_mcp');

  const handleFormSubmit = async (data: TemplateFormData) => {
    try {
      // Validate form data
      const validation = validateTemplateForm(data);
      if (!validation.success) {
        validation.errors.forEach(error => {
          toasts.validationError('Form', error);
        });
        return;
      }

      // Update selected servers
      data.selected_servers = selectedServers;
      
      await onSubmit(data);
    } catch (error) {
      toasts.unexpectedError('template form', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const themes = [
    { key: 'minimal', label: 'Minimal' },
    { key: 'modern', label: 'Modern' },
    { key: 'professional', label: 'Professional' },
    { key: 'creative', label: 'Creative' },
  ];

  const complexityLevels = [
    { key: 'simple', label: 'Simple - Basic functionality, fewer features' },
    { key: 'intermediate', label: 'Intermediate - Balanced features and complexity' },
    { key: 'advanced', label: 'Advanced - Full features with automation' },
  ];

  const mcpServers = [
    { key: 'notion-mcp', label: 'Notion MCP' },
    { key: 'github-mcp', label: 'GitHub MCP' },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-2xl font-bold mb-6">Generate Notion Template</h2>
      
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Template Description *
          </label>
          <textarea
            {...register('description', { 
              required: 'Description is required',
              minLength: { value: 10, message: 'Description must be at least 10 characters' },
              maxLength: { value: 2000, message: 'Description must be less than 2000 characters' }
            })}
            placeholder="Describe the Notion template you want to create. Be specific about the purpose, features, and structure you need..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {watch('description')?.length || 0}/2000 characters
          </p>
        </div>

        {/* Theme Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Theme *
          </label>
          <select
            {...register('theme_name', { required: 'Theme selection is required' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a theme</option>
            {themes.map((theme) => (
              <option key={theme.key} value={theme.key}>
                {theme.label}
              </option>
            ))}
          </select>
          {errors.theme_name && (
            <p className="mt-1 text-sm text-red-600">{errors.theme_name.message}</p>
          )}
        </div>

        {/* Complexity Level */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Complexity Level *
          </label>
          <select
            {...register('complexity', { required: 'Complexity level is required' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select complexity level</option>
            {complexityLevels.map((level) => (
              <option key={level.key} value={level.key}>
                {level.label}
              </option>
            ))}
          </select>
          {errors.complexity && (
            <p className="mt-1 text-sm text-red-600">{errors.complexity.message}</p>
          )}
        </div>

        {/* Target Audience */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Target Audience (Optional)
          </label>
          <input
            {...register('target_audience')}
            placeholder="e.g., Project Managers, Content Creators, Students"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            This helps tailor the template for specific user needs
          </p>
        </div>

        {/* Options */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Include Images</label>
              <p className="text-xs text-gray-500">Add placeholder images and visual elements</p>
            </div>
            <input
              type="checkbox"
              {...register('include_images')}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Use MCP Servers</label>
              <p className="text-xs text-gray-500">Enable Model Context Protocol integration</p>
            </div>
            <input
              type="checkbox"
              {...register('use_mcp')}
              onChange={(e) => {
                const checked = e.target.checked;
                setValue('use_mcp', checked);
                setUseMCP(checked);
                if (!checked) {
                  setSelectedServers([]);
                }
              }}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* MCP Server Selection */}
        {watchedUseMCP && (
          <div className="border rounded-lg p-4">
            <label className="block text-sm font-medium mb-2">
              Select MCP Servers
            </label>
            <div className="space-y-2">
              {mcpServers.map((server) => (
                <label key={server.key} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedServers.includes(server.key)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedServers([...selectedServers, server.key]);
                      } else {
                        setSelectedServers(selectedServers.filter(s => s !== server.key));
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">{server.label}</span>
                </label>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              MCP servers enable advanced integrations with external services
            </p>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Generating Template...' : 'Generate Template'}
          </button>
        </div>
      </form>
    </div>
  );
}