/**
 * Database type definitions matching Supabase schema
 * Auto-generated based on the mcp-atlas database structure
 */

export type ServerType = 'LOCAL_STDIO' | 'HTTP_STREAM' | 'SSE';
export type HostingType = 'EXTERNAL' | 'OMNI_HOSTED';
export type DeploymentStatus = 'running' | 'stopped' | 'starting' | 'stopping' | 'error';
export type PermissionType = 'admin' | 'editor' | 'viewer';

export interface Database {
  public: {
    Tables: {
      servers: {
        Row: {
          id: string;
          metadata_record_created_at: string | null;
          metadata_record_updated_at: string | null;
          metadata_is_active: boolean | null;
          mcp_name: string;
          mcp_description: string | null;
          mcp_purpose: string | null;
          mcp_server_primary_category: string | null;
          mcp_server_secondary_categories_json: any | null;
          mcp_server_maturity_indicator: string | null;
          mcp_integration_complexity_indicator: string | null;
          app_domain: string | null;
          app_slug: string | null;
          app_description: string | null;
          provider_name: string;
          provider_is_official: boolean | null;
          meta_source_data_last_updated: string | null;
          meta_declared_license: string | null;
          meta_information_sources: string | null;
          server_type: ServerType;
          hosting_type: HostingType;
          mcp_server_type_json: any | null;
          mcp_features_json: any | null;
          mcp_requirements_json: any | null;
          tools_overview_description: string | null;
          tools_count: number | null;
          tools_distinct_categories_count: number | null;
          tools_definitions_json: any;
          repo_platform: string | null;
          repo_owner_login: string | null;
          repo_owner_avatar_url: string | null;
          repo_full_name: string | null;
          repo_stargazers_count: number | null;
          repo_watchers_count: number | null;
          repo_forks_count: number | null;
          repo_primary_language: string | null;
          repo_description: string | null;
          repo_html_url: string | null;
          repo_license_name: string | null;
          repo_license_spdx_id: string | null;
          repo_topics_json: any | null;
          repo_created_at: string | null;
          repo_updated_at: string | null;
          repo_last_push_at: string | null;
          repo_open_issues_count: number | null;
          repo_has_issues_enabled: boolean | null;
          repo_has_projects_enabled: boolean | null;
          repo_has_wiki_enabled: boolean | null;
          repo_has_discussions_enabled: boolean | null;
          repo_is_archived: boolean | null;
          repo_is_disabled: boolean | null;
          repo_file_tree_text: string | null;
          mcp_env_vars_info_json: any | null;
          mcp_general_notes_json: any | null;
          dev_debug_methods_json: any | null;
          dev_support_channels_json: any | null;
          dev_contribution_guidelines_url_or_text: string | null;
          security_compliance_json: any | null;
          security_auth_methods_json: any | null;
          security_data_privacy_json: any | null;
          security_best_practices_json: any | null;
          examples_use_cases_json: any | null;
          examples_workflows_json: any | null;
          examples_recipes_json: any | null;
          examples_playground_snippets_json: any | null;
          meta_miscellaneous_details_json: any | null;
          scoring: any | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['servers']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['servers']['Insert']>;
      };
      deployments: {
        Row: {
          id: string;
          server_id: string | null;
          organization_id: string | null;
          instance_id: string;
          status: DeploymentStatus | null;
          endpoint_url: string | null;
          runtime_config: any | null;
          resource_limits: any | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['deployments']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['deployments']['Insert']>;
      };
      reviews: {
        Row: {
          id: string;
          server_id: string | null;
          user_id: string | null;
          rating: number | null;
          title: string | null;
          content: string | null;
          is_verified: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['reviews']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>;
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['organizations']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['organizations']['Insert']>;
      };
      user_permissions: {
        Row: {
          id: string;
          user_id: string | null;
          organization_id: string | null;
          permission_type: PermissionType;
          permissions: any | null;
          created_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['user_permissions']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['user_permissions']['Insert']>;
      };
      versions: {
        Row: {
          id: string;
          server_id: string | null;
          version: string;
          metadata: any | null;
          created_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['versions']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['versions']['Insert']>;
      };
      deployment_logs: {
        Row: {
          id: string;
          deployment_id: string | null;
          level: string;
          message: string;
          created_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['deployment_logs']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['deployment_logs']['Insert']>;
      };
      deployment_metrics: {
        Row: {
          id: string;
          deployment_id: string | null;
          metric_type: string;
          data: any;
          created_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['deployment_metrics']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['deployment_metrics']['Insert']>;
      };
    };
  };
}

// Helper types for easier usage
export type Server = Database['public']['Tables']['servers']['Row'];
export type Deployment = Database['public']['Tables']['deployments']['Row'];
export type Review = Database['public']['Tables']['reviews']['Row'];
export type Organization = Database['public']['Tables']['organizations']['Row'];
export type UserPermission = Database['public']['Tables']['user_permissions']['Row'];
export type Version = Database['public']['Tables']['versions']['Row'];
export type DeploymentLog = Database['public']['Tables']['deployment_logs']['Row'];
export type DeploymentMetric = Database['public']['Tables']['deployment_metrics']['Row'];

// Tool definition structure from tools_definitions_json
export interface ToolDefinition {
  name: string;
  description?: string;
  desc?: string;
  friendly_name?: string;
  func_type?: string;
  risk_score?: number;
  inputSchema?: {
    type: string;
    properties?: Record<string, any>;
    required?: string[];
  };
  args_schema?: Record<string, any>;
  output_schema?: any;
}