#!/usr/bin/env node

import fs from 'fs';
import dotenv from 'dotenv';
import pg from 'pg';

const { Client } = pg;
dotenv.config();

// Simple test with minimal fields
async function testMinimalInsert() {
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
    await client.connect();
    console.log('✅ Connected to database');

    // Test with minimal required fields only
    const insertQuery = `
      INSERT INTO servers (mcp_name, provider_name, server_type, hosting_type, tools_definitions_json)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, mcp_name;
    `;

    const values = [
      'Test Context7 MCP Server',
      'Upstash, Inc.',
      'LOCAL_STDIO',
      'EXTERNAL',
      JSON.stringify([{"name": "test-tool", "desc": "test"}])
    ];

    console.log('Values to insert:', values.map((v, i) => `${i+1}: ${typeof v} - ${String(v).substring(0, 50)}...`));

    const result = await client.query(insertQuery, values);
    console.log('✅ Insert successful!', result.rows[0]);

    // Clean up test record
    await client.query('DELETE FROM servers WHERE id = $1', [result.rows[0].id]);
    console.log('✅ Test record cleaned up');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Error details:', error);
  } finally {
    await client.end();
  }
}

testMinimalInsert();