import { supabase, handleSupabaseError } from '@/lib/supabase/client';
import {
  Server,
  Deployment,
  Review,
  Version,
  DeploymentLog,
  DeploymentMetric,
  ToolDefinition
} from '@/types/database';
import { ServerPageProps, ServerEntity, ToolEntity, DeploymentEntity, UserPermissions, SecurityScan, Review as AppReview, UseCase, RelatedItem, Version as AppVersion } from '@/types/server';

/**
 * Transform database server to app server entity
 */
function transformServerToEntity(server: Server): ServerEntity {
  // Parse available versions from versions data or use defaults
  const availableVersions = ['2.1.0', '2.0.0', '1.9.0'];

  return {
    id: server.id,
    name: server.mcp_name,
    namespace: server.repo_owner_login || 'unknown',
    author: server.provider_name,
    version: '2.1.0', // Current version - would come from versions table
    currentVersion: '2.1.0',
    availableVersions,
    description: server.mcp_description || '',
    serverType: mapServerType(server.server_type),
    hostingType: server.hosting_type === 'OMNI_HOSTED' ? 'omni-hosted' : 'external',
    verified: server.provider_is_official || false,
    usage: server.repo_watchers_count || 0,
    rating: 4.5, // Calculate from reviews
    forks: server.repo_forks_count || 0,
    score: calculateSecurityScore(server.scoring),
    repoUrl: server.repo_html_url || undefined,
    issuesUrl: server.repo_html_url ? `${server.repo_html_url}/issues` : undefined,
    docsUrl: server.app_domain || undefined,
    readme: server.mcp_purpose || undefined,
    projectStructure: parseFileTree(server.repo_file_tree_text),
    disclaimers: parseDisclaimers(server.mcp_general_notes_json),
    createdAt: server.created_at || new Date().toISOString(),
    updatedAt: server.updated_at || new Date().toISOString(),
    // Add missing fields
    stars: server.repo_stargazers_count || 0,
    primaryCategory: server.mcp_server_primary_category || 'General',
    secondaryCategories: server.mcp_server_secondary_categories_json || [],
    maturityIndicator: server.mcp_server_maturity_indicator || undefined,
    integrationComplexity: server.mcp_integration_complexity_indicator || undefined,
    license: server.repo_license_name || undefined,
    licenseId: server.repo_license_spdx_id || undefined,
    primaryLanguage: server.repo_primary_language || undefined,
    topics: server.repo_topics_json || [],
    openIssues: server.repo_open_issues_count || 0,
    lastPush: server.repo_last_push_at || undefined,
    features: parseFeatures(server.mcp_features_json),
    requirements: parseRequirements(server.mcp_requirements_json),
    toolsCount: server.tools_count || 0,
    redFlags: parseScoringRedFlags(server.scoring),
    // Add the full scoring data for the quality assessment tab
    scoring: server.scoring,
  } as any; // Temporary type assertion to include scoring
}

/**
 * Map database server type to app server type
 */
function mapServerType(dbType: string): string {
  const mapping: Record<string, string> = {
    'LOCAL_STDIO': 'local-stdio',
    'HTTP_STREAM': 'remote-http',
    'SSE': 'remote-sse',
  };
  return mapping[dbType] || 'local-stdio';
}

/**
 * Transform database tools to app tools
 */
function transformTools(toolsJson: any): ToolEntity[] {
  if (!toolsJson) return [];

  try {
    const tools = Array.isArray(toolsJson) ? toolsJson : [toolsJson];
    return tools.map((tool: any, index: number) => ({
      id: `tool-${index}`,
      serverId: '',
      name: tool.name || '',
      description: tool.description || tool.desc || '',
      parameters: parseToolParameters(tool.inputSchema || tool.args_schema),
      output: {
        type: tool.output_schema?.type || 'object',
        description: tool.output_schema?.description || 'Tool output',
        schema: tool.output_schema,
      },
      examples: [],
      // Add new fields from the actual schema
      friendlyName: tool.friendly_name,
      funcType: tool.func_type,
      riskScore: tool.risk_score,
      mappedCategory: tool.mapped_category,
    }));
  } catch (error) {
    console.error('Error parsing tools:', error);
    return [];
  }
}

