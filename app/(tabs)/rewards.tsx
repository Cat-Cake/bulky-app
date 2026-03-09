import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Button, ScrollView, Alert, Pressable } from "react-native";
import { useAuth } from "@/app/providers/AuthProvider";
import { StyleSheet } from "react-native";

const ORANGE = "#F97316";
const BG = "#F5F5F7";
const CARD = "#FFFFFF";
const TEXT_DARK = "#111827";
const GRAY = "#6B7280";
const SOFT = "#E5E7EB";

const API_URL = process.env.EXPO_PUBLIC_API_URL as string;

type Reward = {
    _id: string;
    name: string;
    description?: string;
    category?: string;
    partner?: string;
    cost: number;
};

export default function CitizenRewardsScreen() {
    const { token, user } = useAuth();

    const [rewards, setRewards] = useState<Reward[]>([]);
    const [loading, setLoading] = useState(false);
    const [flash, setFlash] = useState<{ type: "success" | "error"; message: string } | null>(null);

    const points = user?.point ?? 0;

    const canUseApi = useMemo(() => !!API_URL && !!token, [token]);

    async function loadRewards() {
        if (!token) return;

        try {
            setLoading(true);
            setFlash(null);

            const res = await fetch(`${API_URL}/api/recompenses`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();
            console.log(data)
            if (!res.ok) throw new Error(data?.error || "Impossible de charger les récompenses");

            setRewards(Array.isArray(data) ? data : data.rewards ?? []);
        } catch (e: any) {
            setFlash({ type: "error", message: e?.message ?? "Erreur" });
        } finally {
            setLoading(false);
        }
    }

    async function redeemReward(id: string, cost: number) {
        if (!token) return;

        if (points < cost) {
            setFlash({ type: "error", message: `Il te manque ${cost - points} points.` });
            return;
        }

        try {
            setLoading(true);
            setFlash(null);

            const res = await fetch(`${API_URL}/api/recompenses/${id}/echanger`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json().catch(() => null);

            if (!res.ok) {
                throw new Error(data?.error || "Échange impossible");
            }

            setFlash({
                type: "success",
                message: data?.message || "Récompense échangée ! Un coupon te sera envoyé.",
            });

            await loadRewards();
        } catch (e: any) {
            setFlash({ type: "error", message: e?.message ?? "Erreur" });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (canUseApi) loadRewards();
    }, [canUseApi]);

    if (!token) {
        return (
            <View style={{ padding: 16, gap: 10 }}>
                <Text>Tu dois être connecté pour voir les récompenses.</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
            <Text style={styles.title}>Mes récompenses</Text>

            <View style={styles.pointsRow}>
                <Text style={styles.pointsLabel}>Points disponibles</Text>
                <Text style={styles.pointsValue}>{points}</Text>
            </View>

            <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>Comment ça marche ?</Text>
                <Text style={styles.bullet}>• Choisis une récompense dans la liste.</Text>
                <Text style={styles.bullet}>• Si tu as assez de points, échange-les.</Text>
                <Text style={styles.bullet}>• Un coupon te sera envoyé par mail sous 24h.</Text>
            </View>

            <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>Catalogue</Text>
            </View>

            {rewards.length === 0 ? (
                <Text style={styles.emptyText}>Aucune récompense disponible pour le moment.</Text>
            ) : (
                rewards.map((r) => {
                    const canClaim = points >= r.cost;

                    return (
                        <View key={r._id} style={styles.rewardCard}>
                            <View style={styles.rewardHeader}>
                                <Text style={styles.rewardName}>{r.name}</Text>
                                {r.category ? (
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>{r.category}</Text>
                                    </View>
                                ) : null}
                            </View>

                            {r.partner ? <Text style={styles.meta}>Partenaire : {r.partner}</Text> : null}
                            {r.description ? <Text style={styles.description}>{r.description}</Text> : null}

                            <View style={styles.costRow}>
                                <Text style={styles.costLabel}>Coût</Text>
                                <Text style={styles.costValue}>{r.cost} pts</Text>
                            </View>

                            <Pressable
                                onPress={() => redeemReward(r._id, r.cost)}
                                disabled={!canClaim || loading}
                                style={[
                                    styles.claimBtn,
                                    (!canClaim || loading) && styles.claimBtnDisabled,
                                ]}
                            >
                                <Text style={styles.claimBtnText}>
                                    {canClaim ? "Échanger mes points" : `Il manque ${r.cost - points} pts`}
                                </Text>
                            </Pressable>
                        </View>
                    );
                })
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: BG, paddingTop: 35 },
    container: { padding: 16, paddingBottom: 28, gap: 12 },

    title: { fontSize: 22, fontWeight: "800", color: TEXT_DARK },

    pointsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "baseline",
        padding: 14,
        borderRadius: 16,
        backgroundColor: CARD,
        borderWidth: 1,
        borderColor: SOFT,
    },
    pointsLabel: { color: GRAY, fontWeight: "700" },
    pointsValue: { color: ORANGE, fontSize: 22, fontWeight: "900" },

    infoCard: {
        backgroundColor: "#FFF7ED",
        borderWidth: 1,
        borderColor: "#FED7AA",
        borderRadius: 16,
        padding: 14,
        gap: 8,
    },
    infoTitle: { fontWeight: "900", color: TEXT_DARK },
    bullet: { color: TEXT_DARK, lineHeight: 20 },

    sectionTitleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 6,
    },
    sectionTitle: { fontSize: 18, fontWeight: "800", color: TEXT_DARK },

    emptyText: { color: GRAY, fontStyle: "italic", marginTop: 6 },

    rewardCard: {
        backgroundColor: CARD,
        borderWidth: 1,
        borderColor: SOFT,
        borderRadius: 16,
        padding: 14,
        gap: 6,
    },
    rewardHeader: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
    rewardName: { fontWeight: "900", color: TEXT_DARK, flex: 1 },
    badge: {
        backgroundColor: "#FFF7ED",
        borderWidth: 1,
        borderColor: "#FED7AA",
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 999,
    },
    badgeText: { color: ORANGE, fontWeight: "900", fontSize: 12 },

    meta: { color: GRAY },
    description: { color: TEXT_DARK, lineHeight: 20 },

    costRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
    costLabel: { color: GRAY, fontWeight: "700" },
    costValue: { color: TEXT_DARK, fontWeight: "900" },

    claimBtn: {
        marginTop: 10,
        backgroundColor: ORANGE,
        paddingVertical: 12,
        borderRadius: 14,
        alignItems: "center",
    },
    claimBtnDisabled: { opacity: 0.55 },
    claimBtnText: { color: "#fff", fontWeight: "900" },

    claimBtnAlt: {
        marginTop: 10,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: ORANGE,
        paddingVertical: 12,
        borderRadius: 14,
        alignItems: "center",
    },
    claimBtnAltText: { color: ORANGE, fontWeight: "900" },
});