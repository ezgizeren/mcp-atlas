#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import pg from 'pg';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Enhanced JSON parser for the specific non-standard format in the data
function parseSpecialJsonFormat(str) {
  if (!str || str === 'null' || str === '') return null;

  // If it's already an object/array, return as is
  if (typeof str === 'object') return str;

  const strValue = String(str).trim();

  try {
    // Try standard JSON parse first
    return JSON.parse(strValue);
  } catch (e) {
    // Handle the specific format: {"string1","string2","string3"}
    // This is not valid JSON but appears to be the format in the data
    if (strValue.startsWith('{') && strValue.endsWith('}')) {
      const content = strValue.slice(1, -1).trim();

      if (!content) return [];

      // Handle single item without quotes: {LOCAL_STDIO}
      if (!content.includes('"') && !content.includes(',')) {
        return [content];
      }

      // Handle the comma-separated quoted strings format
      if (content.includes('"')) {
        // Use a simple regex approach for this specific format
        const matches = content.match(/"([^"]*)"/g);
        if (matches) {
          return matches.map(match => match.slice(1, -1)); // Remove quotes
        }
      }
    }

    console.warn(`⚠️  Could not parse JSON format: ${strValue.substring(0, 100)}...`);
    return null;
  }
}

// Convert timestamp to ISO format compatible with PostgreSQL
function formatTimestamp(timestamp) {
  if (!timestamp) return null;
  try {
    // Handle format: "2025-05-18 02:57:12.701941+00"
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

// Map data to database schema
function mapDataToSchema(data) {
  console.log('🔄 Mapping data to database schema...');

  // Extract server_type from mcp_server_type_json
  let serverType = 'LOCAL_STDIO'; // default
  try {
    const serverTypeData = parseSpecialJsonFormat(data.mcp_server_type_json);
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
    mcp_server_secondary_categories_json: parseSpecialJsonFormat(data.mcp_server_secondary_categories_json),
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
    hosting_type: 'EXTERNAL', // Context7 is external service
    mcp_server_type_json: parseSpecialJsonFormat(data.mcp_server_type_json),
    mcp_features_json: parseSpecialJsonFormat(data.mcp_features_json),
    mcp_requirements_json: parseSpecialJsonFormat(data.mcp_requirements_json),

    // Tools information
    tools_overview_description: data.tools_overview_description,
    tools_count: data.tools_count ?? 0,
    tools_distinct_categories_count: data.tools_distinct_categories_count ?? 0,
    tools_definitions_json: parseSpecialJsonFormat(data.tools_definitions_json),

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
    repo_topics_json: parseSpecialJsonFormat(data.repo_topics_json),
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
    mcp_env_vars_info_json: parseSpecialJsonFormat(data.mcp_env_vars_info_json),
    mcp_general_notes_json: parseSpecialJsonFormat(data.mcp_general_notes_json),

    // Development information
    dev_debug_methods_json: parseSpecialJsonFormat(data.dev_debug_methods_json),
    dev_support_channels_json: parseSpecialJsonFormat(data.dev_support_channels_json),
    dev_contribution_guidelines_url_or_text: data.dev_contribution_guidelines_url_or_text,

    // Security information
    security_compliance_json: parseSpecialJsonFormat(data.security_compliance_json),
    security_auth_methods_json: parseSpecialJsonFormat(data.security_auth_methods_json),
    security_data_privacy_json: parseSpecialJsonFormat(data.security_data_privacy_json),
    security_best_practices_json: parseSpecialJsonFormat(data.security_best_practices_json),

    // Examples and use cases
    examples_use_cases_json: parseSpecialJsonFormat(data.examples_use_cases_json),
    examples_workflows_json: parseSpecialJsonFormat(data.examples_workflows_json),
    examples_recipes_json: parseSpecialJsonFormat(data.examples_recipes_json),
    examples_playground_snippets_json: parseSpecialJsonFormat(data.examples_playground_snippets_json),

    // Miscellaneous
    meta_miscellaneous_details_json: parseSpecialJsonFormat(data.meta_miscellaneous_details_json),

    // Scoring
    scoring: parseSpecialJsonFormat(data.scoring)
  };
}

// Insert data into PostgreSQL using parameterized query
async function insertServerData(mappedData) {
  // Handle connection string with special characters
  const connectionString = process.env.PSQL_CONNECTION_STRING;

  // Alternative: Use connection object if string parsing fails
  const connectionConfig = {
    host: 'aws-1-us-east-2.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.nqscestrzthcjuavldys',
    password: 'Hacklava123?',
    ssl: {
      rejectUnauthorized: false
    }
  };

  let client;
  try {
    // Try connection string first
    client = new Client({ connectionString: connectionString });
  } catch (e) {
    console.log('⚠️  Connection string failed, using config object');
    client = new Client(connectionConfig);
  }

  try {
    console.log('🔌 Connecting to PostgreSQL...');
    await client.connect();
    console.log('✅ Connected to database');

    // Prepare columns and values for parameterized query
    const columns = Object.keys(mappedData).filter(key => mappedData[key] !== undefined);
    const values = columns.map(col => mappedData[col]);
    const placeholders = columns.map((_, index) => `$${index + 1}`);

    const insertQuery = `
      INSERT INTO servers (${columns.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING id, mcp_name, provider_name, created_at;
    `;

    console.log('💾 Inserting server data...');
    console.log(`   Columns: ${columns.length}`);
    console.log(`   Server: ${mappedData.mcp_name}`);

    const result = await client.query(insertQuery, values);

    if (result.rows.length > 0) {
      const insertedRow = result.rows[0];
      console.log('✅ Server data inserted successfully!');
      console.log(`   ID: ${insertedRow.id}`);
      console.log(`   Name: ${insertedRow.mcp_name}`);
      console.log(`   Provider: ${insertedRow.provider_name}`);
      console.log(`   Created: ${insertedRow.created_at}`);

      return insertedRow;
    } else {
      throw new Error('No data returned from insert operation');
    }

  } catch (error) {
    console.error('❌ Database insertion failed:', error.message);
    if (error.code) {
      console.error(`   Error Code: ${error.code}`);
    }
    if (error.constraint) {
      console.error(`   Constraint: ${error.constraint}`);
    }
    throw error;
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

// Validate inserted data
async function validateInsertion(serverId) {
  const connectionConfig = {
    host: 'aws-1-us-east-2.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.nqscestrzthcjuavldys',
    password: 'Hacklava123?',
    ssl: {
      rejectUnauthorized: false
    }
  };

  const client = new Client(connectionConfig);

  try {
    console.log('\n🔍 Validating inserted data...');
    await client.connect();

    // Query the inserted record
    const query = `
      SELECT
        id, mcp_name, provider_name, server_type, hosting_type,
        tools_count, jsonb_array_length(tools_definitions_json) as actual_tools_count,
        jsonb_array_length(mcp_features_json) as features_count,
        jsonb_array_length(mcp_requirements_json) as requirements_count,
        metadata_is_active, created_at
      FROM servers
      WHERE id = $1;
    `;

    const result = await client.query(query, [serverId]);

    if (result.rows.length > 0) {
      const row = result.rows[0];
      console.log('✅ Data validation successful:');
      console.log(`   ID: ${row.id}`);
      console.log(`   Name: ${row.mcp_name}`);
      console.log(`   Provider: ${row.provider_name}`);
      console.log(`   Server Type: ${row.server_type}`);
      console.log(`   Hosting Type: ${row.hosting_type}`);
      console.log(`   Tools Count: ${row.tools_count} (actual: ${row.actual_tools_count})`);
      console.log(`   Features Count: ${row.features_count}`);
      console.log(`   Requirements Count: ${row.requirements_count}`);
      console.log(`   Active: ${row.metadata_is_active}`);
      console.log(`   Created: ${row.created_at}`);

      // Validate tools count matches actual
      if (row.tools_count !== row.actual_tools_count) {
        console.warn(`⚠️  Tools count mismatch: declared ${row.tools_count}, actual ${row.actual_tools_count}`);
      }

      return row;
    } else {
      throw new Error('Inserted record not found');
    }

  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

// Main execution
async function main() {
  try {
    console.log('🚀 Starting complete MCP data insertion process...\n');

    // Validate environment
    const requiredEnvVars = ['SUPABASE_PROJECT_ID', 'PSQL_CONNECTION_STRING'];
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
      }
    }

    // Read and parse data.json
    console.log('📖 Reading data.json...');
    const dataPath = path.join(__dirname, 'data.json');
    const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    console.log(`✅ Loaded data for: ${rawData.mcp_name}`);
    console.log(`   ID: ${rawData.id}`);
    console.log(`   Provider: ${rawData.provider_name}`);
    console.log(`   Tools: ${rawData.tools_count}`);

    // Map data to schema
    const mappedData = mapDataToSchema(rawData);

    // Show parsing results
    console.log('\n📊 Parsing Results:');
    console.log(`   Server Type: ${mappedData.server_type}`);
    console.log(`   Hosting Type: ${mappedData.hosting_type}`);
    console.log(`   Features: ${Array.isArray(mappedData.mcp_features_json) ? mappedData.mcp_features_json.length : 'N/A'}`);
    console.log(`   Requirements: ${Array.isArray(mappedData.mcp_requirements_json) ? mappedData.mcp_requirements_json.length : 'N/A'}`);
    console.log(`   Tools Definitions: ${Array.isArray(mappedData.tools_definitions_json) ? mappedData.tools_definitions_json.length : 'N/A'}`);

    // Insert data
    const insertedRecord = await insertServerData(mappedData);

    // Validate insertion
    await validateInsertion(insertedRecord.id);

    console.log('\n🎉 Complete! MCP server data successfully inserted and validated.');

  } catch (error) {
    console.error('\n❌ Process failed:', error.message);
    process.exit(1);
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}