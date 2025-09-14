#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'SUPABASE_PERSONAL_ACCESS_TOKEN',
  'SUPABASE_URL',
  'SUPABASE_PROJECT_ID',
  'PSQL_CONNECTION_STRING'
];

console.log('🔍 Validating environment variables...');
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
  console.log(`✅ ${envVar}: ${envVar.includes('TOKEN') || envVar.includes('STRING') ? '[REDACTED]' : process.env[envVar]}`);
}

// Custom JSON parser for non-standard format
function parseNonStandardJson(str) {
  if (!str || str === 'null' || str === '') return null;

  // If it's already an object/array, return as is
  if (typeof str === 'object') return str;

  // Convert to string if not already
  const strValue = String(str).trim();

  try {
    // Try standard JSON parse first
    return JSON.parse(strValue);
  } catch (e) {
    // Handle non-standard format like {"item1","item2","item3"}
    if (strValue.startsWith('{') && strValue.endsWith('}')) {
      const content = strValue.slice(1, -1).trim();

      if (!content) return [];

      // Handle single item without quotes like {LOCAL_STDIO}
      if (!content.includes('"') && !content.includes(',')) {
        return [content];
      }

      // Handle multiple quoted items without colons
      if (content.includes('"') && !content.includes(':')) {
        const items = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < content.length; i++) {
          const char = content[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            if (current.trim()) {
              items.push(current.trim().replace(/^"/, '').replace(/"$/, ''));
            }
            current = '';
          } else {
            current += char;
          }
        }

        // Add the last item
        if (current.trim()) {
          items.push(current.trim().replace(/^"/, '').replace(/"$/, ''));
        }

        return items;
      }
    }

    console.warn(`⚠️  Failed to parse JSON: ${strValue.substring(0, 100)}...`);
    return null;
  }
}

// Convert timestamp to ISO format
function formatTimestamp(timestamp) {
  if (!timestamp) return null;
  try {
    // Handle format: "2025-05-18 02:57:12.701941+00"
    const isoString = timestamp.replace(' ', 'T').replace('+00', '+00:00');
    return new Date(isoString).toISOString();
  } catch (e) {
    console.warn(`⚠️  Failed to parse timestamp: ${timestamp}`);
    return null;
  }
}

