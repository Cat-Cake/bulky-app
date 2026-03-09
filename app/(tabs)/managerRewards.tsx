import React, { useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ActivityIndicator,
    FlatList,
    Alert,
    Image,
    ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/app/providers/AuthProvider";

const API_URL = process.env.EXPO_PUBLIC_API_URL as string;
const ORANGE = "#F97316";

type Reward = {
    _id: string;
    name: string;
    description: string;
    partner: string;
    category: string;
    cost: number;
    image?: string;
    active: boolean;
    createdAt?: string;
    updatedAt?: string;
};

export default function RewardsScreen() {
    const { token, user } = useAuth();
    const canUseApi = useMemo(() => !!API_URL && !!token, [token]);

    const [rewards, setRewards] = useState<Reward[]>([]);
    const [loading, setLoading] = useState(false);
    const [savingId, setSavingId] = useState<string | null>(null);
    const [err, setErr] = useState<string | null>(null);

    async function loadRewards() {
        if (!token) return;

        try {
            setLoading(true);
            setErr(null);

            const res = await fetch(`${API_URL}/api/gestionnaire/recompenses`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.error || "Impossible de charger les récompenses");
            }

            const list = Array.isArray(data) ? data : data.rewards ?? [];
            setRewards(list);
        } catch (e: any) {
            setErr(e?.message ?? "Erreur");
        } finally {
            setLoading(false);
        }
    }

    async function toggleReward(rewardId: string) {
        if (!token) return;

        try {
            setSavingId(rewardId);

            const res = await fetch(`${API_URL}/api/gestionnaire/recompenses/${rewardId}/toggle`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.error || "Impossible de modifier le statut");
            }

            setRewards((prev) =>
                prev.map((reward) =>
                    reward._id === rewardId
                        ? { ...reward, active: !reward.active }
                        : reward
                )
            );
        } catch (e: any) {
            Alert.alert("Erreur", e?.message ?? "Erreur inconnue");
        } finally {
            setSavingId(null);
        }
    }

    useEffect(() => {
        if (canUseApi && user?.role === "gestionnaire") {
            loadRewards();
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
                    <Text style={styles.title}>Récompenses</Text>
                    <Text style={styles.subtitle}>
                        Gère le catalogue des récompenses partenaires.
                    </Text>
                </View>

                <Pressable
                    style={styles.primaryBtn}
                    onPress={() => router.push("/(manager)/reward-create")}
                >
                    <Text style={styles.primaryBtnText}>Nouvelle récompense</Text>
                </Pressable>
            </View>

            <View style={styles.toolbar}>
                <Pressable style={styles.secondaryBtn} onPress={loadRewards} disabled={loading}>
                    <Text style={styles.secondaryBtnText}>
                        {loading ? "Chargement..." : "Rafraîchir"}
                    </Text>
                </Pressable>
            </View>

            {err ? <Text style={styles.error}>{err}</Text> : null}

            {loading ? (
                <ActivityIndicator style={{ marginTop: 20 }} />
            ) : rewards.length === 0 ? (
                <View style={styles.emptyCard}>
                    <Text style={styles.emptyTitle}>Aucune récompense</Text>
                    <Text style={styles.emptyText}>
                        Crée une première récompense pour alimenter le catalogue.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={rewards}
                    keyExtractor={(item) => item._id}
                    scrollEnabled={false}
                    contentContainerStyle={{ gap: 12 }}
                    renderItem={({ item }) => {
                        const imageUrl =
                            item.image && item.image.startsWith("http")
                                ? item.image
                                : item.image
                                    ? `${API_URL}${item.image}`
                                    : null;

                        return (
                            <View style={styles.card}>
                                <View style={styles.cardTop}>
                                    <View style={styles.imageWrap}>
                                        {imageUrl ? (
                                            <Image source={{ uri: imageUrl }} style={styles.image} />
                                        ) : (
                                            <View style={[styles.image, styles.imagePlaceholder]}>
                                                <Text style={styles.imagePlaceholderText}>🎁</Text>
                                            </View>
                                        )}
                                    </View>

                                    <View style={styles.cardContent}>
                                        <View style={styles.cardHeader}>
                                            <Text style={styles.rewardName}>{item.name}</Text>

                                            <View
                                                style={[
                                                    styles.badge,
                                                    item.active ? styles.badgeActive : styles.badgeInactive,
                                                ]}
                                            >
                                                <Text
                                                    style={[
                                                        styles.badgeText,
                                                        item.active ? styles.badgeTextActive : styles.badgeTextInactive,
                                                    ]}
                                                >
                                                    {item.active ? "Active" : "Inactive"}
                                                </Text>
                                            </View>
                                        </View>

                                        <Text style={styles.meta}>Catégorie : {item.category}</Text>
                                        <Text style={styles.meta}>Partenaire : {item.partner}</Text>
                                        <Text style={styles.meta}>Coût : {item.cost} points</Text>

                                        <Text style={styles.description}>{item.description}</Text>
                                    </View>
                                </View>

                                <View style={styles.actionsRow}>
                                    <Pressable
                                        style={styles.editBtn}
                                        onPress={() =>
                                            router.push({
                                                pathname: "/(manager)/reward-edit",
                                                params: { id: item._id },
                                            })
                                        }
                                    >
                                        <Text style={styles.editBtnText}>Modifier</Text>
                                    </Pressable>

                                    <Pressable
                                        style={[
                                            styles.toggleBtn,
                                            item.active ? styles.disableBtn : styles.enableBtn,
                                            savingId === item._id && { opacity: 0.6 },
                                        ]}
                                        onPress={() => toggleReward(item._id)}
                                        disabled={savingId === item._id}
                                    >
                                        <Text style={styles.toggleBtnText}>
                                            {item.active ? "Désactiver" : "Activer"}
                                        </Text>
                                    </Pressable>
                                </View>
                            </View>
                        );
                    }}
                />
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#F5F5F7",
    },
    container: {
        padding: 16,
        paddingTop: 36,
        paddingBottom: 28,
        gap: 12,
    },
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F5F5F7",
        padding: 16,
    },
    header: {
        gap: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: "800",
        color: "#111827",
    },
    subtitle: {
        marginTop: 4,
        color: "#6B7280",
    },
    toolbar: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    error: {
        color: "#DC2626",
        marginTop: 4,
    },
    primaryBtn: {
        backgroundColor: ORANGE,
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 10,
        alignSelf: "flex-start",
    },
    primaryBtnText: {
        color: "white",
        fontWeight: "800",
    },
    secondaryBtn: {
        backgroundColor: "#FFF7ED",
        borderWidth: 1,
        borderColor: ORANGE,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 10,
        alignItems: "center",
    },
    secondaryBtnText: {
        color: ORANGE,
        fontWeight: "900",
    },
    emptyCard: {
        backgroundColor: "white",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 6,
    },
    emptyText: {
        color: "#6B7280",
    },
    card: {
        backgroundColor: "white",
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        gap: 12,
    },
    cardTop: {
        flexDirection: "row",
        gap: 12,
    },
    imageWrap: {
        width: 72,
    },
    image: {
        width: 72,
        height: 72,
        borderRadius: 12,
        resizeMode: "cover",
    },
    imagePlaceholder: {
        backgroundColor: "#FFF7ED",
        alignItems: "center",
        justifyContent: "center",
    },
    imagePlaceholderText: {
        fontSize: 26,
    },
    cardContent: {
        flex: 1,
        gap: 4,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 10,
        alignItems: "flex-start",
    },
    rewardName: {
        flex: 1,
        fontSize: 18,
        fontWeight: "800",
        color: "#111827",
    },
    meta: {
        color: "#6B7280",
        fontSize: 13,
    },
    description: {
        marginTop: 4,
        color: "#111827",
    },
    badge: {
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 999,
    },
    badgeActive: {
        backgroundColor: "#DCFCE7",
    },
    badgeInactive: {
        backgroundColor: "#FEE2E2",
    },
    badgeText: {
        fontSize: 12,
        fontWeight: "700",
    },
    badgeTextActive: {
        color: "#166534",
    },
    badgeTextInactive: {
        color: "#991B1B",
    },
    actionsRow: {
        flexDirection: "row",
        gap: 10,
    },
    editBtn: {
        flex: 1,
        backgroundColor: "#FFF7ED",
        borderWidth: 1,
        borderColor: ORANGE,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: "center",
    },
    editBtnText: {
        color: ORANGE,
        fontWeight: "800",
    },
    toggleBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: "center",
    },
    enableBtn: {
        backgroundColor: "#16A34A",
    },
    disableBtn: {
        backgroundColor: "#DC2626",
    },
    toggleBtnText: {
        color: "white",
        fontWeight: "800",
    },
});