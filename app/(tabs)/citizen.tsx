import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, FlatList, Image, ScrollView } from "react-native";
import { router } from "expo-router";
import {AuthProvider, useAuth} from "@/app/providers/AuthProvider";

const API_URL = process.env.EXPO_PUBLIC_API_URL as string;

type Report = {
    _id: string;
    description: string;
    status: "signale" | "valide" | "en_cours" | "collecte" | "refuse";
    date: string;
    picture?: string | null;
};

const ORANGE = "#F97316";

function formatDate(iso: string) {
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
}

function statusLabel(s: Report["status"]) {
    return s.replace("_", " ");
}

function badgeStyle(status: Report["status"]) {
    switch (status) {
        case "signale":
            return { backgroundColor: "#FFF7ED", borderColor: ORANGE };
        case "valide":
            return { backgroundColor: "#ECFDF5", borderColor: "#10B981" };
        case "collecte":
            return { backgroundColor: "#EFF6FF", borderColor: "#3B82F6" };
        case "refuse":
            return { backgroundColor: "#FEF2F2", borderColor: "#EF4444" };
        default:
            return { backgroundColor: "#F3F4F6", borderColor: "#D1D5DB" };
    }
}

export default function CitizenDashboardScreen() {
    const { token, user, signOut } = useAuth();

    const canUseApi = useMemo(() => !!API_URL && !!token, [API_URL, token]);

    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(false);
    const [flash, setFlash] = useState<{ type: "success" | "error"; message: string } | null>(null);

    async function loadReports() {
        if (!token) return;

        try {
            setLoading(true);
            setFlash(null);

            const res = await fetch(`${API_URL}/api/signalements`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Impossible de charger les signalements");

            const list = Array.isArray(data) ? data : data.reports ?? [];
            setReports(list);
        } catch (e: any) {
            setFlash({ type: "error", message: e?.message ?? "Erreur" });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (canUseApi) loadReports();
    }, [canUseApi]);

    const point = user?.point ?? 0;

    const totalReports = reports.length;
    const validReports = reports.filter((r) => r.status === "valide" || r.status === "collecte").length;
    const refusedReports = reports.filter((r) => r.status === "refuse").length;

    const level = useMemo(() => {
        if (point < 20) return "Débutant";
        if (point < 50) return "Citoyen engagé";
        return "Ambassadeur CleanCity";
    }, [point]);

    const progressText = useMemo(() => {
        if (point < 20) return `${20 - point} points avant le niveau “Citoyen engagé”.`;
        if (point < 50) return `${50 - point} points avant “Ambassadeur CleanCity”.`;
        return "Bravo ! Vous avez atteint le niveau maximum 🎉";
    }, [point]);

    return (
        <ScrollView
            contentContainerStyle={{ padding: 16, gap: 12 }}
            keyboardShouldPersistTaps="handled"
        >
            <View style={styles.container}>
                <View style={styles.hero}>
                    <View style={styles.heroHeader}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.title}>Bonjour {user?.firstname ?? "citoyen"}</Text>
                            {loading ? <Text style={styles.smallMuted}>Chargement…</Text> : null}
                            {flash?.type === "error" ? <Text style={styles.errorText}>{flash.message}</Text> : null}
                        </View>

                        <Pressable style={styles.primaryBtn} onPress={() => router.push("/(citizen)/report")}>
                            <Text style={styles.primaryBtnText}>Nouveau</Text>
                        </Pressable>
                    </View>

                    <View style={styles.levelCard}>
                        <Text style={styles.levelTitle}>Niveau actuel</Text>
                        <Text style={styles.levelName}>{level}</Text>
                        <Text style={styles.levelProgress}>{progressText}</Text>
                    </View>
                </View>

                <View style={styles.statsGrid}>
                    <View style={[styles.statCard, styles.statMain]}>
                        <Text style={styles.statLabel}>Points</Text>
                        <Text style={styles.statValue}>{point}</Text>
                        <Text style={styles.statCaption}>Récompenses obtenues grâce à vos signalements.</Text>
                    </View>

                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Signalements</Text>
                        <Text style={styles.statValue}>{totalReports}</Text>
                        <Text style={styles.statCaption}>Nombre total déposés.</Text>
                    </View>

                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Validés</Text>
                        <Text style={styles.statValue}>{validReports}</Text>
                        <Text style={styles.statCaption}>Pris en charge / traités.</Text>
                    </View>

                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Refusés</Text>
                        <Text style={styles.statValue}>{refusedReports}</Text>
                        <Text style={styles.statCaption}>Non retenus.</Text>
                    </View>
                </View>

                <View style={styles.recentSection}>
                    <View style={styles.recentHeader}>
                        <Text style={styles.recentTitle}>Derniers signalements</Text>
                        <Text style={styles.recentSubtitle}>
                            {totalReports > 0 ? `Vos ${reports.length} signalements les plus récents.` : "Aucun signalement pour le moment."}
                        </Text>
                    </View>

                    {reports.length > 0 ? (
                        <FlatList
                            data={reports}
                            keyExtractor={(item) => item._id}
                            contentContainerStyle={{ gap: 10 }}
                            renderItem={({ item }) => (
                                <View style={styles.recentRow}>
                                    <View style={styles.thumb}>
                                        {item.picture ? (
                                            <Image source={{ uri: item.picture }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                                        ) : (
                                            <Text style={styles.noPhoto}>—</Text>
                                        )}
                                    </View>

                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.recentDesc} numberOfLines={2}>
                                            {item.description}
                                        </Text>

                                        <View style={styles.recentMeta}>
                                            <View style={[styles.badge, badgeStyle(item.status)]}>
                                                <Text style={styles.badgeText}>{statusLabel(item.status)}</Text>
                                            </View>
                                            <Text style={styles.recentDate}>{formatDate(item.date)}</Text>
                                        </View>
                                    </View>
                                </View>
                            )}
                        />
                    ) : (
                        <View style={styles.empty}>
                            <Text style={styles.emptyText}>Aucun signalement pour le moment.</Text>
                            <Pressable style={styles.secondaryBtn} onPress={() => router.push("/(citizen)/report")}>
                                <Text style={styles.secondaryBtnText}>Créer mon premier signalement</Text>
                            </Pressable>
                        </View>
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

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F9FAFB", padding: 16, gap: 14, paddingTop: 50 },

    hero: { gap: 12 },
    heroHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
    title: { fontSize: 24, fontWeight: "800", color: "#111827" },

    smallMuted: { marginTop: 4, color: "#6B7280" },
    errorText: { marginTop: 6, color: "#EF4444", fontWeight: "700" },

    primaryBtn: { backgroundColor: ORANGE, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10 },
    primaryBtnText: { color: "white", fontWeight: "800" },

    levelCard: { backgroundColor: "white", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 14, padding: 14, gap: 6 },
    levelTitle: { color: "#6B7280", fontWeight: "700", fontSize: 12 },
    levelName: { fontSize: 20, fontWeight: "900", color: ORANGE },
    levelProgress: { color: "#374151" },

    statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    statCard: { backgroundColor: "white", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 14, padding: 14, gap: 6, width: "48%" },
    statMain: { width: "100%", borderColor: "#FED7AA", backgroundColor: "#FFF7ED" },
    statLabel: { color: "#6B7280", fontWeight: "700", fontSize: 12 },
    statValue: { fontSize: 26, fontWeight: "900", color: "#111827" },
    statCaption: { color: "#374151", fontSize: 12 },

    recentSection: { gap: 10 },
    recentHeader: { gap: 4 },
    recentTitle: { fontSize: 18, fontWeight: "900", color: "#111827" },
    recentSubtitle: { color: "#6B7280" },

    recentRow: { backgroundColor: "white", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 14, padding: 12, flexDirection: "row", gap: 12, alignItems: "center" },
    thumb: { width: 56, height: 56, borderRadius: 12, backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center", overflow: "hidden" },
    noPhoto: { color: "#9CA3AF", fontSize: 22, fontWeight: "900" },
    recentDesc: { fontWeight: "700", color: "#111827", marginBottom: 8 },

    recentMeta: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    badge: { borderWidth: 1, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999 },
    badgeText: { fontSize: 12, fontWeight: "800", color: "#111827" },
    recentDate: { color: "#6B7280", fontSize: 12, fontWeight: "700" },

    empty: { backgroundColor: "white", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 14, padding: 14, gap: 10 },
    emptyText: { color: "#374151", fontWeight: "700" },
    secondaryBtn: { backgroundColor: "#FFF7ED", borderWidth: 1, borderColor: ORANGE, paddingVertical: 10, borderRadius: 10, alignItems: "center" },
    secondaryBtnText: { color: ORANGE, fontWeight: "900" },
});