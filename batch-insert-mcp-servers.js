#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import pg from 'pg';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Enhanced JSON parser for the specific non-standard format
function parseSpecialJsonFormat(str) {
  if (!str || str === 'null' || str === '') return null;
  if (typeof str === 'object') return str;

  const strValue = String(str).trim();

  try {
    return JSON.parse(strValue);
  } catch (e) {
    // Handle non-standard formats like {LOCAL_STDIO,REMOTE_HTTP_SSE} or {"item1","item2"}
    if (strValue.startsWith('{') && strValue.endsWith('}')) {
      const content = strValue.slice(1, -1).trim();
      if (!content) return [];

      // Handle comma-separated values without quotes: {LOCAL_STDIO,REMOTE_HTTP_SSE}
      if (!content.includes('"') && content.includes(',')) {
        return content.split(',').map(item => item.trim());
      }

      // Handle single item without quotes: {LOCAL_STDIO}
      if (!content.includes('"') && !content.includes(',')) {
        return [content];
      }

      // Handle quoted items: {"item1","item2"}
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

// Convert timestamp to ISO format
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

// Safely convert value to JSON string
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

// Map single server record to database schema
function mapServerToSchema(data, originalScoring = null) {
  // Extract server_type from mcp_server_type_json and map to valid constraint values
  let serverType = 'LOCAL_STDIO'; // default
  let serverTypes = [];
  let hostingType = 'EXTERNAL'; // default

  try {
    const serverTypeData = parseSpecialJsonFormat(data.mcp_server_type_json);
    if (Array.isArray(serverTypeData) && serverTypeData.length > 0) {
      serverTypes = serverTypeData;

      // Map to valid database constraint values
      if (serverTypes.some(t => t.includes('LOCAL_STDIO'))) {
        serverType = 'LOCAL_STDIO';
      } else if (serverTypes.some(t => t.includes('HTTP_SSE') || t.includes('REMOTE_HTTP'))) {
        serverType = 'HTTP_STREAM';
      } else if (serverTypes.some(t => t.includes('SSE'))) {
        serverType = 'SSE';
      } else {
        // For non-standard types, default to LOCAL_STDIO
        serverType = 'LOCAL_STDIO';
      }

      // Determine hosting type
      if (serverTypes.some(t => t.includes('REMOTE_HTTP') || t.includes('SANDBOXED') || t.includes('DOCKER'))) {
        hostingType = 'OMNI_HOSTED';
      }
    }
  } catch (e) {
    console.warn(`⚠️  Using default server_type for ${data.mcp_name}`);
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
    hosting_type: hostingType,
    mcp_server_type_json: safeJsonStringify(serverTypes),
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

    // Use provided scoring or default to original scoring
    scoring: safeJsonStringify(originalScoring)
  };
}

// Batch insert servers with transaction safety
async function batchInsertServers(servers, originalScoring, batchSize = 50) {
  const connectionConfig = {
    host: 'aws-1-us-east-2.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.nqscestrzthcjuavldys',
    password: 'Hacklava123?',
    ssl: { rejectUnauthorized: false }
  };

  const client = new Client(connectionConfig);
  const results = [];
  let totalInserted = 0;
  let totalErrors = 0;

  try {
    await client.connect();
    console.log('✅ Connected to database');
    console.log(`📊 Processing ${servers.length} servers in batches of ${batchSize}`);

    // Process in batches
    for (let i = 0; i < servers.length; i += batchSize) {
      const batch = servers.slice(i, i + batchSize);
      console.log(`\n🔄 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(servers.length / batchSize)} (${batch.length} servers)...`);

      try {
        // Start transaction
        await client.query('BEGIN');

        for (const [batchIndex, server] of batch.entries()) {
          try {
            const mappedData = mapServerToSchema(server, originalScoring);

            // Filter out undefined values
            const columns = Object.keys(mappedData).filter(key => mappedData[key] !== undefined);
            const values = columns.map(col => mappedData[col]);
            const placeholders = columns.map((_, index) => `$${index + 1}`);

            const insertQuery = `
              INSERT INTO servers (${columns.join(', ')})
              VALUES (${placeholders.join(', ')})
              RETURNING id, mcp_name, provider_name;
            `;

            const result = await client.query(insertQuery, values);

            if (result.rows.length > 0) {
              const insertedServer = result.rows[0];
              results.push(insertedServer);
              totalInserted++;

              if ((totalInserted) % 10 === 0) {
                console.log(`   ✅ ${totalInserted} servers inserted...`);
              }
            }

          } catch (serverError) {
            console.error(`   ❌ Failed to insert "${server.mcp_name}": ${serverError.message}`);
            totalErrors++;
            // Continue with next server in batch
          }
        }

        // Commit transaction for this batch
        await client.query('COMMIT');
        console.log(`   ✅ Batch ${Math.floor(i / batchSize) + 1} committed successfully`);

      } catch (batchError) {
        // Rollback transaction for this batch
        await client.query('ROLLBACK');
        console.error(`   ❌ Batch ${Math.floor(i / batchSize) + 1} failed: ${batchError.message}`);
        totalErrors += batch.length;
      }
    }

    console.log(`\n📊 Insertion Summary:`);
    console.log(`   ✅ Successfully inserted: ${totalInserted} servers`);
    console.log(`   ❌ Failed insertions: ${totalErrors}`);
    console.log(`   📈 Success rate: ${((totalInserted / servers.length) * 100).toFixed(1)}%`);

    return results;

  } catch (error) {
    console.error('❌ Batch insertion failed:', error.message);
    throw error;
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

// Validate batch insertion results
async function validateBatchResults() {
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
    console.log('\n🔍 Validating batch insertion results...');

    const validationQuery = `
      SELECT
        COUNT(*) as total_servers,
        COUNT(CASE WHEN metadata_is_active = true THEN 1 END) as active_servers,
        COUNT(CASE WHEN tools_count > 0 THEN 1 END) as servers_with_tools,
        COUNT(CASE WHEN provider_is_official = true THEN 1 END) as official_servers,
        AVG(tools_count)::numeric(10,2) as avg_tools_per_server,
        AVG(repo_stargazers_count)::numeric(10,0) as avg_stars,
        COUNT(DISTINCT provider_name) as unique_providers,
        COUNT(DISTINCT mcp_server_primary_category) as unique_categories
      FROM servers;
    `;

    const result = await client.query(validationQuery);
    const stats = result.rows[0];

    console.log('📊 Database Statistics:');
    console.log(`   Total Servers: ${stats.total_servers}`);
    console.log(`   Active Servers: ${stats.active_servers}`);
    console.log(`   Servers with Tools: ${stats.servers_with_tools}`);
    console.log(`   Official Servers: ${stats.official_servers}`);
    console.log(`   Average Tools per Server: ${stats.avg_tools_per_server}`);
    console.log(`   Average GitHub Stars: ${stats.avg_stars}`);
    console.log(`   Unique Providers: ${stats.unique_providers}`);
    console.log(`   Unique Categories: ${stats.unique_categories}`);

    // Top providers
    const topProvidersQuery = `
      SELECT provider_name, COUNT(*) as server_count
      FROM servers
      GROUP BY provider_name
      ORDER BY server_count DESC
      LIMIT 5;
    `;

    const providersResult = await client.query(topProvidersQuery);
    console.log('\n🏢 Top Providers:');
    providersResult.rows.forEach((row, i) => {
      console.log(`   ${i + 1}. ${row.provider_name}: ${row.server_count} servers`);
    });

    return stats;

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
    console.log('🚀 Starting batch MCP server insertion...\n');

    // Load new import data
    console.log('📖 Loading new-import.json...');
    const newImportPath = path.join(__dirname, 'new-import.json');
    const newServers = JSON.parse(fs.readFileSync(newImportPath, 'utf8'));
    console.log(`✅ Loaded ${newServers.length} servers from new-import.json`);

    // Load original scoring data
    console.log('📖 Loading original scoring data from data.json...');
    const originalDataPath = path.join(__dirname, 'data.json');
    const originalData = JSON.parse(fs.readFileSync(originalDataPath, 'utf8'));
    const originalScoring = originalData.scoring;
    console.log(`✅ Loaded scoring data with ${originalScoring ? originalScoring.length : 0} criteria`);

    // Sample first few servers for preview
    console.log('\n📋 Preview of servers to insert:');
    newServers.slice(0, 3).forEach((server, i) => {
      console.log(`   ${i + 1}. ${server.mcp_name}`);
      console.log(`      Provider: ${server.provider_name}`);
      console.log(`      Tools: ${server.tools_count}`);
      console.log(`      Repository: ${server.repo_full_name}`);
    });

    // Execute batch insertion
    const insertedServers = await batchInsertServers(newServers, originalScoring);

    // Validate results
    await validateBatchResults();

    console.log('\n🎉 Batch insertion completed successfully!');

  } catch (error) {
    console.error('\n❌ Process failed:', error.message);
    process.exit(1);
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}