// Map data to database schema with proper defaults
function mapDataToSchema(data) {
  console.log('🔄 Mapping data to database schema...');

  // Extract server_type from mcp_server_type_json
  let serverType = 'LOCAL_STDIO'; // default
  try {
    const serverTypeData = parseNonStandardJson(data.mcp_server_type_json);
    if (Array.isArray(serverTypeData) && serverTypeData.length > 0) {
      serverType = serverTypeData[0];
    }
  } catch (e) {
    console.warn('⚠️  Using default server_type: LOCAL_STDIO');
  }

  return {
    // Basic metadata
    metadata_record_created_at: formatTimestamp(data.metadata_record_created_at),
    metadata_record_updated_at: formatTimestamp(data.metadata_record_updated_at),
    metadata_is_active: data.metadata_is_active ?? true,

    // MCP server information
    mcp_name: data.mcp_name,
    mcp_description: data.mcp_description,
    mcp_purpose: data.mcp_purpose,
    mcp_server_primary_category: data.mcp_server_primary_category,
    mcp_server_secondary_categories_json: parseNonStandardJson(data.mcp_server_secondary_categories_json),
    mcp_server_maturity_indicator: data.mcp_server_maturity_indicator,
    mcp_integration_complexity_indicator: data.mcp_integration_complexity_indicator,

    // Application information
    app_domain: data.app_domain,
    app_slug: data.app_slug,
    app_description: data.app_description,

    // Provider information
    provider_name: data.provider_name,
    provider_is_official: data.provider_is_official ?? false,

    // Meta information
    meta_source_data_last_updated: formatTimestamp(data.meta_source_data_last_updated),
    meta_declared_license: data.meta_declared_license,
    meta_information_sources: data.meta_information_sources,

    // Server configuration - required fields
    server_type: serverType,
    hosting_type: 'EXTERNAL', // Context7 is external service - required field default
    mcp_server_type_json: parseNonStandardJson(data.mcp_server_type_json),
    mcp_features_json: parseNonStandardJson(data.mcp_features_json),
    mcp_requirements_json: parseNonStandardJson(data.mcp_requirements_json),

    // Tools information
    tools_overview_description: data.tools_overview_description,
    tools_count: data.tools_count ?? 0,
    tools_distinct_categories_count: data.tools_distinct_categories_count ?? 0,
    tools_definitions_json: parseNonStandardJson(data.tools_definitions_json),

    // Repository information
    repo_platform: data.repo_platform,
    repo_owner_login: data.repo_owner_login,
    repo_owner_avatar_url: data.repo_owner_avatar_url,
    repo_full_name: data.repo_full_name,
    repo_stargazers_count: data.repo_stargazers_count ?? 0,
    repo_watchers_count: data.repo_watchers_count ?? 0,
    repo_forks_count: data.repo_forks_count ?? 0,
    repo_primary_language: data.repo_primary_language,
    repo_description: data.repo_description,
    repo_html_url: data.repo_html_url,
    repo_license_name: data.repo_license_name,
    repo_license_spdx_id: data.repo_license_spdx_id,
    repo_topics_json: parseNonStandardJson(data.repo_topics_json),
    repo_created_at: formatTimestamp(data.repo_created_at),
    repo_updated_at: formatTimestamp(data.repo_updated_at),
    repo_last_push_at: formatTimestamp(data.repo_last_push_at),
    repo_open_issues_count: data.repo_open_issues_count ?? 0,
    repo_has_issues_enabled: data.repo_has_issues_enabled ?? false,
    repo_has_projects_enabled: data.repo_has_projects_enabled ?? false,
    repo_has_wiki_enabled: data.repo_has_wiki_enabled ?? false,
    repo_has_discussions_enabled: data.repo_has_discussions_enabled ?? false,
    repo_is_archived: data.repo_is_archived ?? false,
    repo_is_disabled: data.repo_is_disabled ?? false,
    repo_file_tree_text: data.repo_file_tree_text,

    // Configuration and environment
    mcp_env_vars_info_json: parseNonStandardJson(data.mcp_env_vars_info_json),
    mcp_general_notes_json: parseNonStandardJson(data.mcp_general_notes_json),

    // Development information
    dev_debug_methods_json: parseNonStandardJson(data.dev_debug_methods_json),
    dev_support_channels_json: parseNonStandardJson(data.dev_support_channels_json),
    dev_contribution_guidelines_url_or_text: data.dev_contribution_guidelines_url_or_text,

    // Security information
    security_compliance_json: parseNonStandardJson(data.security_compliance_json),
    security_auth_methods_json: parseNonStandardJson(data.security_auth_methods_json),
    security_data_privacy_json: parseNonStandardJson(data.security_data_privacy_json),
    security_best_practices_json: parseNonStandardJson(data.security_best_practices_json),

    // Examples and use cases
    examples_use_cases_json: parseNonStandardJson(data.examples_use_cases_json),
    examples_workflows_json: parseNonStandardJson(data.examples_workflows_json),
    examples_recipes_json: parseNonStandardJson(data.examples_recipes_json),
    examples_playground_snippets_json: parseNonStandardJson(data.examples_playground_snippets_json),

    // Miscellaneous
    meta_miscellaneous_details_json: parseNonStandardJson(data.meta_miscellaneous_details_json),

    // Scoring
    scoring: parseNonStandardJson(data.scoring)
  };
}

// Main execution
async function main() {
  try {
    console.log('🚀 Starting MCP data insertion process...\n');

    // Read and parse data.json
    console.log('📖 Reading data.json...');
    const dataPath = path.join(__dirname, 'data.json');
    const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    console.log(`✅ Successfully loaded data for: ${rawData.mcp_name}`);
    console.log(`   Provider: ${rawData.provider_name}`);
    console.log(`   Tools: ${rawData.tools_count}`);
    console.log(`   Repository: ${rawData.repo_full_name}\n`);

    // Map data to schema
    const mappedData = mapDataToSchema(rawData);

    // Validate critical fields
    const criticalFields = ['mcp_name', 'provider_name', 'server_type', 'hosting_type', 'tools_definitions_json'];
    for (const field of criticalFields) {
      if (!mappedData[field]) {
        throw new Error(`Critical field missing: ${field}`);
      }
    }

    console.log('✅ Data mapping completed successfully');
    console.log(`   Server Type: ${mappedData.server_type}`);
    console.log(`   Hosting Type: ${mappedData.hosting_type}`);
    console.log(`   Tools Count: ${mappedData.tools_count}`);
    console.log(`   Features Count: ${Array.isArray(mappedData.mcp_features_json) ? mappedData.mcp_features_json.length : 'N/A'}`);

    // Save mapped data for inspection
    const mappedDataPath = path.join(__dirname, 'mapped-data-final.json');
    fs.writeFileSync(mappedDataPath, JSON.stringify(mappedData, null, 2));
    console.log(`📄 Mapped data saved to: ${mappedDataPath}\n`);

    console.log('🎯 Ready for database insertion...');
    console.log('   Next: Run the insertion script with PostgreSQL connection');

  } catch (error) {
    console.error('❌ Error during data processing:', error.message);
    process.exit(1);
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}