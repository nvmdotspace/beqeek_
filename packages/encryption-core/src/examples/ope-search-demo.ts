import { EncryptedSearch } from '../index.js';
import type { FieldEncryptionConfig } from '../field-types';

async function main() {
  const searchEngine = new EncryptedSearch();

  // 32-byte hex key for hashing OPE tokens
  const encryptionKey = '0123456789abcdef0123456789abcdef';

  const field: string = 'age';
  const recordId: string = 'rec_demo_1';
  const value: number = 42;

  const config: FieldEncryptionConfig = {
    enabled: true,
    searchable: true,
    type: 'OPE',
    label: 'Age',
    options: {}
  } as any;

  // Add record to index
  await searchEngine.addToIndex(recordId, field, value, config, encryptionKey);

  // Prepare search configs
  const fieldConfigs = new Map<string, FieldEncryptionConfig>([[field, config]]);
  const encryptionKeys = new Map<string, string>([[field, encryptionKey]]);

  // Execute search
  const results = await searchEngine.search('42', fieldConfigs, encryptionKeys, {
    fuzzy: false,
    caseSensitive: false,
    includePartial: false
  });

  console.log('Search results count:', results.length);
  if (results.length > 0) {
    console.log('Top result:', results[0]);
  } else {
    console.error('No results found. OPE token hashing or indexing may be incorrect.');
    throw new Error('OPE search demo failed: no results');
  }
}

main().catch((err) => {
  console.error('Demo error:', err);
});