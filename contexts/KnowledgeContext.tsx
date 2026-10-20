import React, { createContext, useCallback, useEffect, useRef, useState } from 'react';
import { emptyData, loadData, persistData, newId, validateData, mergeData, sampleData, removeSamples, KnowledgeData, ItemInput, ProjectInput, Relationship } from '@/services/knowledge';
import { theme } from '@/constants/theme';
interface KnowledgeContextValue {
  data: KnowledgeData; loading: boolean; busy: boolean; loadError: string; reload: () => Promise<void>;
  saveItem: (input: ItemInput, id?: string, tags?: string[], projects?: string[]) => Promise<string>;
  deleteItem: (id: string) => Promise<void>;
  saveProject: (input: ProjectInput, id?: string) => Promise<string>;
  deleteProject: (id: string) => Promise<void>;
  linkProject: (itemId: string, projectId: string, linked: boolean) => Promise<void>;
  addRelationship: (input: Pick<Relationship, 'source_item_id' | 'target_item_id' | 'relation_type' | 'note'>) => Promise<void>;
  removeRelationship: (id: string) => Promise<void>;
  removeTag: (id: string) => Promise<void>;
  importData: (incoming: KnowledgeData, replace: boolean) => Promise<string>;
  addSamples: () => Promise<void>; clearSamples: () => Promise<void>;
}
export const KnowledgeContext = createContext<KnowledgeContextValue | undefined>(undefined);
export function KnowledgeProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<KnowledgeData>(emptyData); const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false); const [loadError, setLoadError] = useState('');
  const current = useRef(data); const locked = useRef(false); const ready = useRef(false); const mounted = useRef(true);
  const reload = useCallback(async () => {
    if (locked.current) return;
    ready.current = false; setLoading(true); setLoadError('');
    try { const next = await loadData(); current.current = next; ready.current = true; if (mounted.current) setData(next); }
    catch (e) { if (mounted.current) setLoadError(e instanceof Error ? e.message : 'Unable to read local storage. Your records have not been overwritten.'); }
    finally { if (mounted.current) setLoading(false); }
  }, []);
  useEffect(() => { mounted.current = true; void reload(); return () => { mounted.current = false; }; }, [reload]);
  const commit = useCallback(async (operation: (d: KnowledgeData) => KnowledgeData) => {
    if (!ready.current) throw new Error('Local storage is not ready. Resolve the loading error before editing.');
    if (locked.current) throw new Error('Another save is in progress. Please try again.');
    locked.current = true; setBusy(true);
    try { const next = validateData(operation(current.current)); await persistData(next); current.current = next; if (mounted.current) setData(next); }
    catch (e) { throw new Error(e instanceof Error ? e.message : 'Save failed. Nothing has been changed.'); }
    finally { locked.current = false; if (mounted.current) setBusy(false); }
  }, []);
  const saveItem = useCallback(async (input: ItemInput, id?: string, tagNames: string[] = [], projectIds: string[] = []) => {
    const itemId = id ?? newId();
    await commit(d => {
      const existing = d.items.find(x => x.id === itemId); if (id && !existing) throw new Error('This item no longer exists.');
      const now = new Date().toISOString(); const item = { ...input, title: input.title.trim(), id: itemId, created_at: existing?.created_at ?? now, updated_at: now };
      const tags = [...d.tags]; const selectedTagIds = [...new Set(tagNames.map(n => n.trim()).filter(Boolean))].map(name => {
        let tag = tags.find(t => t.name.toLocaleLowerCase() === name.toLocaleLowerCase());
        if (!tag) { tag = { id: newId(), name, color: theme.colors.violet }; tags.push(tag); } return tag.id;
      });
      return { ...d, items: existing ? d.items.map(x => x.id === itemId ? item : x) : [...d.items, item], tags,
        itemTags: [...d.itemTags.filter(x => x.item_id !== itemId), ...[...new Set(selectedTagIds)].map(tag_id => ({ item_id: itemId, tag_id }))],
        itemProjects: [...d.itemProjects.filter(x => x.item_id !== itemId), ...[...new Set(projectIds)].map(project_id => ({ item_id: itemId, project_id }))] };
    }); return itemId;
  }, [commit]);
  const deleteItem = useCallback(async (id: string) => { await commit(d => ({ ...d, items: d.items.filter(x => x.id !== id), relationships: d.relationships.filter(x => x.source_item_id !== id && x.target_item_id !== id), itemTags: d.itemTags.filter(x => x.item_id !== id), itemProjects: d.itemProjects.filter(x => x.item_id !== id), sampleIds: d.sampleIds.filter(x => x !== id) })); }, [commit]);
  const saveProject = useCallback(async (input: ProjectInput, id?: string) => {
    const projectId = id ?? newId(); await commit(d => {
      const existing = d.projects.find(x => x.id === projectId); if (id && !existing) throw new Error('This project no longer exists.');
      const now = new Date().toISOString(); const project = { ...input, title: input.title.trim(), id: projectId, created_at: existing?.created_at ?? now, updated_at: now };
      return { ...d, projects: existing ? d.projects.map(x => x.id === projectId ? project : x) : [...d.projects, project] };
    }); return projectId;
  }, [commit]);
  const deleteProject = useCallback(async (id: string) => { await commit(d => ({ ...d, projects: d.projects.filter(x => x.id !== id), itemProjects: d.itemProjects.filter(x => x.project_id !== id), sampleIds: d.sampleIds.filter(x => x !== id) })); }, [commit]);
  const linkProject = useCallback(async (itemId: string, projectId: string, linked: boolean) => { await commit(d => ({ ...d, itemProjects: [...d.itemProjects.filter(x => !(x.item_id === itemId && x.project_id === projectId)), ...(linked ? [{ item_id: itemId, project_id: projectId }] : [])] })); }, [commit]);
  const addRelationship = useCallback(async (input: Pick<Relationship, 'source_item_id' | 'target_item_id' | 'relation_type' | 'note'>) => { await commit(d => ({ ...d, relationships: [...d.relationships, { ...input, id: newId(), created_at: new Date().toISOString() }] })); }, [commit]);
  const removeRelationship = useCallback(async (id: string) => { await commit(d => ({ ...d, relationships: d.relationships.filter(x => x.id !== id) })); }, [commit]);
  const removeTag = useCallback(async (id: string) => { await commit(d => ({ ...d, tags: d.tags.filter(x => x.id !== id), itemTags: d.itemTags.filter(x => x.tag_id !== id), sampleIds: d.sampleIds.filter(x => x !== id) })); }, [commit]);
  const importData = useCallback(async (incoming: KnowledgeData, replace: boolean) => { let message = ''; await commit(d => {
    validateData(incoming); if (replace) { message = `Restored ${incoming.items.length} items, ${incoming.projects.length} projects, and ${incoming.relationships.length} relationships.`; return incoming; }
    const result = mergeData(d, incoming); message = `Imported ${result.added} records. Skipped ${result.duplicates} existing IDs; existing records were kept.`; return result.data;
  }); return message; }, [commit]);
  const addSamples = useCallback(async () => { await commit(d => { if (d.sampleIds.length) throw new Error('Sample records are already present.'); return mergeData(d, sampleData()).data; }); }, [commit]);
  const clearSamples = useCallback(async () => { await commit(removeSamples); }, [commit]);
  return <KnowledgeContext.Provider value={{ data, loading, busy, loadError, reload, saveItem, deleteItem, saveProject, deleteProject, linkProject, addRelationship, removeRelationship, removeTag, importData, addSamples, clearSamples }}>{children}</KnowledgeContext.Provider>;
}
