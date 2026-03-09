import React, { useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ActivityIndicator,
    FlatList,
    Alert,
    ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/app/providers/AuthProvider";

const API_URL = process.env.EXPO_PUBLIC_API_URL as string;
const ORANGE = "#F97316";

type User = {
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
};

type Teams = {
    _id: string;
    name: string;
    leader: User;
    members: User[];
};

export default function TeamScreen() {
    const { token, user } = useAuth();
    const canUseApi = useMemo(() => !!API_URL && !!token, [token]);

    const [teams, setTeams] = useState<Teams[]>([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    async function loadTeams() {
        if (!token) return;

        try {
            setLoading(true);
            setErr(null);

            const res = await fetch(`${API_URL}/api/gestionnaire/equipes`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.error || "Impossible de charger les équipes");
            }

            const list = Array.isArray(data) ? data : data.teams ?? [];
            setTeams(list);
        } catch (e: any) {
            setErr(e?.message ?? "Erreur");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (canUseApi && user?.role === "gestionnaire") {
            loadTeams();
        }
    }, [canUseApi, user?.role]);

    if (user?.role !== "gestionnaire") {
        return (
            <View style={styles.center}>
                <Text style={styles.title}>Accès refusé</Text>
                <Text style={styles.subtitle}>Cette page est réservée au gestionnaire.</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Équipes</Text>
                    <Text style={styles.subtitle}>Gère les équipes.</Text>
                </View>

                <Pressable
                    style={styles.primaryBtn}
                    onPress={() => router.push("/(manager)/team-create")}
                >
                    <Text style={styles.primaryBtnText}>Nouvel équipe</Text>
                </Pressable>
            </View>

            <View style={styles.toolbar}>
                <Pressable style={styles.secondaryBtn} onPress={loadTeams} disabled={loading}>
                    <Text style={styles.secondaryBtnText}>
                        {loading ? "Chargement..." : "Rafraîchir"}
                    </Text>
                </Pressable>
            </View>

            {err ? <Text style={styles.error}>{err}</Text> : null}

            {loading ? (
                <ActivityIndicator style={{ marginTop: 20 }} />
            ) : teams.length === 0 ? (
                <View style={styles.emptyCard}>
                    <Text style={styles.emptyTitle}>Aucune équipe</Text>
                    <Text style={styles.emptyText}>{"Crée une première équipe."}</Text>
                </View>
            ) : (
                <FlatList
                    data={teams}
                    keyExtractor={(item) => item._id}
                    scrollEnabled={false}
                    contentContainerStyle={{ gap: 12 }}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <View style={styles.avatarCircle}>
                                    <Text style={styles.avatarText}>
                                        {(item.name?.[0] ?? "?").toUpperCase()}
                                    </Text>
                                </View>

                                <View style={styles.cardInfo}>
                                    <Text style={styles.userName}>
                                        {item.name}
                                    </Text>
                                    <Text style={styles.userEmail}>Chef : {item.leader.email}</Text>
                                    <Text style={styles.userEmail}>Membres : {item.members.length}</Text>
                                </View>
                            </View>
                        </View>
                    )}
                />
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: "#F5F5F7" },
    container: { padding: 16, paddingTop: 36, paddingBottom: 28, gap: 12 },
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F5F5F7",
        padding: 16,
    },
    header: { gap: 12 },
    title: { fontSize: 24, fontWeight: "800", color: "#111827" },
    subtitle: { marginTop: 4, color: "#6B7280" },
    toolbar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    error: { color: "#DC2626", marginTop: 4 },
    primaryBtn: {
        backgroundColor: ORANGE,
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 10,
        alignSelf: "flex-start",
    },
    primaryBtnText: { color: "white", fontWeight: "800" },
    secondaryBtn: {
        backgroundColor: "#FFF7ED",
        borderWidth: 1,
        borderColor: ORANGE,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 10,
        alignItems: "center",
    },
    secondaryBtnText: { color: ORANGE, fontWeight: "900" },
    emptyCard: {
        backgroundColor: "white",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    emptyTitle: { fontSize: 18, fontWeight: "700", color: "#111827", marginBottom: 6 },
    emptyText: { color: "#6B7280" },
    card: {
        backgroundColor: "white",
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        gap: 10,
    },
    cardHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
    avatarCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#FFF7ED",
        borderWidth: 1,
        borderColor: ORANGE,
        alignItems: "center",
        justifyContent: "center",
    },
    avatarText: { fontSize: 18, fontWeight: "800", color: ORANGE },
    cardInfo: { flex: 1 },
    userName: { fontSize: 16, fontWeight: "700", color: "#111827" },
    userEmail: { fontSize: 13, color: "#6B7280", marginTop: 2 },
    roleBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999 },
    roleGestionnaire: { backgroundColor: "#EDE9FE" },
    roleAgent: { backgroundColor: "#DBEAFE" },
    roleCitoyen: { backgroundColor: "#DCFCE7" },
    roleBadgeText: { fontSize: 12, fontWeight: "700", color: "#374151" },
    metaRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    meta: { color: "#6B7280", fontSize: 13 },
    leaderBadge: {
        backgroundColor: "#FEF9C3",
        color: "#854D0E",
        fontSize: 12,
        fontWeight: "700",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 999,
    },
    actionsRow: { flexDirection: "row", gap: 10 },
    editBtn: {
        flex: 1,
        backgroundColor: "#FFF7ED",
        borderWidth: 1,
        borderColor: ORANGE,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: "center",
    },
    editBtnText: { color: ORANGE, fontWeight: "800" },
    deleteBtn: {
        flex: 1,
        backgroundColor: "#FEE2E2",
        borderWidth: 1,
        borderColor: "#DC2626",
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: "center",
    },
    deleteBtnText: { color: "#DC2626", fontWeight: "800" },
});