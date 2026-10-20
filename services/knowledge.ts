import AsyncStorage from '@react-native-async-storage/async-storage';

export const itemTypes = ['idea', 'note', 'source', 'skill', 'concept', 'question'] as const;
export const itemStatuses = ['draft', 'active', 'verified', 'archived'] as const;
export const epistemicTypes = ['documented_fact', 'interpretation', 'hypothesis', 'open_question'] as const;
export const verificationStatuses = ['unverified', 'reviewing', 'verified'] as const;
export const origins = ['manual', 'imported', 'AI_generated'] as const;
export const relationTypes = ['related_to', 'derived_from', 'supports', 'contradicts', 'part_of', 'requires', 'inspired_by'] as const;
export const projectStatuses = ['planned', 'active', 'paused', 'completed'] as const;
export type ItemType = typeof itemTypes[number];
export interface KnowledgeItem {
  id: string; title: string; type: ItemType; content: string;
  status: typeof itemStatuses[number]; epistemic_type: typeof epistemicTypes[number];
  confidence: number | null; verification_status: typeof verificationStatuses[number];
  origin: typeof origins[number]; created_at: string; updated_at: string;
}
export interface Relationship { id: string; source_item_id: string; target_item_id: string; relation_type: typeof relationTypes[number]; note: string; created_at: string }
export interface Tag { id: string; name: string; color: string }
export interface Project { id: string; title: string; description: string; status: typeof projectStatuses[number]; next_action: string; target_date: string; created_at: string; updated_at: string }
export interface ItemTag { item_id: string; tag_id: string }
export interface ItemProject { item_id: string; project_id: string }
export interface KnowledgeData { version: 1; items: KnowledgeItem[]; relationships: Relationship[]; tags: Tag[]; projects: Project[]; itemTags: ItemTag[]; itemProjects: ItemProject[]; sampleIds: string[] }
export type ItemInput = Omit<KnowledgeItem, 'id' | 'created_at' | 'updated_at'>;
export type ProjectInput = Omit<Project, 'id' | 'created_at' | 'updated_at'>;
const storageKey = 'adan-knowledge-universe-v1';
export function emptyData(): KnowledgeData { return { version: 1, items: [], relationships: [], tags: [], projects: [], itemTags: [], itemProjects: [], sampleIds: [] }; }
export function newId(): string { return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}-${Math.random().toString(36).slice(2, 8)}`; }
export function label(value: string): string { return value.replace(/_/g, ' '); }
export function isRtl(value: string): boolean { return /^[^A-Za-z\u0600-\u06FF]*[\u0600-\u06FF]/.test(value); }
function fail(message: string): never { throw new Error(message); }
function text(value: unknown, name: string, required = false): asserts value is string {
  if (typeof value !== 'string' || (required && !value.trim())) fail(`${name} must be ${required ? 'non-empty ' : ''}text.`);
}
function validDate(value: unknown, name: string) { text(value, name, true); if (!Number.isFinite(Date.parse(value))) fail(`${name} is not a valid date.`); }
function enumValue(value: unknown, allowed: readonly string[], name: string) { if (typeof value !== 'string' || !allowed.includes(value)) fail(`Invalid ${name}.`); }
export function validateData(input: unknown): KnowledgeData {
  if (!input || typeof input !== 'object' || Array.isArray(input)) fail('Backup must be a JSON object.');
  const d = input as KnowledgeData;
  if (d.version !== 1) fail('Unsupported backup version. Expected version 1.');
  for (const name of ['items', 'relationships', 'tags', 'projects', 'itemTags', 'itemProjects'] as const) {
    if (!Array.isArray(d[name])) fail(`Backup is missing the ${name} array.`);
    if (d[name].length > 50000) fail(`${name} exceeds the 50,000-record safety limit.`);
    if (d[name].some(x => !x || typeof x !== 'object' || Array.isArray(x))) fail(`Invalid record in ${name}.`);
  }
  const ids = (records: { id: string }[], name: string) => {
    const set = new Set<string>();
    records.forEach(r => { text(r.id, `${name} ID`, true); if (set.has(r.id)) fail(`Duplicate ID in ${name}: ${r.id}`); set.add(r.id); });
    return set;
  };
  const itemIds = ids(d.items, 'items'); const tagIds = ids(d.tags, 'tags'); const projectIds = ids(d.projects, 'projects'); ids(d.relationships, 'relationships');
  d.items.forEach(i => {
    text(i.title, 'Item title', true); text(i.content, 'Item content'); enumValue(i.type, itemTypes, 'item type'); enumValue(i.status, itemStatuses, 'item status');
    enumValue(i.epistemic_type, epistemicTypes, 'epistemic type'); enumValue(i.verification_status, verificationStatuses, 'verification status'); enumValue(i.origin, origins, 'origin');
    if (i.confidence !== null && (typeof i.confidence !== 'number' || !Number.isFinite(i.confidence) || i.confidence < 0 || i.confidence > 100)) fail('Confidence must be null or a number from 0 to 100.');
    validDate(i.created_at, 'Item creation date'); validDate(i.updated_at, 'Item update date');
  });
  const edgeKeys = new Set<string>();
  d.relationships.forEach(r => {
    if (!itemIds.has(r.source_item_id) || !itemIds.has(r.target_item_id)) fail('A relationship references a missing item.');
    if (r.source_item_id === r.target_item_id) fail('Self-links are not allowed.');
    enumValue(r.relation_type, relationTypes, 'relationship type'); text(r.note, 'Relationship note'); validDate(r.created_at, 'Relationship date');
    const key = `${r.source_item_id}|${r.target_item_id}|${r.relation_type}`;
    if (edgeKeys.has(key)) fail('Duplicate relationship.'); edgeKeys.add(key);
  });
  d.tags.forEach(t => { text(t.name, 'Tag name', true); text(t.color, 'Tag color', true); if (!/^#[0-9a-fA-F]{6}$/.test(t.color)) fail('Tag colors must use six-digit hex values.'); });
  d.projects.forEach(p => {
    text(p.title, 'Project title', true); text(p.description, 'Project description'); text(p.next_action, 'Next action'); text(p.target_date, 'Target date');
    enumValue(p.status, projectStatuses, 'project status'); validDate(p.created_at, 'Project creation date'); validDate(p.updated_at, 'Project update date');
    if (p.target_date && (!/^\d{4}-\d{2}-\d{2}$/.test(p.target_date) || !Number.isFinite(Date.parse(p.target_date)) || new Date(p.target_date).toISOString().slice(0,10) !== p.target_date)) fail('Target date must be a valid YYYY-MM-DD date.');
  });
  const joins = (rows: (ItemTag | ItemProject)[], kind: 'tag' | 'project') => {
    const seen = new Set<string>();
    rows.forEach(row => {
      const other = kind === 'tag' ? (row as ItemTag).tag_id : (row as ItemProject).project_id;
      if (!itemIds.has(row.item_id) || !(kind === 'tag' ? tagIds : projectIds).has(other)) fail(`An item-${kind} link references a missing record.`);
      const key = `${row.item_id}|${other}`; if (seen.has(key)) fail(`Duplicate item-${kind} link.`); seen.add(key);
    });
  };
  joins(d.itemTags, 'tag'); joins(d.itemProjects, 'project');
  const sampleIds = d.sampleIds ?? [];
  if (!Array.isArray(sampleIds) || sampleIds.some(id => typeof id !== 'string')) fail('Invalid sample ID metadata.');
  return { version: 1, items: d.items, relationships: d.relationships, tags: d.tags, projects: d.projects, itemTags: d.itemTags, itemProjects: d.itemProjects, sampleIds };
}
export async function loadData(): Promise<KnowledgeData> { const value = await AsyncStorage.getItem(storageKey); return value === null ? emptyData() : validateData(JSON.parse(value)); }
export async function persistData(data: KnowledgeData): Promise<void> { validateData(data); await AsyncStorage.setItem(storageKey, JSON.stringify(data)); }
export function serializeData(data: KnowledgeData): string { return JSON.stringify(validateData(data), null, 2); }
export function parseBackup(value: string): KnowledgeData { if (value.length > 20000000) fail('Backup exceeds the 20 MB safety limit.'); try { return validateData(JSON.parse(value)); } catch (e) { if (e instanceof SyntaxError) fail('Invalid JSON. Paste the complete ADAN OS backup.'); throw e; } }
export function mergeData(current: KnowledgeData, incoming: KnowledgeData): { data: KnowledgeData; added: number; duplicates: number } {
  let added = 0; let duplicates = 0;
  function merge<T extends { id: string }>(a: T[], b: T[]): T[] { const seen = new Set(a.map(x => x.id)); const extra = b.filter(x => { if (seen.has(x.id)) { duplicates++; return false; } seen.add(x.id); added++; return true; }); return [...a, ...extra]; }
  function mergeJoin<T>(a: T[], b: T[], key: (r: T) => string): T[] { const seen = new Set(a.map(key)); return [...a, ...b.filter(x => { const k = key(x); if (seen.has(k)) return false; seen.add(k); return true; })]; }
  const data = validateData({ version: 1, items: merge(current.items, incoming.items), tags: merge(current.tags, incoming.tags), projects: merge(current.projects, incoming.projects), relationships: merge(current.relationships, incoming.relationships), itemTags: mergeJoin(current.itemTags, incoming.itemTags, r => `${r.item_id}|${r.tag_id}`), itemProjects: mergeJoin(current.itemProjects, incoming.itemProjects, r => `${r.item_id}|${r.project_id}`), sampleIds: [...new Set([...current.sampleIds, ...incoming.sampleIds])] });
  return { data, added, duplicates };
}
export function sampleData(): KnowledgeData {
  const d = emptyData(); const now = new Date().toISOString();
  const titles = ['Experimental Music', 'Urban Photography', 'ADAN OS', 'Shahnameh Research', 'Creative Direction'];
  const kinds: ItemType[] = ['idea', 'skill', 'concept', 'source', 'note'];
  const contents = ['Explore how field recordings and granular synthesis can become a musical sketch. This is an unverified sample idea.', 'Practice framing city life through light, texture, and negative space. This is a sample skill note.', 'A personal operating system for capturing and connecting knowledge. Demonstration concept, not a verified specification.', 'Sample reading plan: compare translations and record citations before drawing conclusions. This is not an actual research citation.', 'Bring sound, image, and narrative into one coherent creative brief. Demonstration note only.'];
  d.items = titles.map((title, i) => ({ id: newId(), title, content: contents[i], type: kinds[i], status: 'draft', epistemic_type: 'interpretation', confidence: null, verification_status: 'unverified', origin: 'manual', created_at: now, updated_at: now }));
  d.tags = [{ id: newId(), name: 'Sample · creativity', color: '#A78BFA' }, { id: newId(), name: 'Sample · research', color: '#B9FF67' }];
  d.projects = [{ id: newId(), title: 'Sample · Creative Atlas', description: 'An explicitly labeled demonstration project. Remove all sample data in Settings.', status: 'active', next_action: 'Write a one-page creative brief', target_date: '', created_at: now, updated_at: now }];
  d.itemTags = d.items.map((item, i) => ({ item_id: item.id, tag_id: d.tags[i === 3 ? 1 : 0].id }));
  d.itemProjects = d.items.filter((_, i) => i !== 3).map(item => ({ item_id: item.id, project_id: d.projects[0].id }));
  d.relationships = [{ id: newId(), source_item_id: d.items[4].id, target_item_id: d.items[0].id, relation_type: 'inspired_by', note: 'Explicit demonstration link.', created_at: now }, { id: newId(), source_item_id: d.items[1].id, target_item_id: d.items[4].id, relation_type: 'supports', note: 'Explicit demonstration link.', created_at: now }, { id: newId(), source_item_id: d.items[0].id, target_item_id: d.items[2].id, relation_type: 'part_of', note: 'Explicit demonstration link.', created_at: now }];
  d.sampleIds = [...d.items, ...d.projects, ...d.tags, ...d.relationships].map(x => x.id); return d;
}
export function removeSamples(d: KnowledgeData): KnowledgeData {
  const sample = new Set(d.sampleIds); const items = d.items.filter(x => !sample.has(x.id)); const projects = d.projects.filter(x => !sample.has(x.id)); const tags = d.tags.filter(x => !sample.has(x.id));
  const itemIds = new Set(items.map(x => x.id)); const projectIds = new Set(projects.map(x => x.id)); const tagIds = new Set(tags.map(x => x.id));
  return { ...d, items, projects, tags, relationships: d.relationships.filter(x => !sample.has(x.id) && itemIds.has(x.source_item_id) && itemIds.has(x.target_item_id)), itemTags: d.itemTags.filter(x => itemIds.has(x.item_id) && tagIds.has(x.tag_id)), itemProjects: d.itemProjects.filter(x => itemIds.has(x.item_id) && projectIds.has(x.project_id)), sampleIds: [] };
}
