import { emptyData, validateData, parseBackup, serializeData, mergeData, sampleData, removeSamples, KnowledgeData } from './knowledge';
export function runIntegrityChecks(current: KnowledgeData): string {
  let passed = 0;
  function assert(ok: boolean, name: string) { if (!ok) throw new Error(`Integrity check failed: ${name}`); passed++; }
  function rejects(action: () => unknown, name: string) { let rejected = false; try { action(); } catch { rejected = true; } assert(rejected, name); }
  const roundtrip = parseBackup(serializeData(current));
  assert(serializeData(roundtrip) === serializeData(current), 'Current backup roundtrip preserves records and IDs');
  const samples = sampleData(); const restored = parseBackup(serializeData(samples));
  assert(restored.relationships.every(r => restored.items.some(i => i.id === r.source_item_id) && restored.items.some(i => i.id === r.target_item_id)), 'Restored relationship references');
  assert(mergeData(samples, samples).duplicates === samples.items.length + samples.projects.length + samples.tags.length + samples.relationships.length, 'Duplicate IDs are skipped during merge');
  rejects(() => validateData({ ...samples, items: [...samples.items, samples.items[0]] }), 'Duplicate backup IDs rejected');
  rejects(() => validateData({ ...samples, relationships: [{ ...samples.relationships[0], target_item_id: samples.relationships[0].source_item_id }] }), 'Self-links rejected');
  rejects(() => validateData({ ...samples, relationships: [{ ...samples.relationships[0], target_item_id: 'missing' }] }), 'Missing references rejected');
  rejects(() => validateData({ ...samples, items: [{ ...samples.items[0], confidence: 101 }, ...samples.items.slice(1)] }), 'Invalid confidence rejected');
  rejects(() => parseBackup('{bad json'), 'Malformed JSON rejected');
  const removed = removeSamples(samples); assert(removed.items.length === 0 && removed.relationships.length === 0 && removed.itemProjects.length === 0, 'Sample cleanup removes dangling links');
  assert(validateData(emptyData()).items.length === 0, 'Empty dataset supported');
  return `${passed} data-integrity checks passed. Current backup roundtrip, IDs, references, duplicates, self-links, confidence, JSON, and sample cleanup were checked in memory. No data was written. This does not test UI, refresh persistence, cloud security, or native sharing.`;
}
