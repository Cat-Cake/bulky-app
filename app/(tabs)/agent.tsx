import React, { useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    FlatList,
    ScrollView, Pressable,
} from "react-native";
import { useAuth } from "@/app/providers/AuthProvider";
import {router} from "expo-router";

const API_URL = process.env.EXPO_PUBLIC_API_URL as string;

const ORANGE = "#F97316";
const BG = "#F5F5F7";
const CARD = "#FFFFFF";
const TEXT_DARK = "#111827";
const GRAY = "#6B7280";
const SOFT = "#E5E7EB";

type MonthlyStat = {
    _id: { month: number; year: number };
    count: number;
};

type AgentDashboardResponse = {
    monthlyStats: MonthlyStat[];
    stats: {
        totalTeamReports: number;
        assignedToAgent: number;
        finishedByAgent: number;
        finishedByTeam: number;
    };
    team: {
        _id: string;
        name: string;
        leader: string;
        members: string[];
    } | null;
};

export default function AgentDashboardScreen() {
    const { token, user, signOut } = useAuth();
    const canUseApi = useMemo(() => !!API_URL && !!token, [token]);

    const [data, setData] = useState<AgentDashboardResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    async function load() {
        if (!token) return;
        try {
            setLoading(true);
            setErr(null);

            const res = await fetch(`${API_URL}/api/agent/`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json?.error || "Impossible de charger le dashboard");

            console.log(json)

            setData(json);
        } catch (e: any) {
            setErr(e?.message ?? "Erreur");
            setData(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (canUseApi) load();
    }, [canUseApi]);

    if (user?.role !== "agent") {
        return (
            <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
                <Text style={styles.title}>Accès refusé</Text>
                <Text style={styles.subtitle}>Cette page est réservée aux agents.</Text>
            </View>
        );
    }

    const totalTeamReports = data?.stats?.totalTeamReports ?? 0;
    const assignedToAgent  = data?.stats?.assignedToAgent ?? 0;
    const finishedByAgent  = data?.stats?.finishedByAgent ?? 0;
    const finishedByTeam   = data?.stats?.finishedByTeam ?? 0;

    const monthlyStats = data?.monthlyStats ?? [];
    const team = data?.team ?? null;

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.title}>Tableau de bord agent</Text>
                    <Text style={styles.subtitle}>
                        Suivi des signalements de ton équipe et de ton activité personnelle.
                    </Text>
                </View>
            </View>

            {loading ? <ActivityIndicator /> : null}
            {err ? <Text style={styles.error}>{err}</Text> : null}

            <View style={styles.statsGrid}>
                <StatCard
                    label="Signalements assignés à l'équipe"
                    value={totalTeamReports}
                    caption="Signalements suivis par ton équipe"
                />
                <StatCard
                    label="Signalements assignés à toi"
                    value={assignedToAgent}
                    caption="Signalements où tu es responsable"
                />
                <StatCard
                    label="Signalements terminés (toi)"
                    value={finishedByAgent}
                    caption="Signalements collectés ou clôturés par toi"
                />
                <StatCard
                    label="Signalements terminés (équipe)"
                    value={finishedByTeam}
                    caption="Signalements clôturés par ton équipe"
                />
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Évolution des signalements de l'équipe</Text>
                    <Text style={styles.sectionSubtitle}>
                        Répartition des signalements pris en charge par mois.
                    </Text>
                </View>

                <View style={styles.tableCard}>
                    {monthlyStats.length === 0 ? (
                        <Text style={styles.emptyText}>Aucune donnée de signalements pour le moment.</Text>
                    ) : (
                        <>
                            <View style={styles.tableHead}>
                                <Text style={[styles.th, { flex: 1 }]}>Mois</Text>
                                <Text style={[styles.th, { width: 110, textAlign: "right" }]}>
                                    Signalements
                                </Text>
                            </View>

                            <FlatList
                                data={monthlyStats}
                                keyExtractor={(it) => `${it._id.year}-${it._id.month}`}
                                scrollEnabled={false}
                                renderItem={({ item, index }) => {
                                    const even = index % 2 === 1;
                                    return (
                                        <View style={[styles.tr, even && styles.trEven]}>
                                            <Text style={[styles.td, { flex: 1 }]}>
                                                {item._id.month}/{item._id.year}
                                            </Text>
                                            <Text style={[styles.td, { width: 110, textAlign: "right" }]}>
                                                {item.count}
                                            </Text>
                                        </View>
                                    );
                                }}
                            />
                        </>
                    )}
                </View>
                <Pressable
                    style={styles.secondaryBtn}
                    onPress={async () => {
                        await signOut();
                        router.replace("/login");
                    }}
                >
                    <Text style={styles.secondaryBtnText}>Se déconnecter</Text>
                </Pressable>
            </View>
        </ScrollView>
    );
}

function StatCard({
                      label,
                      value,
                      caption,
                  }: {
    label: string;
    value: number;
    caption: string;
}) {
    return (
        <View style={styles.statCard}>
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statCaption}>{caption}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: BG, paddingTop: 35 },
    container: { padding: 16, paddingBottom: 28, gap: 16 },

    header: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
    },
    title: { fontSize: 26, fontWeight: "700", color: TEXT_DARK, marginBottom: 4 },
    subtitle: { fontSize: 13, color: GRAY },

    error: { color: "red", fontSize: 13 },

    statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    statCard: {
        width: "48%",
        backgroundColor: CARD,
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: SOFT,
    },
    statLabel: { fontSize: 13, color: GRAY },
    statValue: { fontSize: 30, fontWeight: "700", color: TEXT_DARK, marginVertical: 10 },
    statCaption: { fontSize: 12, color: GRAY },

    section: { gap: 10 },
    sectionHeader: { gap: 4 },
    sectionTitle: { fontSize: 18, fontWeight: "700", color: TEXT_DARK },
    sectionSubtitle: { fontSize: 13, color: GRAY },

    tableCard: {
        backgroundColor: CARD,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: SOFT,
        overflow: "hidden",
    },
    tableHead: {
        flexDirection: "row",
        paddingVertical: 10,
        paddingHorizontal: 14,
        backgroundColor: "#F8F5F2",
        borderBottomWidth: 1,
        borderBottomColor: SOFT,
    },
    th: { fontSize: 13, fontWeight: "700", color: TEXT_DARK },
    tr: {
        flexDirection: "row",
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderBottomWidth: 1,
        borderBottomColor: SOFT,
    },
    trEven: { backgroundColor: "#FAFAFA" },
    td: { fontSize: 13, color: TEXT_DARK },

    emptyText: { padding: 14, fontSize: 13, color: GRAY, fontStyle: "italic" },
    secondaryBtn: { backgroundColor: "#FFF7ED", borderWidth: 1, borderColor: ORANGE, paddingVertical: 10, borderRadius: 10, alignItems: "center" },
    secondaryBtnText: { color: ORANGE, fontWeight: "900" },
});