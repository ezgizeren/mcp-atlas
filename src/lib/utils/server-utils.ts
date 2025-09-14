/**
 * Utility functions for server-related operations
 * These functions handle the adaptive logic based on server/hosting types
 */

import { TabVisibility, UserPermissions, HostingType } from '@/types/server';

/**
 * Determines which tabs should be visible based on hosting type and permissions
 */
export function getTabVisibility(
  hostingType: HostingType,
  permissions: UserPermissions
): TabVisibility {
  const baseVisibility: TabVisibility = {
    overview: false,  // Hidden - start with Tools tab
    tools: true,
    schemaConfig: false,  // Hidden to reduce tab count
    installation: true,
    security: true,
    reviews: true,
    useCases: true,
    related: false,  // Hidden to reduce tab count
    versions: false,  // Hidden to reduce tab count
    deployment: false,
  };

  // Show deployment tab only for Omni-hosted servers and if user has permissions
  if (hostingType === 'omni-hosted') {
    baseVisibility.deployment = true;
  }

  return baseVisibility;
}

/**
 * Checks if server type is remote (SSE or HTTP)
 */
export function isServerTypeRemote(serverType: string): boolean {
  return serverType === 'remote-sse' || serverType === 'remote-http';
}

export function isServerTypeLocal(serverType: string): boolean {
  return serverType === 'local-stdio';
}

/**
 * Determines if user can edit server configuration
 */
export function canEditConfiguration(
  hostingType: HostingType,
  permissions: UserPermissions
): boolean {
  return hostingType === 'omni-hosted' && permissions.canEditConfig;
}

export function getServerTypeLabel(serverType: string): string {
  const labels: Record<string, string> = {
    'remote-sse': 'Remote SSE',
    'remote-http': 'Remote HTTP',
    'local-stdio': 'Local STDIO',
  };
  return labels[serverType] || serverType;
}

export function getHostingTypeLabel(hostingType: string): string {
  const labels: Record<string, string> = {
    'external': 'External',
    'omni-hosted': 'Omni-Hosted',
  };
  return labels[hostingType] || hostingType;
}

export function formatConnectionEndpoint(
  hostingType: HostingType,
  serverType: string,
  endpoint?: string,
  instanceId?: string
): string {
  if (hostingType === 'omni-hosted' && instanceId) {
    return `wss://${instanceId}.omni.mcphub.ai/`;
  }

  if (serverType === 'local-stdio') {
    return 'Local process (STDIO)';
  }

  return endpoint || 'Not configured';
}

export function getAuthenticationRequirements(
  authType?: string
): {
  required: boolean;
  label: string;
  instructions: string;
} {
  if (!authType || authType === 'none') {
    return {
      required: false,
      label: 'No authentication',
      instructions: 'This server does not require authentication',
    };
  }

  const authLabels: Record<string, string> = {
    'api-key': 'API Key',
    'oauth': 'OAuth 2.0',
    'custom': 'Custom Authentication',
  };

  const authInstructions: Record<string, string> = {
    'api-key': 'Provide your API key in the configuration',
    'oauth': 'Complete OAuth flow to authenticate',
    'custom': 'Follow the server-specific authentication instructions',
  };

  return {
    required: true,
    label: authLabels[authType] || 'Authentication Required',
    instructions: authInstructions[authType] || 'Authentication is required to use this server',
  };
}

export function getDeploymentStatusColor(status: string): string {
  const colors: Record<string, string> = {
    running: 'text-green-600 dark:text-green-400',
    stopped: 'text-gray-600 dark:text-gray-400',
    starting: 'text-yellow-600 dark:text-yellow-400',
    stopping: 'text-yellow-600 dark:text-yellow-400',
    error: 'text-red-600 dark:text-red-400',
  };
  return colors[status] || 'text-gray-600 dark:text-gray-400';
}

export function canPerformDeploymentAction(
  action: 'start' | 'stop' | 'restart',
  currentStatus: string,
  permissions: UserPermissions
): boolean {
  if (!permissions.canManageDeployment) {
    return false;
  }

  switch (action) {
    case 'start':
      return currentStatus === 'stopped' || currentStatus === 'error';
    case 'stop':
      return currentStatus === 'running';
    case 'restart':
      return currentStatus === 'running';
    default:
      return false;
  }
}

export function formatResourceUsage(metrics: {
  cpu: number;
  memory: number;
  requests: number;
  latency: number;
}): {
  cpu: string;
  memory: string;
  requests: string;
  latency: string;
} {
  return {
    cpu: `${metrics.cpu}%`,
    memory: `${metrics.memory}MB`,
    requests: `${metrics.requests}/min`,
    latency: `${metrics.latency}ms`,
  };
}

export function getSecurityStatusLabel(score: number): {
  label: string;
  color: string;
} {
  if (score >= 90) {
    return { label: 'Excellent', color: 'text-green-600 dark:text-green-400' };
  } else if (score >= 70) {
    return { label: 'Good', color: 'text-blue-600 dark:text-blue-400' };
  } else if (score >= 50) {
    return { label: 'Fair', color: 'text-yellow-600 dark:text-yellow-400' };
  } else {
    return { label: 'Poor', color: 'text-red-600 dark:text-red-400' };
  }
}