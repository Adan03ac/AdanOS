import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useKnowledge } from './useKnowledge';
import { useOperation } from './useOperation';
import { ItemInput, ItemType, ProjectInput } from '@/services/knowledge';
export function useItemEditor(id?: string, initialType: ItemType = 'idea') {
  const { data, saveItem } = useKnowledge(); const router = useRouter(); const operation = useOperation(); const existing = data.items.find(x => x.id === id);
  const [input, setInput] = useState<ItemInput>({ title: '', content: '', type: initialType, status: 'draft', epistemic_type: 'hypothesis', confidence: null, verification_status: 'unverified', origin: 'manual' });
  const [tags, setTags] = useState(''); const [projects, setProjects] = useState<string[]>([]); const [confidence, setConfidence] = useState(''); const [hydrated, setHydrated] = useState(false);
  useEffect(() => { if (existing && !hydrated) { setInput(existing); setConfidence(existing.confidence === null ? '' : String(existing.confidence)); setTags(data.itemTags.filter(x => x.item_id === existing.id).map(x => data.tags.find(t => t.id === x.tag_id)?.name).filter(Boolean).join(', ')); setProjects(data.itemProjects.filter(x => x.item_id === existing.id).map(x => x.project_id)); setHydrated(true); } }, [existing, hydrated, data]);
  function field<K extends keyof ItemInput>(key: K, value: ItemInput[K]) { setInput(previous => ({ ...previous, [key]: value })); }
  function toggleProject(id: string) { setProjects(previous => previous.includes(id) ? previous.filter(x => x !== id) : [...previous, id]); }
  async function save() {
    if (!input.title.trim()) { operation.setError('A title is required.'); return; }
    const score = confidence.trim() ? Number(confidence) : null;
    if (score !== null && (!Number.isFinite(score) || score < 0 || score > 100)) { operation.setError('Confidence must be between 0 and 100, or left blank.'); return; }
    let savedId = ''; const ok = await operation.run(async () => { savedId = await saveItem({ ...input, confidence: score }, id, tags.split(/[,،]/), projects); });
    if (ok) router.replace({ pathname: '/item', params: { id: savedId } });
  }
  return { input, field, tags, setTags, projects, toggleProject, confidence, setConfidence, save, operation, missing: !!id && !existing };
}
export function useProjectEditor(id?: string) {
  const { data, saveProject } = useKnowledge(); const router = useRouter(); const operation = useOperation(); const existing = data.projects.find(x => x.id === id);
  const [input, setInput] = useState<ProjectInput>({ title: '', description: '', status: 'planned', next_action: '', target_date: '' }); const [hydrated, setHydrated] = useState(false);
  useEffect(() => { if (existing && !hydrated) { setInput(existing); setHydrated(true); } }, [existing, hydrated]);
  function field<K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) { setInput(previous => ({ ...previous, [key]: value })); }
  async function save() { if (!input.title.trim()) { operation.setError('A project title is required.'); return; } let savedId = ''; const ok = await operation.run(async () => { savedId = await saveProject(input, id); }); if (ok) router.replace({ pathname: '/project', params: { id: savedId } }); }
  return { input, field, save, operation, missing: !!id && !existing };
}
