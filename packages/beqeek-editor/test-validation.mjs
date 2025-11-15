#!/usr/bin/env node

/**
 * Phase 03 Validation Script
 * Verifies all 14 Yoopta plugins are correctly configured
 */

import {
  getTypographyPlugins,
  getListPlugins,
  getStructuralPlugins,
  getMediaPlugins,
  getCodePlugin,
  getDefaultPlugins,
} from './dist/plugins/index.js';

console.log('🔍 Phase 03 Validation - Plugin Count Test\n');

// Test individual plugin factories
const typography = getTypographyPlugins();
const lists = getListPlugins();
const structural = getStructuralPlugins();
const media = getMediaPlugins();
const code = getCodePlugin();
const all = getDefaultPlugins();

console.log('📊 Plugin Factory Results:');
console.log(`  Typography plugins: ${typography.length} (expected: 6)`);
console.log(`  List plugins: ${lists.length} (expected: 3)`);
console.log(`  Structural plugins: ${structural.length} (expected: 4)`);
console.log(`  Code plugin: ${code ? 1 : 0} (expected: 1)`);
console.log(`  Media plugins: ${media.length} (expected: 4)`);
console.log(`  Total (getDefaultPlugins): ${all.length} (expected: 18)\n`);

// Validation
const checks = [
  { name: 'Typography plugins', actual: typography.length, expected: 6 },
  { name: 'List plugins', actual: lists.length, expected: 3 },
  { name: 'Structural plugins', actual: structural.length, expected: 4 },
  { name: 'Code plugin', actual: code ? 1 : 0, expected: 1 },
  { name: 'Media plugins', actual: media.length, expected: 4 },
  { name: 'Total plugins', actual: all.length, expected: 18 },
];

let passed = 0;
let failed = 0;

console.log('✅ Validation Results:');
checks.forEach(({ name, actual, expected }) => {
  const status = actual === expected ? '✅ PASS' : '❌ FAIL';
  console.log(`  ${status} - ${name}: ${actual}/${expected}`);

  if (actual === expected) {
    passed++;
  } else {
    failed++;
  }
});

console.log(`\n📈 Summary: ${passed}/${checks.length} checks passed\n`);

// Check plugin types
console.log('🔧 Plugin Type Verification:');
all.slice(0, 5).forEach((plugin, idx) => {
  console.log(`  [${idx + 1}] ${plugin.type || 'Unknown type'}`);
});
console.log(`  ... (${all.length - 5} more)\n`);

if (failed === 0) {
  console.log('🎉 Phase 03 Validation: ALL CHECKS PASSED\n');
  process.exit(0);
} else {
  console.log('❌ Phase 03 Validation: SOME CHECKS FAILED\n');
  process.exit(1);
}
