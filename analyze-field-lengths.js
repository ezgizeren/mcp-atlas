#!/usr/bin/env node

import fs from 'fs';

// Check which fields in new-import.json have extremely long values
const data = JSON.parse(fs.readFileSync('new-import.json', 'utf8'));

console.log('🔍 Analyzing field lengths across all 1000 records...\n');

const fieldLengthStats = {};

// Analyze each record
data.forEach((record, i) => {
  Object.keys(record).forEach(field => {
    if (!fieldLengthStats[field]) {
      fieldLengthStats[field] = { max: 0, maxIndex: -1, maxValue: '', samples: [] };
    }

    const value = String(record[field] || '');
    if (value.length > fieldLengthStats[field].max) {
      fieldLengthStats[field].max = value.length;
      fieldLengthStats[field].maxIndex = i;
      fieldLengthStats[field].maxValue = value.substring(0, 200) + (value.length > 200 ? '...' : '');
    }

    // Collect samples of long values
    if (value.length > 100) {
      fieldLengthStats[field].samples.push({
        recordIndex: i,
        serverName: record.mcp_name,
        length: value.length,
        value: value.substring(0, 100) + '...'
      });
    }
  });
});

// Show fields with values over 100 characters
console.log('⚠️  Fields with values over 100 characters:');
const problematicFields = Object.entries(fieldLengthStats)
  .filter(([field, stats]) => stats.max > 100)
  .sort((a, b) => b[1].max - a[1].max);

if (problematicFields.length === 0) {
  console.log('   None found! All field values are under 100 characters.');
} else {
  problematicFields.forEach(([field, stats]) => {
    console.log(`\n📏 ${field}: MAX ${stats.max} chars`);
    console.log(`   Worst case record: ${data[stats.maxIndex].mcp_name}`);
    console.log(`   Sample count over 100 chars: ${stats.samples.length}`);

    if (stats.samples.length > 0) {
      console.log(`   Top 3 longest samples:`);
      stats.samples
        .sort((a, b) => b.length - a.length)
        .slice(0, 3)
        .forEach((sample, i) => {
          console.log(`     ${i+1}. [${sample.length}] ${sample.serverName}: ${sample.value}`);
        });
    }
  });
}

console.log('\n✅ Field length analysis complete');