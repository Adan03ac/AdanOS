import { useEffect, useRef, useState } from 'react';
import { Platform, Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useKnowledge } from './useKnowledge';
import { useOperation } from './useOperation';
import { KnowledgeData, parseBackup, serializeData } from '@/services/knowledge';
import { runIntegrityChecks } from '@/services/integrityChecks';
export function useBackup() {
  const { data, importData, addSamples, clearSamples, removeTag } = useKnowledge(); const operation = useOperation();
  const [raw, setRaw] = useState(''); const [incoming, setIncoming] = useState<KnowledgeData | null>(null); const [mode, setMode] = useState('merge'); const [confirm, setConfirm] = useState<'restore' | 'samples' | 'tag' | null>(null); const [tagId, setTagId] = useState('');
  const download = useRef<((json: string) => void) | null>(null);
  useEffect(() => { if (Platform.OS !== 'web') return; download.current = json => { const url = URL.createObjectURL(new Blob([json], { type: 'application/json' })); const a = document.createElement('a'); a.href = url; a.download = `adan-os-${new Date().toISOString().slice(0,10)}.json`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); }; return () => { download.current = null; }; }, []);
  function changeRaw(value: string) { setRaw(value); setIncoming(null); operation.setError(''); operation.setSuccess(''); }
  async function exportBackup() { await operation.run(async () => { const json = serializeData(data); if (Platform.OS === 'web') { if (!download.current) throw new Error('Browser download is unavailable. Use Copy JSON instead.'); download.current(json); operation.setSuccess('Download requested. Check your browser Downloads for the JSON file.'); } else { await Share.share({ message: json, title: 'ADAN OS JSON backup' }); operation.setSuccess('Share dialog closed. A saved backup is only confirmed by your chosen destination; you can also copy the JSON.'); } }); }
  async function copy() { await operation.run(async () => { await Clipboard.setStringAsync(serializeData(data)); }, 'Backup JSON copied. Store it in a safe location.'); }
  function validate() { try { const parsed = parseBackup(raw); setIncoming(parsed); operation.setError(''); operation.setSuccess(`Valid backup: ${parsed.items.length} items, ${parsed.projects.length} projects, ${parsed.relationships.length} relationships. Nothing has been imported yet.`); } catch (e) { setIncoming(null); operation.setSuccess(''); operation.setError(e instanceof Error ? e.message : 'Backup validation failed.'); } }
  async function confirmAction() {
    let message = ''; const ok = await operation.run(async () => { if (confirm === 'restore' && incoming) message = await importData(incoming, mode === 'replace'); else if (confirm === 'samples') { await clearSamples(); message = 'Sample records and their associations removed.'; } else if (confirm === 'tag') { await removeTag(tagId); message = 'Tag and its item associations removed.'; } else throw new Error('Choose an action first.'); });
    if (ok) { setConfirm(null); operation.setSuccess(message); if (confirm === 'restore') { setIncoming(null); setRaw(''); } }
  }
  async function seed() { await operation.run(addSamples, 'Clearly labeled sample records added. Remove them here at any time.'); }
  async function check() { await operation.run(async () => { operation.setSuccess(runIntegrityChecks(data)); }); }
  function deleteTag(id: string) { setTagId(id); setConfirm('tag'); }
  return { raw, changeRaw, incoming, mode, setMode, confirm, setConfirm, operation, exportBackup, copy, validate, confirmAction, seed, check, deleteTag };
}
