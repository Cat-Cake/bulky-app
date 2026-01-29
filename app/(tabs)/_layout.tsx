import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from "@/app/providers/AuthProvider";

export default function TabLayout() {
    const colorScheme = useColorScheme();
    const { user } = useAuth();
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
                headerShown: false,
                tabBarButton: HapticTab,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Accueil',
                    tabBarIcon: ({ color }) => (
                        <IconSymbol size={28} name="house.fill" color={color} />
                    ),
                }}
            />

            {user?.role === "citoyen" && (
                <Tabs.Screen
                    name="citizen"
                    options={{
                        title: 'Mon espace',
                        tabBarIcon: ({ color }) => (
                            <IconSymbol size={28} name="person.fill" color={color} />
                        ),
                    }}
                />
            )}

            {user?.role === "gestionnaire" && (
                <Tabs.Screen
                    name="manager"
                    options={{
                        title: "Espace gestionnaire",
                        tabBarIcon: ({ color }) => (
                            <IconSymbol size={28} name="person.fill" color={color} />
                        ),
                        href: user?.role === "gestionnaire" ? "/manager" : null,
                    }}
                />
            )}

            {user?.role === "agent" && (
                <Tabs.Screen
                    name="agent"
                    options={{
                        title: 'Mon espace',
                        tabBarIcon: ({ color }) => (
                            <IconSymbol size={28} name="person.fill" color={color} />
                        ),
                        href: user?.role === "agent" ? "/agent" : null,
                    }}
                />
            )}

        </Tabs>
    );
}