/**
 * Parse tool parameters from schema
 */
function parseToolParameters(schema: any): any[] {
  if (!schema) return [];

  // Handle direct parameter object (new format)
  if (!schema.properties && typeof schema === 'object') {
    return Object.entries(schema).map(([name, config]: [string, any]) => ({
      name,
      type: config.type || 'string',
      description: config.description || '',
      required: config.required || false,
      default: config.default || config.default_val,
    }));
  }

  // Handle standard JSON schema format
  if (!schema.properties) return [];

  return Object.entries(schema.properties).map(([name, config]: [string, any]) => ({
    name,
    type: config.type || 'string',
    description: config.description || '',
    required: schema.required?.includes(name) || config.required || false,
    default: config.default,
  }));
}

/**
 * Transform deployment to app format
 */
function transformDeployment(deployment: Deployment, logs: DeploymentLog[], metrics: DeploymentMetric[]): DeploymentEntity {
  // Parse latest metrics
  const latestMetrics = metrics[metrics.length - 1]?.data || {};

  return {
    id: deployment.id,
    serverId: deployment.server_id || '',
    instanceId: deployment.instance_id,
    status: deployment.status || 'stopped',
    endpoint: deployment.endpoint_url || '',
    resourceMetrics: {
      cpu: latestMetrics.cpu || 0,
      memory: latestMetrics.memory || 0,
      requests: latestMetrics.requests || 0,
      errors: latestMetrics.errors || 0,
      latency: latestMetrics.latency || 0,
    },
    logs: logs.map(log => ({
      timestamp: log.created_at || new Date().toISOString(),
      level: log.level as any,
      message: log.message,
    })),
    config: {
      environment: deployment.runtime_config?.environment || {},
      runtime: deployment.runtime_config?.runtime || 'node',
      version: deployment.runtime_config?.version || '2.1.0',
      autoRestart: deployment.runtime_config?.autoRestart || true,
      maxMemory: deployment.resource_limits?.memory || 512,
      timeout: deployment.runtime_config?.timeout || 30000,
    },
    createdAt: deployment.created_at || new Date().toISOString(),
    updatedAt: deployment.updated_at || new Date().toISOString(),
  };
}

/**
 * Calculate security score from scoring data
 */
function calculateSecurityScore(scoring: any): number {
  if (!scoring) return 75;

  // Handle new scoring structure - it's an array of scoring criteria
  if (Array.isArray(scoring) && scoring.length > 0) {
    // Find the overall score from the first scoring entry
    const firstScoring = scoring[0];
    if (firstScoring?.scoring?.final_score !== undefined) {
      // Convert 0-5 scale to 0-100
      return Math.round((firstScoring.scoring.final_score / 5) * 100);
    }
  }

  // Fallback to old structure
  if (typeof scoring === 'object') {
    return scoring.security_score || scoring.overall_score || 75;
  }

  return 75;
}

/**
 * Parse file tree from text
 */
function parseFileTree(treeText: string | null): any[] {
  if (!treeText) return [];
  // Simple parse - would need more complex logic for real tree
  return [];
}

/**
 * Parse disclaimers/notes from JSON
 */
function parseDisclaimers(notesJson: any): string[] | undefined {
  if (!notesJson) return undefined;
  try {
    const notes = Array.isArray(notesJson) ? notesJson : [notesJson];
    return notes.filter(n => typeof n === 'string');
  } catch {
    return undefined;
  }
}

/**
 * Parse features from JSON array
 */
function parseFeatures(featuresJson: any): string[] {
  if (!featuresJson) return [];
  try {
    return Array.isArray(featuresJson) ? featuresJson : [];
  } catch {
    return [];
  }
}

/**
 * Parse requirements from JSON array
 */
function parseRequirements(requirementsJson: any): string[] {
  if (!requirementsJson) return [];
  try {
    return Array.isArray(requirementsJson) ? requirementsJson : [];
  } catch {
    return [];
  }
}

