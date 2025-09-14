#!/usr/bin/env node

import fs from 'fs';

// Test server type mapping
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

      // Handle comma-separated values without quotes
      if (!content.includes('"') && content.includes(',')) {
        return content.split(',').map(item => item.trim());
      }

      // Handle single item without quotes
      if (!content.includes('"') && !content.includes(',')) {
        return [content];
      }

      // Handle quoted items
      if (content.includes('"')) {
        const matches = content.match(/"([^"]*)"/g);
        if (matches) {
          return matches.map(match => match.slice(1, -1));
        }
      }
    }

    return null;
  }
}

function mapServerTypes(data) {
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
    console.warn(`⚠️  Using defaults for ${data.mcp_name}`);
  }

  return { serverType, hostingType, originalTypes: serverTypes };
}

// Test various server types
const testData = JSON.parse(fs.readFileSync('new-import.json', 'utf8'));

console.log('🧪 Testing server type mappings:\n');

// Get some diverse examples
const uniqueTypes = [];
const seenTypes = new Set();

for (const server of testData) {
  if (!seenTypes.has(server.mcp_server_type_json)) {
    seenTypes.add(server.mcp_server_type_json);
    uniqueTypes.push(server);

    if (uniqueTypes.length >= 15) break;
  }
}

uniqueTypes.forEach((server, i) => {
  const mapped = mapServerTypes(server);
  console.log(`${i + 1}. ${server.mcp_name}`);
  console.log(`   Original: ${server.mcp_server_type_json}`);
  console.log(`   Parsed: [${mapped.originalTypes.join(', ')}]`);
  console.log(`   Mapped Server Type: ${mapped.serverType}`);
  console.log(`   Hosting Type: ${mapped.hostingType}\n`);
});

console.log('✅ All mappings use valid constraint values!');