import { ServerPageProps } from '@/types/server';

export function getMockServerData(serverName: string): ServerPageProps {
  // Mock data for demonstration
  const isOmniHosted = serverName.includes('omni');

  return {
    server: {
      id: 'server-1',
      name: serverName,
      namespace: 'mcp-hub',
      author: 'mcp-team',
      version: '2.1.0',
      currentVersion: '2.1.0',
      availableVersions: ['2.1.0', '2.0.0', '1.9.0', '1.8.0'],
      description: 'A powerful MCP server for AI-driven development workflows with advanced code analysis, generation, and optimization capabilities.',
      serverType: isOmniHosted ? 'remote-sse' : 'local-stdio',
      hostingType: isOmniHosted ? 'omni-hosted' : 'external',
      verified: true,
      usage: 15234,
      rating: 4.7,
      forks: 342,
      score: 92,
      repoUrl: 'https://github.com/mcp-hub/server',
      issuesUrl: 'https://github.com/mcp-hub/server/issues',
      docsUrl: 'https://docs.mcp-hub.com',
      readme: `# MCP Development Server

## Overview
A comprehensive MCP server designed for modern AI-driven development workflows. This server provides powerful tools for code analysis, generation, and optimization.

## Features
- **Code Analysis**: Deep semantic analysis of codebases
- **AI Integration**: Built-in support for multiple AI models
- **Performance Monitoring**: Real-time metrics and insights
- **Security Scanning**: Automated vulnerability detection
- **Multi-language Support**: Works with 20+ programming languages

## Installation
\`\`\`bash
npm install @mcp-hub/server
\`\`\`

## Quick Start
1. Install the package
2. Configure your environment variables
3. Initialize the client
4. Start using the tools

## Configuration
The server supports various configuration options through environment variables and config files.

### Environment Variables
- \`MCP_API_KEY\`: Your API key for authentication
- \`MCP_ENDPOINT\`: Custom endpoint URL (optional)
- \`MCP_TIMEOUT\`: Request timeout in milliseconds

### Config File
Create a \`mcp.config.json\` file in your project root:
\`\`\`json
{
  "server": "mcp-development-server",
  "version": "2.1.0",
  "features": {
    "codeAnalysis": true,
    "aiIntegration": true
  }
}
\`\`\`

## Documentation
For detailed documentation, visit [docs.mcp-hub.com](https://docs.mcp-hub.com)`,
      projectStructure: [
        {
          name: 'src',
          type: 'directory',
          children: [
            { name: 'index.ts', type: 'file' },
            { name: 'server.ts', type: 'file' },
            {
              name: 'tools',
              type: 'directory',
              children: [
                { name: 'analyzer.ts', type: 'file' },
                { name: 'generator.ts', type: 'file' },
                { name: 'optimizer.ts', type: 'file' },
              ],
            },
            {
              name: 'utils',
              type: 'directory',
              children: [
                { name: 'logger.ts', type: 'file' },
                { name: 'config.ts', type: 'file' },
              ],
            },
          ],
        },
        { name: 'package.json', type: 'file' },
        { name: 'tsconfig.json', type: 'file' },
        { name: 'README.md', type: 'file' },
      ],
      disclaimers: isOmniHosted
        ? ['This server is hosted on MCP Omni infrastructure and may have usage limits.']
        : undefined,
      createdAt: '2024-01-15',
      updatedAt: '2024-11-20',
    },
    tools: [
      {
        id: 'tool-1',
        serverId: 'server-1',
        name: 'analyzeCode',
        description: 'Performs deep semantic analysis of code to identify patterns, issues, and optimization opportunities',
        parameters: [
          {
            name: 'filePath',
            type: 'string',
            description: 'Path to the file or directory to analyze',
            required: true,
          },
          {
            name: 'depth',
            type: 'number',
            description: 'Analysis depth (1-5)',
            required: false,
            default: 3,
          },
          {
            name: 'includeMetrics',
            type: 'boolean',
            description: 'Include performance metrics in analysis',
            required: false,
            default: true,
          },
        ],
        output: {
          type: 'object',
          description: 'Analysis results including issues, suggestions, and metrics',
          schema: {
            issues: 'array',
            suggestions: 'array',
            metrics: 'object',
          },
        },
        examples: [
          `analyzeCode({ filePath: './src', depth: 3, includeMetrics: true })`,
        ],
      },
      {
        id: 'tool-2',
        serverId: 'server-1',
        name: 'generateCode',
        description: 'Generates code based on natural language descriptions and context',
        parameters: [
          {
            name: 'prompt',
            type: 'string',
            description: 'Natural language description of what to generate',
            required: true,
          },
          {
            name: 'language',
            type: 'string',
            description: 'Target programming language',
            required: true,
          },
          {
            name: 'context',
            type: 'object',
            description: 'Additional context for generation',
            required: false,
          },
        ],
        output: {
          type: 'string',
          description: 'Generated code',
        },
      },
      {
        id: 'tool-3',
        serverId: 'server-1',
        name: 'optimizePerformance',
        description: 'Analyzes and optimizes code for better performance',
        parameters: [
          {
            name: 'code',
            type: 'string',
            description: 'Code to optimize',
            required: true,
          },
          {
            name: 'targetMetric',
            type: 'string',
            description: 'Metric to optimize for (speed, memory, size)',
            required: false,
            default: 'speed',
          },
        ],
        output: {
          type: 'object',
          description: 'Optimized code and performance improvements',
        },
      },
    ],
    config: {
      connectionUrl: isOmniHosted ? undefined : 'http://localhost:3000',
      authType: isOmniHosted ? 'api-key' : 'none',
      environment: {
        NODE_ENV: 'production',
        LOG_LEVEL: 'info',
        MAX_WORKERS: '4',
      },
      manifest: {
        name: 'mcp-development-server',
        version: '2.1.0',
        runtime: 'node',
        commands: {
          start: 'node dist/server.js',
          dev: 'ts-node src/server.ts',
        },
        environment: {
          NODE_ENV: 'production',
        },
      },
    },
    deployment: isOmniHosted
      ? {
          id: 'deploy-1',
          serverId: 'server-1',
          instanceId: 'inst-abc123',
          status: 'running',
          endpoint: 'wss://inst-abc123.omni.mcphub.ai/',
          resourceMetrics: {
            cpu: 45,
            memory: 256,
            requests: 1250,
            errors: 3,
            latency: 125,
          },
          logs: [
            {
              timestamp: new Date().toISOString(),
              level: 'info',
              message: 'Server started successfully',
            },
            {
              timestamp: new Date(Date.now() - 60000).toISOString(),
              level: 'info',
              message: 'Connected to database',
            },
            {
              timestamp: new Date(Date.now() - 120000).toISOString(),
              level: 'warn',
              message: 'High memory usage detected',
            },
            {
              timestamp: new Date(Date.now() - 180000).toISOString(),
              level: 'error',
              message: 'Failed to process request: timeout',
            },
          ],
          config: {
            environment: {
              NODE_ENV: 'production',
              LOG_LEVEL: 'info',
            },
            runtime: 'node',
            version: '2.1.0',
            autoRestart: true,
            maxMemory: 512,
            timeout: 30000,
          },
          createdAt: '2024-11-01',
          updatedAt: new Date().toISOString(),
        }
      : undefined,
    permissions: {
      canManageDeployment: true,
      canEditConfig: true,
      canViewLogs: true,
      canViewMetrics: true,
      isOwner: false,
      organizationRole: 'member',
    },
    security: {
      id: 'scan-1',
      serverId: 'server-1',
      version: '2.1.0',
      status: 'passed',
      score: 92,
      permissions: ['filesystem:read', 'network:connect', 'process:spawn'],
      vulnerabilities: [
        {
          severity: 'low',
          type: 'Dependency',
          description: 'Outdated dependency detected: express@4.17.1',
          recommendation: 'Update to express@4.18.2 or later',
        },
      ],
      lastScanned: new Date(Date.now() - 86400000).toISOString(),
    },
    reviews: [
      {
        id: 'review-1',
        serverId: 'server-1',
        userId: 'user-1',
        userName: 'John Developer',
        rating: 5,
        title: 'Excellent development tool',
        content: 'This server has significantly improved our development workflow. The code analysis features are particularly impressive.',
        helpful: 42,
        createdAt: '2024-10-15',
        updatedAt: '2024-10-15',
      },
      {
        id: 'review-2',
        serverId: 'server-1',
        userId: 'user-2',
        userName: 'Sarah Coder',
        rating: 4,
        title: 'Great features, minor issues',
        content: 'Overall a great tool. The AI integration works well, though I occasionally encounter timeout issues with large codebases.',
        helpful: 28,
        createdAt: '2024-09-20',
        updatedAt: '2024-09-20',
      },
    ],
    useCases: [
      {
        id: 'use-1',
        serverId: 'server-1',
        title: 'Automated Code Review',
        description: 'Use the analyzer tool to automatically review pull requests',
        workflow: '1. Configure webhook for PR events\n2. Run analyzeCode on changed files\n3. Post results as PR comments',
        codeSnippet: `const results = await mcp.analyzeCode({
  filePath: './changed-files',
  depth: 4,
  includeMetrics: true
});

if (results.issues.length > 0) {
  await github.createComment(results);
}`,
        tags: ['automation', 'code-review', 'ci-cd'],
        author: 'mcp-team',
        likes: 156,
        createdAt: '2024-08-10',
      },
    ],
    relatedItems: [
      {
        id: 'related-1',
        type: 'server',
        name: 'mcp-testing-server',
        description: 'Automated testing and quality assurance server',
        compatibility: 'compatible',
        url: '/registry/servers/mcp-testing-server',
      },
      {
        id: 'related-2',
        type: 'client',
        name: 'mcp-vscode-extension',
        description: 'VS Code extension for MCP servers',
        compatibility: 'compatible',
        url: '/registry/clients/mcp-vscode-extension',
      },
    ],
    versions: [
      {
        version: '2.1.0',
        releaseDate: '2024-11-20',
        changelog: 'Added new optimization features and improved performance',
        breaking: false,
        deprecated: false,
        downloads: 5234,
      },
      {
        version: '2.0.0',
        releaseDate: '2024-10-01',
        changelog: 'Major update with breaking changes. New API structure and enhanced AI capabilities.',
        breaking: true,
        deprecated: false,
        downloads: 8921,
      },
      {
        version: '1.9.0',
        releaseDate: '2024-08-15',
        changelog: 'Bug fixes and performance improvements',
        breaking: false,
        deprecated: true,
        downloads: 12453,
      },
    ],
  };
}