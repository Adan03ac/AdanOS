import React from 'react';
import { FlatList, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useKnowledge } from '@/hooks/useKnowledge';
import { useLayout } from '@/hooks/useLayout';
import { Screen, Header, SectionHeading, layoutStyles as l } from '@/components/layout/Screen';
import { Button, EmptyState } from '@/components/ui/Controls';
import { ProjectCard } from './ProjectCard';
export function ProjectsScreen() {
  const { data } = useKnowledge(); const { wide } = useLayout(); const router = useRouter();
  return <Screen><FlatList key={wide ? 'two' : 'one'} numColumns={wide ? 2 : 1} columnWrapperStyle={wide ? { gap: 16 } : undefined} data={[...data.projects].sort((a,b) => b.updated_at.localeCompare(a.updated_at))} keyExtractor={p => p.id} style={l.list} contentContainerStyle={l.content} showsVerticalScrollIndicator={false} ListHeaderComponent={<View><Header title="Projects in orbit" eyebrow="04 / IDEAS INTO MOTION" subtitle="Give your knowledge a direction. Keep the next step in sight." action={<Button title="New project" icon="add-outline" onPress={() => router.push('/project-edit')} />} /><SectionHeading title={`${data.projects.length} projects · ${data.projects.filter(p => p.status === 'active').length} active`} /></View>} ListEmptyComponent={<EmptyState title="Turn curiosity into a project" message="Create a project, define one next action, and link the ideas, sources, and skills that move it forward." icon="folder-open-outline" action={<Button title="Create your first project" onPress={() => router.push('/project-edit')} />} />} renderItem={({ item }) => <View style={{ flex: 1, maxWidth: wide ? '50%' : '100%' }}><ProjectCard project={item} count={data.itemProjects.filter(p => p.project_id === item.id).length} onPress={() => router.push({ pathname: '/project', params: { id: item.id } })} /></View>} /></Screen>;
}
