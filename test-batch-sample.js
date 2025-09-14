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

// Test with first 3 servers only
async function testSampleInsertion() {
  try {
    console.log('🧪 Testing sample insertion with first 3 servers...\n');

    // Load just first 3 servers
    const newImportPath = path.join(__dirname, 'new-import.json');
    const allServers = JSON.parse(fs.readFileSync(newImportPath, 'utf8'));
    const testServers = allServers.slice(0, 3);

    // Load original scoring data
    const originalData = JSON.parse(fs.readFileSync('data.json', 'utf8'));
    const originalScoring = originalData.scoring;

    console.log('📋 Test servers:');
    testServers.forEach((server, i) => {
      console.log(`   ${i + 1}. ${server.mcp_name}`);
      console.log(`      ID: ${server.id}`);
      console.log(`      Tools: ${server.tools_count}`);
      console.log(`      Server Types: ${server.mcp_server_type_json}`);
    });

    // Test JSON parsing for each server
    console.log('\n🔍 Testing JSON parsing...');
    testServers.forEach((server, i) => {
      console.log(`\nServer ${i + 1}: ${server.mcp_name}`);

      // Test server type parsing
      try {
        const serverTypes = parseSpecialJsonFormat(server.mcp_server_type_json);
        console.log(`   Server Types: ${JSON.stringify(serverTypes)}`);

        const hostingType = serverTypes?.includes('REMOTE_HTTP_SSE') || serverTypes?.includes('REMOTE_HTTP_STREAMABLE') ? 'OMNI_HOSTED' : 'EXTERNAL';
        console.log(`   Hosting Type: ${hostingType}`);
      } catch (e) {
        console.error(`   ❌ Server type parsing failed: ${e.message}`);
      }

      // Test features parsing
      try {
        const features = parseSpecialJsonFormat(server.mcp_features_json);
        console.log(`   Features: ${features ? features.length : 'null'} items`);
      } catch (e) {
        console.error(`   ❌ Features parsing failed: ${e.message}`);
      }
    });

    console.log('\n✅ Sample parsing test completed successfully!');
    console.log('Ready to proceed with full batch insertion.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    throw error;
  }
}

// JSON parser function (copied from main script)
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

testSampleInsertion();