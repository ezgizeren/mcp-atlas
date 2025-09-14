/**
 * Core type definitions for MCP Server Registry
 */

// Server connection types
export type ServerType = 'remote-sse' | 'remote-http' | 'local-stdio' | string;

// Server hosting types
export type HostingType = 'external' | 'omni-hosted' | string;

export interface ServerEntity {
  id: string;
  name: string;
  namespace: string;
  author: string;
  version: string;
  currentVersion: string;
  availableVersions: string[];
  description: string;
  serverType: ServerType;
  hostingType: HostingType;
  verified: boolean;
  usage: number;
  rating: number;
  forks: number;
  score: number;
  repoUrl?: string;
  issuesUrl?: string;
  docsUrl?: string;
  readme?: string;
  projectStructure?: FileNode[];
  disclaimers?: string[];
  createdAt: string;
  updatedAt: string;
  // Additional fields from database
  stars?: number;
  primaryCategory?: string;
  secondaryCategories?: any[];
  maturityIndicator?: string;
  integrationComplexity?: string;
  license?: string;
  licenseId?: string;
  primaryLanguage?: string;
  topics?: string[];
  openIssues?: number;
  lastPush?: string;
  features?: string[];
  requirements?: string[];
  toolsCount?: number;
  redFlags?: string[];
}

export interface FileNode {
  name: string;
  type: 'file' | 'directory';
  children?: FileNode[];
}

export interface ToolEntity {
  id: string;
  serverId: string;
  name: string;
  description: string;
  parameters: ToolParameter[];
  output: ToolOutput;
  examples?: string[];
  // Additional fields from database
  friendlyName?: string;
  funcType?: string;
  riskScore?: number;
  mappedCategory?: string[];
}

export interface ToolParameter {
  name: string;
  type: string;
  description: string;
  required: boolean;
  default?: any;
}

export interface ToolOutput {
  type: string;
  description: string;
  schema?: any;
}

export interface ConfigEntity {
  connectionUrl?: string;
  authType?: 'none' | 'api-key' | 'oauth' | 'custom';
  authConfig?: Record<string, any>;
  environment?: Record<string, string>;
  manifest?: McpManifest;
}

export interface McpManifest {
  name: string;
  version: string;
  runtime: string;
  commands?: Record<string, any>;
  environment?: Record<string, any>;
  settings?: Record<string, any>;
}

export interface DeploymentEntity {
  id: string;
  serverId: string;
  instanceId: string;
  status: 'running' | 'stopped' | 'starting' | 'stopping' | 'error';
  endpoint: string;
  resourceMetrics: ResourceMetrics;
  logs: LogEntry[];
  config: DeploymentConfig;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceMetrics {
  cpu: number;
  memory: number;
  requests: number;
  errors: number;
  latency: number;
}

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  metadata?: Record<string, any>;
}

export interface DeploymentConfig {
  environment: Record<string, string>;
  runtime: string;
  version: string;
  autoRestart: boolean;
  maxMemory?: number;
  timeout?: number;
}

export interface UserPermissions {
  canManageDeployment: boolean;
  canEditConfig: boolean;
  canViewLogs: boolean;
  canViewMetrics: boolean;
  isOwner: boolean;
  organizationRole?: 'owner' | 'admin' | 'member' | 'viewer';
}

export interface SecurityScan {
  id: string;
  serverId: string;
  version: string;
  status: 'passed' | 'warning' | 'failed';
  score: number;
  permissions: string[];
  vulnerabilities: Vulnerability[];
  lastScanned: string;
}

export interface Vulnerability {
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  description: string;
  recommendation?: string;
}

export interface Review {
  id: string;
  serverId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  content: string;
  helpful: number;
  createdAt: string;
  updatedAt: string;
}

export interface UseCase {
  id: string;
  serverId: string;
  title: string;
  description: string;
  workflow?: string;
  codeSnippet?: string;
  tags: string[];
  author: string;
  likes: number;
  createdAt: string;
}

export interface RelatedItem {
  id: string;
  type: 'server' | 'client' | 'tool';
  name: string;
  description: string;
  compatibility: 'compatible' | 'partial' | 'unknown';
  url: string;
}

export interface Version {
  version: string;
  releaseDate: string;
  changelog: string;
  breaking: boolean;
  deprecated: boolean;
  downloads: number;
}

export interface TabVisibility {
  overview: boolean;
  tools: boolean;
  schemaConfig: boolean;
  installation: boolean;
  security: boolean;
  reviews: boolean;
  useCases: boolean;
  related: boolean;
  versions: boolean;
  deployment: boolean;
}

export interface ServerPageProps {
  server: ServerEntity;
  tools: ToolEntity[];
  config: ConfigEntity;
  deployment?: DeploymentEntity;
  permissions: UserPermissions;
  security: SecurityScan;
  reviews: Review[];
  useCases: UseCase[];
  relatedItems: RelatedItem[];
  versions: Version[];
}

export interface ConnectionInfo {
  type: ServerType;
  hosting: HostingType;
  endpoint?: string;
  command?: string;
  environment?: Record<string, string>;
  authRequired: boolean;
  authInstructions?: string;
  configJson: any;
}