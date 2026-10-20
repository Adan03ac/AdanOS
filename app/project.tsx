import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/layout/Screen';
import { ProjectDetail } from '@/components/feature/ProjectDetail';
export default function ProjectPage() { const { id } = useLocalSearchParams<{ id?: string }>(); return <Screen detail><ProjectDetail key={id ?? 'missing'} id={id ?? ''} /></Screen>; }
