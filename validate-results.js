#!/usr/bin/env node

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

async function validateResults() {
  const client = new Client({
    host: 'aws-1-us-east-2.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.nqscestrzthcjuavldys',
    password: 'Hacklava123?',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('🔍 Validating insertion results...\n');

    // Get total count
    const countResult = await client.query('SELECT COUNT(*) FROM servers');
    console.log(`📊 Total servers in database: ${countResult.rows[0].count}`);

    // Get summary statistics
    const statsResult = await client.query(`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN metadata_is_active = true THEN 1 END) as active,
        AVG(tools_count)::numeric(10,2) as avg_tools,
        COUNT(DISTINCT provider_name) as unique_providers,
        COUNT(DISTINCT server_type) as unique_server_types
      FROM servers
    `);

    const stats = statsResult.rows[0];
    console.log(`   Active servers: ${stats.active}`);
    console.log(`   Average tools per server: ${stats.avg_tools}`);
    console.log(`   Unique providers: ${stats.unique_providers}`);
    console.log(`   Unique server types: ${stats.unique_server_types}`);

    // Check server types distribution
    console.log('\n📈 Server type distribution:');
    const serverTypesResult = await client.query(`
      SELECT server_type, COUNT(*) as count
      FROM servers
      GROUP BY server_type
      ORDER BY count DESC
    `);

    serverTypesResult.rows.forEach(row => {
      console.log(`   ${row.server_type}: ${row.count}`);
    });

    // Check hosting types distribution
    console.log('\n🏠 Hosting type distribution:');
    const hostingTypesResult = await client.query(`
      SELECT hosting_type, COUNT(*) as count
      FROM servers
      GROUP BY hosting_type
      ORDER BY count DESC
    `);

    hostingTypesResult.rows.forEach(row => {
      console.log(`   ${row.hosting_type}: ${row.count}`);
    });

    // Check name lengths to identify constraint issue
    console.log('\n📏 Name length analysis:');
    const nameLengthResult = await client.query(`
      SELECT
        MIN(LENGTH(mcp_name)) as min_length,
        MAX(LENGTH(mcp_name)) as max_length,
        AVG(LENGTH(mcp_name))::numeric(5,1) as avg_length,
        COUNT(CASE WHEN LENGTH(mcp_name) > 100 THEN 1 END) as over_100_chars
      FROM servers
    `);

    const nameStats = nameLengthResult.rows[0];
    console.log(`   Min name length: ${nameStats.min_length}`);
    console.log(`   Max name length: ${nameStats.max_length}`);
    console.log(`   Avg name length: ${nameStats.avg_length}`);
    console.log(`   Names over 100 chars: ${nameStats.over_100_chars}`);

    // Show recent successful insertions
    console.log('\n✅ Recent successful insertions:');
    const recentResult = await client.query(`
      SELECT mcp_name, provider_name, tools_count, LENGTH(mcp_name) as name_len
      FROM servers
      WHERE mcp_name != 'Context7 MCP Server by Upstash'
      ORDER BY id DESC
      LIMIT 5
    `);

    recentResult.rows.forEach((row, i) => {
      console.log(`   ${i+1}. ${row.mcp_name} (${row.name_len} chars)`);
      console.log(`      Provider: ${row.provider_name}, Tools: ${row.tools_count}`);
    });

    await client.end();
    console.log('\n✅ Validation completed');

  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    await client.end();
  }
}

validateResults();