/**
 * Get all servers from database
 */
export async function getAllServers(): Promise<Server[]> {
  try {
    const { data: servers, error } = await supabase
      .from('servers')
      .select('*')
      .eq('metadata_is_active', true)
      .order('repo_stargazers_count', { ascending: false })
      .limit(100); // Add limit to prevent timeout

    if (error) throw error;
    return servers || [];
  } catch (error) {
    console.error('Error fetching servers:', error);
    // Return empty array instead of throwing to prevent page crashes
    return [];
  }
}

/**
 * Get server data by ID or name
 */
export async function getServerData(serverIdOrName: string): Promise<ServerPageProps> {
  try {
    // First try to get server by ID, then by name
    let { data: server, error: serverError }: { data: Server | null; error: any } = await supabase
      .from('servers')
      .select('*')
      .eq('id', serverIdOrName)
      .single();

    if (!server) {
      // Try by name
      const result = await supabase
        .from('servers')
        .select('*')
        .ilike('mcp_name', `%${serverIdOrName}%`)
        .limit(1)
        .single();

      server = result.data;
      serverError = result.error;
    }

    if (serverError || !server) {
      throw new Error('Server not found');
    }

    // Get related data
    const [deploymentsResult, reviewsResult, versionsResult]: [
      { data: Deployment[] | null; error: any },
      { data: Review[] | null; error: any },
      { data: Version[] | null; error: any }
    ] = await Promise.all([
      supabase
        .from('deployments')
        .select('*')
        .eq('server_id', server.id),
      supabase
        .from('reviews')
        .select('*')
        .eq('server_id', server.id),
      supabase
        .from('versions')
        .select('*')
        .eq('server_id', server.id)
        .order('created_at', { ascending: false }),
    ]);

    // Get deployment logs and metrics if deployment exists
    let deploymentLogs: DeploymentLog[] = [];
    let deploymentMetrics: DeploymentMetric[] = [];

    if (deploymentsResult.data && deploymentsResult.data.length > 0) {
      const deploymentId = deploymentsResult.data[0].id;

      const [logsResult, metricsResult] = await Promise.all([
        supabase
          .from('deployment_logs')
          .select('*')
          .eq('deployment_id', deploymentId)
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('deployment_metrics')
          .select('*')
          .eq('deployment_id', deploymentId)
          .order('created_at', { ascending: false })
          .limit(10),
      ]);

      deploymentLogs = logsResult.data || [];
      deploymentMetrics = metricsResult.data || [];
    }

    // Transform data to app format
    const serverEntity = transformServerToEntity(server);
    const tools = transformTools(server.tools_definitions_json);
    const deployment = deploymentsResult.data?.[0]
      ? transformDeployment(deploymentsResult.data[0], deploymentLogs, deploymentMetrics)
      : undefined;

    // Transform reviews
    const reviews: AppReview[] = (reviewsResult.data || []).map(r => ({
      id: r.id,
      serverId: r.server_id || '',
      userId: r.user_id || '',
      userName: 'Anonymous User', // Would need user data
      rating: r.rating || 0,
      title: r.title || '',
      content: r.content || '',
      helpful: 0, // Would need to track this
      createdAt: r.created_at || new Date().toISOString(),
      updatedAt: r.updated_at || new Date().toISOString(),
    }));

    // Transform versions
    const versions: AppVersion[] = (versionsResult.data || []).map(v => ({
      version: v.version,
      releaseDate: v.created_at || new Date().toISOString(),
      changelog: v.metadata?.changelog || 'No changelog available',
      breaking: v.metadata?.breaking || false,
      deprecated: v.metadata?.deprecated || false,
      downloads: v.metadata?.downloads || 0,
    }));

    // Mock data for features not in database
    const mockPermissions: UserPermissions = {
      canManageDeployment: true,
      canEditConfig: true,
      canViewLogs: true,
      canViewMetrics: true,
      isOwner: false,
      organizationRole: 'member',
    };

    const mockSecurity: SecurityScan = {
      id: 'scan-1',
      serverId: server.id,
      version: '2.1.0',
      status: 'passed',
      score: calculateSecurityScore(server.scoring),
      permissions: parsePermissions(server.security_compliance_json),
      vulnerabilities: [],
      lastScanned: new Date().toISOString(),
    };

    const mockUseCases: UseCase[] = parseUseCases(server.examples_use_cases_json);
    const mockRelated: RelatedItem[] = [];

    return {
      server: serverEntity,
      tools,
      config: {
        connectionUrl: server.app_domain || undefined,
        authType: parseAuthType(server.security_auth_methods_json),
        authConfig: server.security_auth_methods_json,
        environment: parseEnvVars(server.mcp_env_vars_info_json),
        manifest: {
          name: server.mcp_name,
          version: '2.1.0',
          runtime: 'node',
          commands: {},
          environment: parseEnvVars(server.mcp_env_vars_info_json),
        },
      },
      deployment,
      permissions: mockPermissions,
      security: mockSecurity,
      reviews,
      useCases: mockUseCases,
      relatedItems: mockRelated,
      versions,
    };
  } catch (error) {
    console.error('Error fetching server data:', error);
    throw new Error(handleSupabaseError(error));
  }
}

