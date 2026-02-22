import { Tabs } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';

import { onValue, ref } from 'firebase/database';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { db } from '../../src/firebaseConfig';

type UserPreview = {
  type?: number;
};

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [pendingUsersCount, setPendingUsersCount] = useState(0);

  const usersRef = useMemo(() => ref(db, 'users'), []);

  useEffect(() => {
    const unsubscribe = onValue(
      usersRef,
      (snapshot) => {
        const data = (snapshot.val() ?? {}) as Record<string, UserPreview>;
        const count = Object.values(data).filter((u) => Number(u?.type) === 0).length;
        setPendingUsersCount(count);
      },
      () => {
        setPendingUsersCount(0);
      }
    );

    return () => unsubscribe();
  }, [usersRef]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="approve-users"
        options={{
          title: 'Approve',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person.crop.circle" color={color} />
          ),
          tabBarBadge: pendingUsersCount > 0 ? pendingUsersCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: '#dc2626',
            color: '#fff',
          },
        }}
      />
    </Tabs>
  );
}
