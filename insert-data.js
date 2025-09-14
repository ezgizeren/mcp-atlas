#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Read and parse the data.json file
const dataPath = path.join(process.cwd(), 'data.json');
const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Function to safely parse JSON strings, return null if invalid
function safeJsonParse(str) {
  if (!str || str === 'null' || str === '') return null;

  // If it's already an object/array, return as is
  if (typeof str === 'object') return str;

  // Convert to string if not already
  const strValue = String(str);

  try {
    // Try to parse as regular JSON first
    return JSON.parse(strValue);
  } catch (e) {
    // Handle the special case where we have {item1} or {"item1","item2","item3"}
    if (strValue.startsWith('{') && strValue.endsWith('}')) {
      const content = strValue.slice(1, -1).trim();

      if (!content) return [];

      // Check if it's a single item without quotes
      if (!content.includes('"') && !content.includes(',')) {
        return [content];
      }

      // Handle multiple quoted items separated by commas
      if (content.includes('"')) {
        // Split by comma, but be careful with commas inside quotes
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

    console.warn(`Failed to parse JSON: ${strValue.substring(0, 100)}...`, e.message);
    return null;
  }
}

// Function to convert timestamp strings to proper format
function formatTimestamp(timestamp) {
  if (!timestamp) return null;
  try {
    return new Date(timestamp).toISOString();
  } catch (e) {
    console.warn(`Failed to parse timestamp: ${timestamp}`);
    return null;
  }
}

// Map the data to the database schema
function mapDataToSchema(data) {
  return {
    // Basic metadata (using data.id but need to check if it exists)
    metadata_record_created_at: formatTimestamp(data.metadata_record_created_at),
    metadata_record_updated_at: formatTimestamp(data.metadata_record_updated_at),
    metadata_is_active: data.metadata_is_active,

    // MCP server information
    mcp_name: data.mcp_name,
    mcp_description: data.mcp_description,
    mcp_purpose: data.mcp_purpose,
    mcp_server_primary_category: data.mcp_server_primary_category,
    mcp_server_secondary_categories_json: safeJsonParse(data.mcp_server_secondary_categories_json),
    mcp_server_maturity_indicator: data.mcp_server_maturity_indicator,
    mcp_integration_complexity_indicator: data.mcp_integration_complexity_indicator,

    // Application information
    app_domain: data.app_domain,
    app_slug: data.app_slug,
    app_description: data.app_description,

    // Provider information
    provider_name: data.provider_name,
    provider_is_official: data.provider_is_official,

    // Meta information
    meta_source_data_last_updated: formatTimestamp(data.meta_source_data_last_updated),
    meta_declared_license: data.meta_declared_license,
    meta_information_sources: data.meta_information_sources,

    // Server configuration - handle required fields
    server_type: 'LOCAL_STDIO', // Based on mcp_server_type_json content
    hosting_type: 'EXTERNAL', // Assume external since it's Context7 service
    mcp_server_type_json: safeJsonParse(data.mcp_server_type_json),
    mcp_features_json: safeJsonParse(data.mcp_features_json),
    mcp_requirements_json: safeJsonParse(data.mcp_requirements_json),

    // Tools information
    tools_overview_description: data.tools_overview_description,
    tools_count: data.tools_count || 0,
    tools_distinct_categories_count: data.tools_distinct_categories_count || 0,
    tools_definitions_json: safeJsonParse(data.tools_definitions_json),

    // Repository information
    repo_platform: data.repo_platform,
    repo_owner_login: data.repo_owner_login,
    repo_owner_avatar_url: data.repo_owner_avatar_url,
    repo_full_name: data.repo_full_name,
    repo_stargazers_count: data.repo_stargazers_count || 0,
    repo_watchers_count: data.repo_watchers_count || 0,
    repo_forks_count: data.repo_forks_count || 0,
    repo_primary_language: data.repo_primary_language,
    repo_description: data.repo_description,
    repo_html_url: data.repo_html_url,
    repo_license_name: data.repo_license_name,
    repo_license_spdx_id: data.repo_license_spdx_id,
    repo_topics_json: safeJsonParse(data.repo_topics_json),
    repo_created_at: formatTimestamp(data.repo_created_at),
    repo_updated_at: formatTimestamp(data.repo_updated_at),
    repo_last_push_at: formatTimestamp(data.repo_last_push_at),
    repo_open_issues_count: data.repo_open_issues_count || 0,
    repo_has_issues_enabled: data.repo_has_issues_enabled || false,
    repo_has_projects_enabled: data.repo_has_projects_enabled || false,
    repo_has_wiki_enabled: data.repo_has_wiki_enabled || false,
    repo_has_discussions_enabled: data.repo_has_discussions_enabled || false,
    repo_is_archived: data.repo_is_archived || false,
    repo_is_disabled: data.repo_is_disabled || false,
    repo_file_tree_text: data.repo_file_tree_text,

    // Configuration and environment
    mcp_env_vars_info_json: safeJsonParse(data.mcp_env_vars_info_json),
    mcp_general_notes_json: safeJsonParse(data.mcp_general_notes_json),

    // Development information
    dev_debug_methods_json: safeJsonParse(data.dev_debug_methods_json),
    dev_support_channels_json: safeJsonParse(data.dev_support_channels_json),
    dev_contribution_guidelines_url_or_text: data.dev_contribution_guidelines_url_or_text,

    // Security information
    security_compliance_json: safeJsonParse(data.security_compliance_json),
    security_auth_methods_json: safeJsonParse(data.security_auth_methods_json),
    security_data_privacy_json: safeJsonParse(data.security_data_privacy_json),
    security_best_practices_json: safeJsonParse(data.security_best_practices_json),

    // Examples and use cases
    examples_use_cases_json: safeJsonParse(data.examples_use_cases_json),
    examples_workflows_json: safeJsonParse(data.examples_workflows_json),
    examples_recipes_json: safeJsonParse(data.examples_recipes_json),
    examples_playground_snippets_json: safeJsonParse(data.examples_playground_snippets_json),

    // Miscellaneous
    meta_miscellaneous_details_json: safeJsonParse(data.meta_miscellaneous_details_json),

    // Scoring
    scoring: safeJsonParse(data.scoring)
  };
}

// Generate SQL INSERT statement
function generateInsertSQL(mappedData) {
  const columns = Object.keys(mappedData).filter(key => mappedData[key] !== undefined);
  const values = columns.map(col => {
    const value = mappedData[col];
    if (value === null) return 'NULL';
    if (typeof value === 'boolean') return value.toString();
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'object') {
      // Use dollar-quoted strings to avoid escaping issues
      const jsonStr = JSON.stringify(value);
      return `$jsonb$${jsonStr}$jsonb$::jsonb`;
    }
    // Use dollar-quoted strings for text values to avoid escaping issues
    return `$text$${value}$text$`;
  });

  return `INSERT INTO servers (${columns.join(', ')}) VALUES (${values.join(', ')});`;
}

// Main execution
console.log('Processing data.json...');
const mappedData = mapDataToSchema(rawData);

console.log('\nMapped data summary:');
console.log(`- Server: ${mappedData.mcp_name}`);
console.log(`- Provider: ${mappedData.provider_name}`);
console.log(`- Tools count: ${mappedData.tools_count}`);
console.log(`- Server type: ${mappedData.server_type}`);
console.log(`- Hosting type: ${mappedData.hosting_type}`);

// Generate and write SQL
const sql = generateInsertSQL(mappedData);
const sqlPath = path.join(process.cwd(), 'insert-server.sql');
fs.writeFileSync(sqlPath, sql);

console.log(`\nSQL INSERT statement written to: ${sqlPath}`);
console.log('\nYou can now execute this SQL against your Supabase database.');

// Also output as JSON for inspection
const jsonPath = path.join(process.cwd(), 'mapped-data.json');
fs.writeFileSync(jsonPath, JSON.stringify(mappedData, null, 2));
console.log(`Mapped data written to: ${jsonPath}`);