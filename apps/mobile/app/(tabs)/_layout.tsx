import React from 'react';
import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, type IconName } from '@/components/ui';
import { colors as c } from '@/theme/tokens';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const tabs: { name: string; title: string; icon: IconName }[] = [
    { name: 'index', title: 'Home', icon: 'home' },
    { name: 'play', title: 'Play', icon: 'grid' },
    { name: 'community', title: 'Community', icon: 'users' },
    { name: 'shop', title: 'Shop', icon: 'shopping-bag' },
    { name: 'profile', title: 'You', icon: 'user' },
  ];
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: c.deep, tabBarInactiveTintColor: c.muted, tabBarStyle: { backgroundColor: c.background, borderTopColor: c.line, height: 74 + insets.bottom, paddingBottom: 10 + insets.bottom, paddingTop: 8 }, tabBarLabelStyle: { fontSize: 10, fontWeight: '600' }, sceneStyle: { backgroundColor: c.background } }}>
    {tabs.map(tab => <Tabs.Screen key={tab.name} name={tab.name} options={{ title: tab.title, tabBarIcon: ({ focused, color }) => <View style={{ paddingHorizontal: 18, paddingVertical: 5, borderRadius: 18, backgroundColor: focused ? c.lime : 'transparent' }}><Icon name={tab.icon} color={color} size={20} /></View> }} />)}
  </Tabs>;
}
