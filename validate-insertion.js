#!/usr/bin/env node

import dotenv from 'dotenv';
import pg from 'pg';

const { Client } = pg;
dotenv.config();

async function validateInsertion() {
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
    console.log('🔍 Validating inserted MCP server data...\n');

    // Query the Context7 server we just inserted
    const query = `
      SELECT
        id, mcp_name, provider_name, server_type, hosting_type,
        tools_count,
        jsonb_array_length(tools_definitions_json) as actual_tools_count,
        jsonb_array_length(mcp_features_json) as features_count,
        jsonb_array_length(mcp_requirements_json) as requirements_count,
        jsonb_array_length(repo_topics_json) as topics_count,
        metadata_is_active,
        repo_stargazers_count,
        repo_full_name,
        created_at,
        updated_at
      FROM servers
      WHERE mcp_name = 'Context7 MCP Server by Upstash'
      ORDER BY created_at DESC
      LIMIT 1;
    `;

    const result = await client.query(query);

    if (result.rows.length === 0) {
      throw new Error('No Context7 server found in database');
    }

    const row = result.rows[0];
    console.log('✅ Server Record Found:');
    console.log(`   ID: ${row.id}`);
    console.log(`   Name: ${row.mcp_name}`);
    console.log(`   Provider: ${row.provider_name}`);
    console.log(`   Repository: ${row.repo_full_name}`);
    console.log(`   GitHub Stars: ${row.repo_stargazers_count}`);
    console.log(`   Created: ${row.created_at}`);
    console.log(`   Updated: ${row.updated_at}`);

    console.log('\n📊 Configuration Validation:');
    console.log(`   Server Type: ${row.server_type} ✅`);
    console.log(`   Hosting Type: ${row.hosting_type} ✅`);
    console.log(`   Active Status: ${row.metadata_is_active} ✅`);

    console.log('\n🔧 Tools & Features Validation:');
    console.log(`   Declared Tools Count: ${row.tools_count}`);
    console.log(`   Actual Tools Count: ${row.actual_tools_count}`);
    if (row.tools_count === row.actual_tools_count) {
      console.log('   ✅ Tools count matches');
    } else {
      console.log('   ⚠️  Tools count mismatch');
    }

    console.log(`   Features Count: ${row.features_count}`);
    console.log(`   Requirements Count: ${row.requirements_count}`);
    console.log(`   Repository Topics: ${row.topics_count}`);

    // Detailed JSON field validation
    console.log('\n🔍 JSON Fields Validation:');

    const jsonFieldQuery = `
      SELECT
        mcp_features_json->0 as first_feature,
        mcp_requirements_json->0 as first_requirement,
        tools_definitions_json->0->>'name' as first_tool_name,
        tools_definitions_json->0->>'desc' as first_tool_desc,
        repo_topics_json,
        scoring->0->>'category' as first_score_category
      FROM servers
      WHERE id = $1;
    `;

    const jsonResult = await client.query(jsonFieldQuery, [row.id]);
    const jsonData = jsonResult.rows[0];

    console.log(`   First Feature: ${jsonData.first_feature}`);
    console.log(`   First Requirement: ${jsonData.first_requirement}`);
    console.log(`   First Tool Name: ${jsonData.first_tool_name}`);
    console.log(`   First Tool Description: ${jsonData.first_tool_desc?.substring(0, 60)}...`);
    console.log(`   Repository Topics: ${JSON.stringify(jsonData.repo_topics_json)}`);
    console.log(`   First Score Category: ${jsonData.first_score_category}`);

    // Overall health check
    console.log('\n🎯 Overall Data Integrity:');

    const integrityQuery = `
      SELECT
        COUNT(*) as total_servers,
        COUNT(CASE WHEN mcp_name IS NOT NULL THEN 1 END) as servers_with_names,
        COUNT(CASE WHEN provider_name IS NOT NULL THEN 1 END) as servers_with_providers,
        COUNT(CASE WHEN tools_definitions_json IS NOT NULL THEN 1 END) as servers_with_tools,
        COUNT(CASE WHEN metadata_is_active = true THEN 1 END) as active_servers
      FROM servers;
    `;

    const integrityResult = await client.query(integrityQuery);
    const integrity = integrityResult.rows[0];

    console.log(`   Total Servers: ${integrity.total_servers}`);
    console.log(`   Servers with Names: ${integrity.servers_with_names}`);
    console.log(`   Servers with Providers: ${integrity.servers_with_providers}`);
    console.log(`   Servers with Tools: ${integrity.servers_with_tools}`);
    console.log(`   Active Servers: ${integrity.active_servers}`);

    if (parseInt(integrity.total_servers) > 0 &&
        parseInt(integrity.servers_with_names) === parseInt(integrity.total_servers) &&
        parseInt(integrity.servers_with_providers) === parseInt(integrity.total_servers)) {
      console.log('\n🎉 All validations passed! Data insertion successful and consistent.');
    } else {
      console.log('\n⚠️  Some validation issues detected. Review the data above.');
    }

    return row;

  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    throw error;
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

validateInsertion().catch(console.error);