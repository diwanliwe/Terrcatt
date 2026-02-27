import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: 6 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.6)',
        tabBarStyle: {
          backgroundColor: '#C4956A',
        },
        tabBarLabelStyle: {
          fontSize: 13,
        },
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Glisser',
          tabBarIcon: ({ color }) => <TabBarIcon name="hand-pointer-o" color={color} />,
        }}
      />
      <Tabs.Screen
        name="compare"
        options={{
          title: 'Comparer',
          tabBarIcon: ({ color }) => <TabBarIcon name="balance-scale" color={color} />,
        }}
      />
      <Tabs.Screen
        name="rate"
        options={{
          title: 'Noter',
          tabBarIcon: ({ color }) => <TabBarIcon name="star" color={color} />,
        }}
      />
      <Tabs.Screen
        name="results"
        options={{
          title: 'Résultats',
          tabBarIcon: ({ color }) => <TabBarIcon name="trophy" color={color} />,
        }}
      />
    </Tabs>
  );
}
