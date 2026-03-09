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

            <Tabs.Screen
                name="citizen"
                options={{
                    title: 'Statistiques',
                    tabBarIcon: ({ color }) => (
                        <IconSymbol size={28} name="chart.bar.fill" color={color} />
                    ),
                    href: user?.role === "citoyen" ? "/citizen" : null,
                }}
            />
            <Tabs.Screen
                name="rewards"
                options={{
                    title: 'Récompenses',
                    tabBarIcon: ({ color }) => (
                        <IconSymbol size={28} name="gift.fill" color={color} />
                    ),
                    href: user?.role === "citoyen" ? "/rewards" : null,
                }}
            />

            <Tabs.Screen
                name="manager"
                options={{
                    title: "Statistiques",
                    tabBarIcon: ({ color }) => (
                        <IconSymbol size={28} name="chart.bar.fill" color={color} />
                    ),
                    href: user?.role === "gestionnaire" ? "/manager" : null,
                }}
            />

            <Tabs.Screen
                name="managerContact"
                options={{
                    title: "Contact",
                    tabBarIcon: ({ color }) => (
                        <IconSymbol size={28} name="message.fill" color={color} />
                    ),
                    href: user?.role === "gestionnaire" ? "/managerContact" : null,
                }}
            />

            <Tabs.Screen
                name="managerUsers"
                options={{
                    title: "Utilisateurs",
                    tabBarIcon: ({ color }) => (
                        <IconSymbol size={28} name="person.fill" color={color} />
                    ),
                    href: user?.role === "gestionnaire" ? "/managerUsers" : null,
                }}
            />

            <Tabs.Screen
                name="managerRewards"
                options={{
                    title: "Récompenses",
                    tabBarIcon: ({ color }) => (
                        <IconSymbol size={28} name="gift.fill" color={color} />
                    ),
                    href: user?.role === "gestionnaire" ? "/managerRewards" : null,
                }}
            />

            <Tabs.Screen
                name="managerTeams"
                options={{
                    title: "Équipes",
                    tabBarIcon: ({ color }) => (
                        <IconSymbol size={28} name="figure.2.and.child.holdinghands" color={color} />
                    ),
                    href: user?.role === "gestionnaire" ? "/managerTeams" : null,
                }}
            />

            <Tabs.Screen
                name="agent"
                options={{
                    title: 'Statistiques',
                    tabBarIcon: ({ color }) => (
                        <IconSymbol size={28} name="person.fill" color={color} />
                    ),
                    href: user?.role === "agent" ? "/agent" : null,
                }}
            />

            <Tabs.Screen
                name="team"
                options={{
                    title: 'Équipe',
                    tabBarIcon: ({ color }) => (
                        <IconSymbol size={28} name="figure.2.and.child.holdinghands" color={color} />
                    ),
                    href: user?.role === "agent" ? "/team" : null,
                }}
            />

        </Tabs>
    );
}