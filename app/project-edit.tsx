import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/layout/Screen';
import { ProjectForm } from '@/components/feature/ProjectForm';
export default function ProjectEditPage() { const { id } = useLocalSearchParams<{ id?: string }>(); return <Screen detail><ProjectForm id={id} /></Screen>; }
