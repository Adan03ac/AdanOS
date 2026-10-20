import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import { theme as t } from '@/constants/theme';
export default function TabLayout() {
  const insets = useSafeAreaInsets();
  return <Tabs screenOptions={{ headerShown: false, tabBarStyle: { height: Platform.OS === 'web' ? 72 : insets.bottom + 64, paddingTop: 8, paddingBottom: Platform.OS === 'web' ? 8 : insets.bottom + 8, paddingHorizontal: 16, backgroundColor: t.colors.surface, borderTopColor: t.colors.border, borderTopWidth: 1 }, tabBarActiveTintColor: t.colors.primary, tabBarInactiveTintColor: t.colors.muted, tabBarLabelStyle: { fontSize: 10, fontWeight: '500' }, tabBarItemStyle: { minHeight: 48 } }}>
    <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" color={color} size={size} /> }} />
    <Tabs.Screen name="library" options={{ title: 'Library', tabBarIcon: ({ color, size }) => <Ionicons name="layers-outline" color={color} size={size} /> }} />
    <Tabs.Screen name="universe" options={{ title: 'Universe', tabBarIcon: ({ color, size }) => <Ionicons name="planet-outline" color={color} size={size} /> }} />
    <Tabs.Screen name="projects" options={{ title: 'Projects', tabBarIcon: ({ color, size }) => <Ionicons name="folder-outline" color={color} size={size} /> }} />
    <Tabs.Screen name="discovery" options={{ title: 'Discover', tabBarIcon: ({ color, size }) => <Ionicons name="compass-outline" color={color} size={size} /> }} />
    <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: ({ color, size }) => <Ionicons name="options-outline" color={color} size={size} /> }} />
  </Tabs>;
}