/**
 * Parse permissions from compliance JSON
 */
function parsePermissions(complianceJson: any): string[] {
  if (!complianceJson) return [];
  try {
    if (Array.isArray(complianceJson)) return complianceJson;
    if (complianceJson.permissions) return complianceJson.permissions;
    return [];
  } catch {
    return [];
  }
}

/**
 * Parse auth type from auth methods JSON
 */
function parseAuthType(authJson: any): 'none' | 'api-key' | 'oauth' | 'custom' | undefined {
  if (!authJson) return 'none';
  try {
    const type = authJson.type || authJson.method;
    if (type === 'api-key') return 'api-key';
    if (type === 'oauth') return 'oauth';
    if (type === 'custom') return 'custom';
    return 'none';
  } catch {
    return 'none';
  }
}

/**
 * Parse use cases from JSON
 */
function parseUseCases(useCasesJson: any): UseCase[] {
  if (!useCasesJson) return [];
  try {
    const cases = Array.isArray(useCasesJson) ? useCasesJson : [useCasesJson];
    return cases.map((useCase: any, index: number) => ({
      id: `use-${index}`,
      serverId: '',
      title: useCase.use_case_name || useCase.title || useCase.name || 'Use Case',
      description: useCase.description || useCase.user_prompt || '',
      workflow: useCase.mcp_action_flow || useCase.workflow,
      codeSnippet: useCase.code || useCase.snippet,
      tags: useCase.tags || useCase.key_mcp_tools || [],
      author: useCase.author || 'Community',
      likes: 0,
      createdAt: new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

/**
 * Parse environment variables from JSON
 */
function parseEnvVars(envVarsJson: any): any {
  if (!envVarsJson) return {};
  try {
    if (Array.isArray(envVarsJson)) {
      // Convert array format to object format
      const envObj: any = {};
      envVarsJson.forEach((env: any) => {
        if (env.name) {
          envObj[env.name] = {
            description: env.desc || env.description || '',
            type: env.type || 'string',
            default: env.default_val || env.default || '',
            required: env.is_required || false,
            sensitive: env.is_sensitive || false,
          };
        }
      });
      return envObj;
    }
    return envVarsJson;
  } catch {
    return {};
  }
}

/**
 * Parse scoring red flags
 */
function parseScoringRedFlags(scoring: any): string[] {
  if (!scoring || !Array.isArray(scoring)) return [];
  try {
    const flags: string[] = [];
    scoring.forEach((criterion: any) => {
      if (criterion?.scoring?.red_flags && Array.isArray(criterion.scoring.red_flags)) {
        criterion.scoring.red_flags.forEach((flag: any) => {
          if (flag.description) {
            flags.push(`${flag.code}: ${flag.description}`);
          }
        });
      }
    });
    return flags;
  } catch {
    return [];
  }
}