#!/usr/bin/env node

import fs from 'fs';
import dotenv from 'dotenv';
import pg from 'pg';

const { Client } = pg;
dotenv.config();

function parseSpecialJsonFormat(str) {
  if (!str || str === 'null' || str === '') return null;
  if (typeof str === 'object') return str;

  const strValue = String(str).trim();

  try {
    return JSON.parse(strValue);
  } catch (e) {
    if (strValue.startsWith('{') && strValue.endsWith('}')) {
      const content = strValue.slice(1, -1).trim();
      if (!content) return [];
      if (!content.includes('"') && !content.includes(',')) {
        return [content];
      }
      if (content.includes('"')) {
        const matches = content.match(/"([^"]*)"/g);
        if (matches) {
          return matches.map(match => match.slice(1, -1));
        }
      }
    }
    console.warn(`⚠️  Could not parse JSON: ${strValue.substring(0, 100)}...`);
    return null;
  }
}

function formatTimestamp(timestamp) {
  if (!timestamp) return null;
  try {
    let isoString = timestamp.replace(' ', 'T');
    if (isoString.endsWith('+00')) {
      isoString = isoString.replace('+00', '+00:00');
    }
    return new Date(isoString).toISOString();
  } catch (e) {
    console.warn(`⚠️  Failed to parse timestamp: ${timestamp}`);
    return null;
  }
}

// Safely convert value to JSON string, handling special cases
function safeJsonStringify(value) {
  if (value === null || value === undefined) {
    return null;
  }

  try {
    return JSON.stringify(value);
  } catch (e) {
    console.warn(`⚠️  Failed to stringify JSON value:`, value);
    return null;
  }
}

async function safeInsertData() {
  const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));

  const connectionConfig = {
    host: 'aws-1-us-east-2.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.nqscestrzthcjuavldys',
    password: 'Hacklava123?',
    ssl: { rejectUnauthorized: false }
  };

  const client = new Client(connectionConfig);

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Parse and prepare all data
    const serverType = parseSpecialJsonFormat(data.mcp_server_type_json)?.[0] || 'LOCAL_STDIO';

    const preparedData = {
      // Basic metadata
      metadata_record_created_at: formatTimestamp(data.metadata_record_created_at),
      metadata_record_updated_at: formatTimestamp(data.metadata_record_updated_at),
      metadata_is_active: data.metadata_is_active ?? true,

      // MCP server information
      mcp_name: data.mcp_name,
      mcp_description: data.mcp_description,
      mcp_purpose: data.mcp_purpose,
      mcp_server_primary_category: data.mcp_server_primary_category,
      mcp_server_secondary_categories_json: safeJsonStringify(parseSpecialJsonFormat(data.mcp_server_secondary_categories_json)),
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

      // Server configuration
      server_type: serverType,
      hosting_type: 'EXTERNAL',
      mcp_server_type_json: safeJsonStringify(parseSpecialJsonFormat(data.mcp_server_type_json)),
      mcp_features_json: safeJsonStringify(parseSpecialJsonFormat(data.mcp_features_json)),
      mcp_requirements_json: safeJsonStringify(parseSpecialJsonFormat(data.mcp_requirements_json)),

      // Tools information
      tools_overview_description: data.tools_overview_description,
      tools_count: data.tools_count ?? 0,
      tools_distinct_categories_count: data.tools_distinct_categories_count ?? 0,
      tools_definitions_json: safeJsonStringify(parseSpecialJsonFormat(data.tools_definitions_json)),

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
      repo_topics_json: safeJsonStringify(parseSpecialJsonFormat(data.repo_topics_json)),
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

      // Additional JSON fields
      mcp_env_vars_info_json: safeJsonStringify(parseSpecialJsonFormat(data.mcp_env_vars_info_json)),
      mcp_general_notes_json: safeJsonStringify(parseSpecialJsonFormat(data.mcp_general_notes_json)),
      dev_debug_methods_json: safeJsonStringify(parseSpecialJsonFormat(data.dev_debug_methods_json)),
      dev_support_channels_json: safeJsonStringify(parseSpecialJsonFormat(data.dev_support_channels_json)),
      dev_contribution_guidelines_url_or_text: data.dev_contribution_guidelines_url_or_text,
      security_compliance_json: safeJsonStringify(parseSpecialJsonFormat(data.security_compliance_json)),
      security_auth_methods_json: safeJsonStringify(parseSpecialJsonFormat(data.security_auth_methods_json)),
      security_data_privacy_json: safeJsonStringify(parseSpecialJsonFormat(data.security_data_privacy_json)),
      security_best_practices_json: safeJsonStringify(parseSpecialJsonFormat(data.security_best_practices_json)),
      examples_use_cases_json: safeJsonStringify(parseSpecialJsonFormat(data.examples_use_cases_json)),
      examples_workflows_json: safeJsonStringify(parseSpecialJsonFormat(data.examples_workflows_json)),
      examples_recipes_json: safeJsonStringify(parseSpecialJsonFormat(data.examples_recipes_json)),
      examples_playground_snippets_json: safeJsonStringify(parseSpecialJsonFormat(data.examples_playground_snippets_json)),
      meta_miscellaneous_details_json: safeJsonStringify(parseSpecialJsonFormat(data.meta_miscellaneous_details_json)),
      scoring: safeJsonStringify(parseSpecialJsonFormat(data.scoring))
    };

    // Filter out undefined values and build query
    const columns = Object.keys(preparedData).filter(key => preparedData[key] !== undefined);
    const values = columns.map(col => preparedData[col]);
    const placeholders = columns.map((_, index) => `$${index + 1}`);

    console.log(`📊 Prepared ${columns.length} columns for insertion`);
    console.log(`   Server: ${preparedData.mcp_name}`);
    console.log(`   Provider: ${preparedData.provider_name}`);

    const insertQuery = `
      INSERT INTO servers (${columns.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING id, mcp_name, provider_name, tools_count;
    `;

    const result = await client.query(insertQuery, values);

    if (result.rows.length > 0) {
      const row = result.rows[0];
      console.log('✅ Data inserted successfully!');
      console.log(`   ID: ${row.id}`);
      console.log(`   Name: ${row.mcp_name}`);
      console.log(`   Provider: ${row.provider_name}`);
      console.log(`   Tools: ${row.tools_count}`);

      return row;
    }

  } catch (error) {
    console.error('❌ Insertion failed:', error.message);
    if (error.code) console.error(`   Error Code: ${error.code}`);
    if (error.position) console.error(`   Position: ${error.position}`);
    throw error;
  } finally {
    await client.end();
  }
}

safeInsertData().catch(console.error);