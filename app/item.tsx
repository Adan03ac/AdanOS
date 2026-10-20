import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/layout/Screen';
import { ItemDetail } from '@/components/feature/ItemDetail';
export default function ItemPage() { const { id } = useLocalSearchParams<{ id?: string }>(); return <Screen detail><ItemDetail key={id ?? 'missing'} id={id ?? ''} /></Screen>; }
