import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs, Redirect } from 'expo-router';

import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useCards } from '@/context/CardContext';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={22} style={{ marginBottom: -2 }} {...props} />;
}

export default function TabLayout() {
  const { state } = useCards();

  // A participant who hasn't finished the qualification onboarding has no
  // access to the app: every tab route redirects to the onboarding flow.
  if (!state.onboardingCompletedAt) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#C4956A',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#FDFCFA',
        },
        tabBarLabelStyle: {
          fontSize: 13,
        },
        headerStyle: {
          backgroundColor: '#FDFCFA',
        },
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Jeu',
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="gamepad" color={color} />,
        }}
      />
      <Tabs.Screen
        name="results"
        options={{
          title: 'Résultats',
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="trophy" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'En savoir plus',
          tabBarIcon: ({ color }) => <TabBarIcon name="info-circle" color={color} />,
        }}
      />
    </Tabs>
  );
}
