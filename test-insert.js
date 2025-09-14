#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Read the mapped data
const mappedDataPath = path.join(process.cwd(), 'mapped-data.json');
const mappedData = JSON.parse(fs.readFileSync(mappedDataPath, 'utf8'));

// Create a smaller test insert with just the essential fields
const essentialFields = {
  mcp_name: mappedData.mcp_name,
  mcp_description: mappedData.mcp_description,
  provider_name: mappedData.provider_name,
  provider_is_official: mappedData.provider_is_official,
  server_type: mappedData.server_type,
  hosting_type: mappedData.hosting_type,
  tools_count: mappedData.tools_count,
  tools_definitions_json: mappedData.tools_definitions_json,
  repo_full_name: mappedData.repo_full_name,
  repo_stargazers_count: mappedData.repo_stargazers_count,
  metadata_is_active: mappedData.metadata_is_active
};

// Generate INSERT SQL with proper JSON formatting
const columns = Object.keys(essentialFields);
const values = columns.map(col => {
  const value = essentialFields[col];
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'boolean') return value.toString();
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'object') {
    return `'${JSON.stringify(value)}'::jsonb`;
  }
  return `'${value.replace(/'/g, "''")}'`;
});

const sql = `INSERT INTO servers (${columns.join(', ')}) VALUES (${values.join(', ')}) RETURNING id, mcp_name;`;

console.log('Generated test SQL:');
console.log(sql);

// Write to file
fs.writeFileSync('test-insert.sql', sql);
console.log('Test SQL written to test-insert.sql');