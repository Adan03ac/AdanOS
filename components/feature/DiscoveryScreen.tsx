import React, { useMemo, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useDiscovery } from '@/hooks/useDiscovery';
import { useKnowledge } from '@/hooks/useKnowledge';
import { useOperation } from '@/hooks/useOperation';
import { Screen, Header, SectionHeading, layoutStyles as l } from '@/components/layout/Screen';
import { Button, Choices, EmptyState, Notice } from '@/components/ui/Controls';
import { ItemCard } from './ItemCard';
import { ProjectCard } from './ProjectCard';
import { theme as t } from '@/constants/theme';
interface DiscoveryRow { id: string; kind: 'item' | 'project' | 'candidate'; a: string; b?: string; reason?: string }
export function DiscoveryScreen() {
  const discovery = useDiscovery(); const { data, addRelationship } = useKnowledge(); const operation = useOperation(); const router = useRouter(); const [tab, setTab] = useState('unlinked');
  const rows = useMemo<DiscoveryRow[]>(() => tab === 'unlinked' ? discovery.unlinked.map(i => ({ id: i.id, kind: 'item', a: i.id })) : tab === 'sources' ? discovery.missingSources.map(i => ({ id: i.id, kind: 'item', a: i.id })) : tab === 'actions' ? discovery.noAction.map(p => ({ id: p.id, kind: 'project', a: p.id })) : discovery.candidates.map(p => ({ id: p.a+'|'+p.b, kind: 'candidate', a: p.a, b: p.b, reason: p.reason })), [tab, discovery]);
  const descriptions: Record<string,string> = { unlinked: 'Items with no saved incoming or outgoing relationship.', sources: 'Non-source items with no direct relationship to a source item. This checks links, not citation quality.', actions: 'Projects not marked completed with an empty next-action field.', related: 'Unsaved pairs that share an explicit tag or project. Up to 40 suggestions, scanning up to 100 members per group. No semantic or AI analysis.' };
  return <Screen><FlatList data={rows} keyExtractor={r => r.id} style={l.list} contentContainerStyle={l.content} showsVerticalScrollIndicator={false} ListHeaderComponent={<View><Header title="Discovery" eyebrow="05 / NOTICE THE GAPS" subtitle="Small signals that help your knowledge become more useful." /><Notice message="Rule-based discovery only. Nothing is AI-generated, and no suggestion becomes a relationship until you save it." /><Choices value={tab} onChange={setTab} options={[{ value: 'unlinked', title: `Unlinked · ${discovery.unlinked.length}` }, { value: 'sources', title: `No source · ${discovery.missingSources.length}` }, { value: 'actions', title: `No next action · ${discovery.noAction.length}` }, { value: 'related', title: `Shared context · ${discovery.candidates.length}` }]} /><Notice kind="error" message={operation.error} /><Notice kind="success" message={operation.success} /><SectionHeading title={`${rows.length} ${tab === 'related' ? 'suggestions' : 'results'}`} /><Text style={l.muted}>{descriptions[tab]}</Text></View>} ListEmptyComponent={<EmptyState title={data.items.length || data.projects.length ? 'Nothing to surface here' : 'Discovery begins with your knowledge'} message={data.items.length || data.projects.length ? 'No records match this rule. Try another discovery lens.' : 'Create items and projects first. Discovery uses only your saved records and explicit metadata.'} icon="compass-outline" />} renderItem={({ item }) => {
    if (item.kind === 'project') { const p = data.projects.find(p => p.id === item.a); return p ? <ProjectCard project={p} count={data.itemProjects.filter(x => x.project_id === p.id).length} onPress={() => router.push({ pathname: '/project', params: { id: p.id } })} /> : null; }
    const a = data.items.find(i => i.id === item.a); if (!a) return null;
    if (item.kind === 'item') return <ItemCard item={a} onPress={() => router.push({ pathname: '/item', params: { id: a.id } })} />;
    const b = data.items.find(i => i.id === item.b); if (!b) return null;
    return <View style={l.panel}><Text style={{ color: t.colors.violet, fontSize: t.font.small, letterSpacing: 1 }}>RULE-BASED SUGGESTION</Text><Text style={l.text}>{a.title} ↔ {b.title}</Text><Text style={l.muted}>{item.reason}</Text><Button title="Save related-to connection" variant="secondary" disabled={operation.pending} onPress={() => void operation.run(() => addRelationship({ source_item_id: a.id, target_item_id: b.id, relation_type: 'related_to', note: `Manually accepted rule-based suggestion. ${item.reason}` }), 'Relationship saved.')} /></View>;
  }} /></Screen>;
}
