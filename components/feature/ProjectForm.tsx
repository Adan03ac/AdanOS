import React from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { useProjectEditor } from '@/hooks/useEditors';
import { Button, Choices, EmptyState, Input, Notice, options } from '@/components/ui/Controls';
import { layoutStyles as l } from '@/components/layout/Screen';
import { ProjectInput, projectStatuses } from '@/services/knowledge';
import { theme as t } from '@/constants/theme';
interface ProjectFormProps { id?: string }
export function ProjectForm({ id }: ProjectFormProps) {
  const editor = useProjectEditor(id);
  if (editor.missing) return <EmptyState title="Project not found" message="It may have been deleted or replaced by a backup restore." />;
  return <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={l.list}><FlatList data={[{ id: 'form' }]} keyExtractor={x => x.id} style={l.list} contentContainerStyle={l.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" renderItem={() => <View style={{ gap: t.space.md, paddingTop: t.space.lg }}><Text style={{ color: t.colors.violet, fontSize: t.font.small, letterSpacing: 1.5 }}>GIVE YOUR IDEAS A DIRECTION</Text><Notice kind="error" message={editor.operation.error} /><Input title="Project title · required" value={editor.input.title} onChangeText={v => editor.field('title',v)} placeholder="What are you building or exploring?" /><Input title="Description" value={editor.input.description} onChangeText={v => editor.field('description',v)} multiline placeholder="Purpose, context, and what success means…" /><Choices title="Project status" value={editor.input.status} options={options(projectStatuses)} onChange={v => editor.field('status',v as ProjectInput['status'])} /><Input title="Next action" value={editor.input.next_action} onChangeText={v => editor.field('next_action',v)} placeholder="One concrete next step…" /><Input title="Target date · optional, YYYY-MM-DD" value={editor.input.target_date} onChangeText={v => editor.field('target_date',v)} placeholder="2026-12-31" /><Button title={editor.operation.pending ? 'Saving…' : id ? 'Save project changes' : 'Create project'} disabled={editor.operation.pending} onPress={() => void editor.save()} /><Text style={l.muted}>Link existing knowledge items on the project page after saving.</Text></View>} /></KeyboardAvoidingView>;
}
