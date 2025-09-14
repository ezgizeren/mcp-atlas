import fs from 'fs';

const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));

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
    console.warn(`Could not parse: ${strValue.substring(0, 100)}...`);
    return null;
  }
}

// Test all JSON fields
const jsonFields = [
  'mcp_server_secondary_categories_json',
  'mcp_server_type_json',
  'mcp_features_json',
  'mcp_requirements_json',
  'tools_definitions_json',
  'repo_topics_json',
  'mcp_env_vars_info_json',
  'mcp_general_notes_json',
  'dev_debug_methods_json',
  'dev_support_channels_json',
  'security_compliance_json',
  'security_auth_methods_json',
  'security_data_privacy_json',
  'security_best_practices_json',
  'examples_use_cases_json',
  'examples_workflows_json',
  'examples_recipes_json',
  'examples_playground_snippets_json',
  'meta_miscellaneous_details_json',
  'scoring'
];

console.log('Testing JSON field parsing:');
jsonFields.forEach(field => {
  const value = data[field];
  const parsed = parseSpecialJsonFormat(value);

  console.log(`\n${field}:`);
  console.log(`  Raw: ${typeof value} - ${value ? String(value).substring(0, 50) : 'null'}...`);
  console.log(`  Parsed: ${typeof parsed} - ${Array.isArray(parsed) ? `Array(${parsed.length})` : parsed ? 'Object' : 'null'}`);

  if (parsed !== null) {
    try {
      JSON.stringify(parsed);
      console.log(`  ✅ Valid JSON`);
    } catch (e) {
      console.log(`  ❌ Invalid JSON: ${e.message}`);
    }
  }
});