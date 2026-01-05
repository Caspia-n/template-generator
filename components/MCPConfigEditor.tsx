'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Input, Textarea, Select, SelectItem, Switch, Card, CardBody, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Settings,
  Globe,
  Key,
  Shield
} from 'lucide-react';
import type { MCPServer } from '@/lib/types';
import { validateMCPServer } from '@/lib/validation';
import { toasts } from '@/components/Toasts';

interface MCPConfigEditorProps {
  servers: MCPServer[];
  onServersChange: (servers: MCPServer[]) => void;
  isLoading?: boolean;
}

/**
 * MCP Server configuration editor component
 */
export function MCPConfigEditor({ servers, onServersChange, isLoading = false }: MCPConfigEditorProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [editingServer, setEditingServer] = useState<MCPServer | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<Record<string, 'connected' | 'disconnected' | 'testing'>>({});

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<MCPServer>({
    defaultValues: {
      id: '',
      name: '',
      url: '',
      auth_type: 'none',
      key: '',
      active: true,
      description: '',
      version: '',
      capabilities: [],
    },
  });

  const watchedAuthType = watch('auth_type');

  useEffect(() => {
    // Test connections on load
    testAllConnections();
  }, [servers]);

  const testAllConnections = async () => {
    const newStatus: Record<string, 'connected' | 'disconnected' | 'testing'> = {};
    
    for (const server of servers) {
      newStatus[server.id] = 'testing';
      setConnectionStatus(prev => ({ ...prev, [server.id]: 'testing' }));
      
      try {
        const response = await fetch('/api/mcp/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'test', serverId: server.id }),
        });
        
        newStatus[server.id] = response.ok ? 'connected' : 'disconnected';
      } catch (error) {
        newStatus[server.id] = 'disconnected';
      }
    }
    
    setConnectionStatus(newStatus);
  };

  const handleOpenModal = (server?: MCPServer) => {
    if (server) {
      setEditingServer(server);
      setValue('id', server.id);
      setValue('name', server.name);
      setValue('url', server.url);
      setValue('auth_type', server.auth_type);
      setValue('key', server.key || '');
      setValue('active', server.active);
      setValue('description', server.description || '');
      setValue('version', server.version || '');
      setValue('capabilities', server.capabilities || []);
    } else {
      setEditingServer(null);
      reset();
    }
    onOpen();
  };

  const handleCloseModal = () => {
    setEditingServer(null);
    reset();
    onOpenChange();
  };

  const onSubmit = async (data: MCPServer) => {
    try {
      // Validate server configuration
      const validation = validateMCPServer(data);
      if (!validation.success) {
        validation.errors.forEach(error => {
          toasts.validationError('Server Config', error);
        });
        return;
      }

      let updatedServers: MCPServer[];
      
      if (editingServer) {
        // Update existing server
        updatedServers = servers.map(server => 
          server.id === editingServer.id ? { ...data } : server
        );
        toasts.operationSuccess('Server updated', data.name);
      } else {
        // Add new server
        updatedServers = [...servers, data];
        toasts.operationSuccess('Server added', data.name);
      }

      onServersChange(updatedServers);
      handleCloseModal();
      
      // Test connection for new/updated server
      setTimeout(() => testConnection(data.id), 1000);
      
    } catch (error) {
      toasts.unexpectedError('server configuration', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleDeleteServer = async (serverId: string) => {
    try {
      const server = servers.find(s => s.id === serverId);
      if (!server) return;

      const updatedServers = servers.filter(s => s.id !== serverId);
      onServersChange(updatedServers);
      toasts.operationSuccess('Server removed', server.name);
    } catch (error) {
      toasts.unexpectedError('server removal', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleToggleActive = async (serverId: string) => {
    try {
      const updatedServers = servers.map(server =>
        server.id === serverId ? { ...server, active: !server.active } : server
      );
      onServersChange(updatedServers);
      
      const server = updatedServers.find(s => s.id === serverId);
      toasts.operationSuccess('Server status updated', server?.name || '');
    } catch (error) {
      toasts.unexpectedError('server status update', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const testConnection = async (serverId: string) => {
    try {
      setConnectionStatus(prev => ({ ...prev, [serverId]: 'testing' }));
      
      const response = await fetch('/api/mcp/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test', serverId }),
      });
      
      const status = response.ok ? 'connected' : 'disconnected';
      setConnectionStatus(prev => ({ ...prev, [serverId]: status }));
      
      const server = servers.find(s => s.id === serverId);
      if (status === 'connected') {
        toasts.mcpConnectionSuccess(server?.name || 'Server');
      } else {
        toasts.mcpConnectionError(server?.name || 'Server', 'Connection failed');
      }
    } catch (error) {
      setConnectionStatus(prev => ({ ...prev, [serverId]: 'disconnected' }));
      toasts.mcpConnectionError('Server', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const getConnectionIcon = (status: 'connected' | 'disconnected' | 'testing') => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'disconnected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'testing':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const authTypes = [
    { key: 'none', label: 'No Authentication', icon: <Globe className="w-4 h-4" /> },
    { key: 'oauth_2.1', label: 'OAuth 2.1', icon: <Shield className="w-4 h-4" /> },
    { key: 'bearer', label: 'Bearer Token', icon: <Key className="w-4 h-4" /> },
  ];

  const capabilitiesOptions = [
    'database', 'page', 'search', 'template', 'file', 'image', 'webhook', 'automation'
  ];

  return (
    <Card>
      <CardBody className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              MCP Server Configuration
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Configure Model Context Protocol servers for advanced integrations
            </p>
          </div>
          <Button
            color="primary"
            startContent={<Plus className="w-4 h-4" />}
            onPress={() => handleOpenModal()}
          >
            Add Server
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : servers.length === 0 ? (
          <div className="text-center py-12">
            <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No MCP servers configured
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Add MCP servers to enable advanced integrations with external services
            </p>
            <Button
              color="primary"
              startContent={<Plus className="w-4 h-4" />}
              onPress={() => handleOpenModal()}
            >
              Add First Server
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {servers.map((server, index) => (
                <motion.div
                  key={server.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`${!server.active ? 'opacity-60' : ''}`}>
                    <CardBody className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="flex-shrink-0">
                            {getConnectionIcon(connectionStatus[server.id] || 'disconnected')}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium text-gray-900 dark:text-white">
                                {server.name}
                              </h3>
                              <div className="flex items-center space-x-1">
                                <Switch
                                  size="sm"
                                  isSelected={server.active}
                                  onValueChange={() => handleToggleActive(server.id)}
                                />
                                <span className="text-xs text-gray-500">
                                  {server.active ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                              {server.url}
                            </p>
                            {server.description && (
                              <p className="text-xs text-gray-500 mt-1">
                                {server.description}
                              </p>
                            )}
                            {server.capabilities && server.capabilities.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {server.capabilities.map(cap => (
                                  <span
                                    key={cap}
                                    className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded-full"
                                  >
                                    {cap}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onPress={() => testConnection(server.id)}
                            isDisabled={connectionStatus[server.id] === 'testing'}
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onPress={() => handleOpenModal(server)}
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="danger"
                            onPress={() => handleDeleteServer(server.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Add/Edit Server Modal */}
        <Modal 
          isOpen={isOpen} 
          onOpenChange={handleCloseModal}
          size="2xl"
          scrollBehavior="outside"
        >
          <ModalContent>
            <ModalHeader>
              {editingServer ? 'Edit MCP Server' : 'Add MCP Server'}
            </ModalHeader>
            <ModalBody>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    {...register('id', { 
                      required: 'Server ID is required',
                      pattern: {
                        value: /^[a-z0-9-_]+$/,
                        message: 'Only lowercase letters, numbers, hyphens, and underscores allowed'
                      }
                    })}
                    label="Server ID"
                    placeholder="e.g., notion-mcp"
                    description="Unique identifier for the server"
                    isInvalid={!!errors.id}
                    errorMessage={errors.id?.message}
                  />
                  
                  <Input
                    {...register('name', { required: 'Server name is required' })}
                    label="Server Name"
                    placeholder="e.g., Notion MCP"
                    description="Display name for the server"
                    isInvalid={!!errors.name}
                    errorMessage={errors.name?.message}
                  />
                </div>

                <Input
                  {...register('url', { 
                    required: 'Server URL is required',
                    pattern: {
                      value: /^https?:\/\/.+/,
                      message: 'Must be a valid HTTP/HTTPS URL'
                    }
                  })}
                  label="Server URL"
                  placeholder="https://mcp.example.com"
                  description="Base URL of the MCP server"
                  isInvalid={!!errors.url}
                  errorMessage={errors.url?.message}
                />

                <Textarea
                  {...register('description')}
                  label="Description (Optional)"
                  placeholder="Describe what this server provides..."
                  minRows={2}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    {...register('version')}
                    label="Version (Optional)"
                    placeholder="1.0.0"
                  />
                  
                  <Select
                    {...register('auth_type', { required: 'Authentication type is required' })}
                    label="Authentication Type"
                    placeholder="Select auth type"
                    isInvalid={!!errors.auth_type}
                    errorMessage={errors.auth_type?.message}
                  >
                    {authTypes.map((type) => (
                      <SelectItem key={type.key} value={type.key}>
                        <div className="flex items-center space-x-2">
                          {type.icon}
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                {watchedAuthType === 'bearer' && (
                  <Input
                    {...register('key')}
                    label="Bearer Token"
                    placeholder="Enter your bearer token"
                    type="password"
                  />
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Capabilities
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {capabilitiesOptions.map((capability) => (
                      <label key={capability} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          {...register('capabilities')}
                          value={capability}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm capitalize">{capability}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    variant="light"
                    onPress={handleCloseModal}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    color="primary"
                  >
                    {editingServer ? 'Update Server' : 'Add Server'}
                  </Button>
                </div>
              </form>
            </ModalBody>
          </ModalContent>
        </Modal>
      </CardBody>
    </Card>
  );
}