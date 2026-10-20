import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { KnowledgeProvider } from '@/contexts/KnowledgeContext';
import { theme } from '@/constants/theme';
export default function RootLayout() {
  return <SafeAreaProvider><KnowledgeProvider><StatusBar style="light" /><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.background }, headerStyle: { backgroundColor: theme.colors.surface }, headerTintColor: theme.colors.text, headerShadowVisible: false }}><Stack.Screen name="(tabs)" /><Stack.Screen name="capture" options={{ headerShown: true, title: 'Capture / Edit', presentation: 'modal' }} /><Stack.Screen name="item" options={{ headerShown: true, title: 'Knowledge item' }} /><Stack.Screen name="project" options={{ headerShown: true, title: 'Project' }} /><Stack.Screen name="project-edit" options={{ headerShown: true, title: 'Create / Edit project', presentation: 'modal' }} /></Stack></KnowledgeProvider></SafeAreaProvider>;
}
