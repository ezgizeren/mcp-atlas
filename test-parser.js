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
    return null;
  }
}

const features = parseSpecialJsonFormat(data.mcp_features_json);
const requirements = parseSpecialJsonFormat(data.mcp_requirements_json);
const serverType = parseSpecialJsonFormat(data.mcp_server_type_json);

console.log('Server Type (' + (serverType ? serverType.length : 0) + '):');
if (serverType) serverType.forEach((s, i) => console.log('  ' + (i+1) + '. ' + s));

console.log('\nFeatures (' + (features ? features.length : 0) + '):');
if (features) features.forEach((f, i) => console.log('  ' + (i+1) + '. ' + f.substring(0, 80) + '...'));

console.log('\nRequirements (' + (requirements ? requirements.length : 0) + '):');
if (requirements) requirements.forEach((r, i) => console.log('  ' + (i+1) + '. ' + r));