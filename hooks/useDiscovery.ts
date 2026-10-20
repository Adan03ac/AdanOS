import { useMemo } from 'react';
import { useKnowledge } from './useKnowledge';
export function useDiscovery() {
  const { data } = useKnowledge();
  return useMemo(() => {
    const linked = new Set(data.relationships.flatMap(r => [r.source_item_id, r.target_item_id])); const sourceIds = new Set(data.items.filter(i => i.type === 'source').map(i => i.id));
    const sourced = new Set<string>(); data.relationships.forEach(r => { if (sourceIds.has(r.source_item_id)) sourced.add(r.target_item_id); if (sourceIds.has(r.target_item_id)) sourced.add(r.source_item_id); });
    const pairs = new Set(data.relationships.map(r => [r.source_item_id, r.target_item_id].sort().join('|')));
    const candidates: { a: string; b: string; reason: string }[] = []; const candidateKeys = new Set<string>();
    const tagGroups = data.tags.map(t => ({ ids: data.itemTags.filter(x => x.tag_id === t.id).map(x => x.item_id), reason: `Shared tag: ${t.name}` }));
    const projectGroups = data.projects.map(p => ({ ids: data.itemProjects.filter(x => x.project_id === p.id).map(x => x.item_id), reason: `Same project: ${p.title}` }));
    for (const group of [...tagGroups, ...projectGroups]) { if (candidates.length >= 40) break; const ids = group.ids.slice(0, 100); for (let i = 0; i < ids.length && candidates.length < 40; i++) { for (let j = i+1; j < ids.length && candidates.length < 40; j++) { const key = [ids[i], ids[j]].sort().join('|'); if (!pairs.has(key) && !candidateKeys.has(key)) { candidateKeys.add(key); candidates.push({ a: ids[i], b: ids[j], reason: group.reason }); } } } }
    return { unlinked: data.items.filter(i => !linked.has(i.id)), missingSources: data.items.filter(i => i.type !== 'source' && !sourced.has(i.id)), noAction: data.projects.filter(p => p.status !== 'completed' && !p.next_action.trim()), candidates };
  }, [data]);
}
