import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/layout/Screen';
import { ItemForm } from '@/components/feature/ItemForm';
import { itemTypes, ItemType } from '@/services/knowledge';
export default function CapturePage() { const { id, type } = useLocalSearchParams<{ id?: string; type?: string }>(); return <Screen detail><ItemForm id={id} initialType={itemTypes.includes(type as ItemType) ? type as ItemType : 'idea'} /></Screen>; }
