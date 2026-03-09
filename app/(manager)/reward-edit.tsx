import React, { useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
    ActivityIndicator,
    Alert,
    ScrollView,
    Switch,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/app/providers/AuthProvider";
import { Picker } from "@react-native-picker/picker";

const API_URL = process.env.EXPO_PUBLIC_API_URL as string;
const ORANGE = "#F97316";
const BG = "#F5F5F7";
const CARD = "#FFFFFF";
const TEXT_DARK = "#111827";
const GRAY = "#6B7280";
const SOFT = "#E5E7EB";

const CATEGORIES = [
    { label: "Réduction", value: "reduction" },
    { label: "Bon d'achat", value: "bon_achat" },
    { label: "Cadeau", value: "cadeau" },
    { label: "Avantage", value: "avantage" },
    { label: "Autre", value: "autre" },
];

type Reward = {
    _id: string;
    name: string;
    description: string;
    partner: string;
    category: string;
    cost: number;
    image?: string;
    active: boolean;
};

export default function RewardEditScreen() {
    const { token, user } = useAuth();
    const { id } = useLocalSearchParams<{ id?: string }>();

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [partner, setPartner] = useState("");
    const [category, setCategory] = useState("reduction");
    const [cost, setCost] = useState("");
    const [image, setImage] = useState("/images/reward-default.png");
    const [active, setActive] = useState(true);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const canSubmit = useMemo(() => {
        return (
            !!token &&
            !!id &&
            name.trim().length > 1 &&
            description.trim().length > 3 &&
            partner.trim().length > 1 &&
            category.trim().length > 0 &&
            Number(cost) > 0
        );
    }, [token, id, name, description, partner, category, cost]);

    async function loadReward() {
        if (!token || !id) return;

        try {
            setLoading(true);

            const res = await fetch(`${API_URL}/api/gestionnaire/recompenses/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.error || "Impossible de charger la récompense");
            }

            const reward: Reward = data.reward ?? data;

            setName(reward.name ?? "");
            setDescription(reward.description ?? "");
            setPartner(reward.partner ?? "");
            setCategory(reward.category ?? "reduction");
            setCost(String(reward.cost ?? ""));
            setImage(reward.image ?? "/images/reward-default.png");
            setActive(reward.active ?? true);
        } catch (e: any) {
            Alert.alert("Erreur", e?.message ?? "Erreur inconnue");
            router.back();
        } finally {
            setLoading(false);
        }
    }

    async function submit() {
        if (!token || !id) return;

        if (!canSubmit) {
            Alert.alert("Formulaire incomplet", "Merci de remplir tous les champs obligatoires.");
            return;
        }

        try {
            setSaving(true);

            const payload = {
                name: name.trim(),
                description: description.trim(),
                partner: partner.trim(),
                category: category.trim(),
                cost: Number(cost),
                image: image.trim() || "/images/reward-default.png",
                active,
            };

            const res = await fetch(`${API_URL}/api/gestionnaire/recompenses/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.error || "Impossible de modifier la récompense");
            }

            Alert.alert("Succès", "Récompense modifiée avec succès.");
            router.back();
        } catch (e: any) {
            Alert.alert("Erreur", e?.message ?? "Erreur inconnue");
        } finally {
            setSaving(false);
        }
    }

    useEffect(() => {
        if (id) {
            loadReward();
        }
    }, [id]);

    if (user?.role !== "gestionnaire") {
        return (
            <View style={styles.center}>
                <Text style={styles.title}>Accès refusé</Text>
                <Text style={styles.subtitle}>Cette page est réservée au gestionnaire.</Text>
            </View>
        );
    }

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator />
                <Text style={styles.subtitle}>Chargement de la récompense...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Modifier la récompense</Text>

                <Pressable style={styles.backBtn} onPress={() => router.back()}>
                    <Text style={styles.backBtnText}>Retour</Text>
                </Pressable>
            </View>

            <View style={styles.card}>
                <View style={styles.field}>
                    <Text style={styles.label}>Nom</Text>
                    <TextInput
                        value={name}
                        onChangeText={setName}
                        placeholder="Ex : Bon d'achat 10€"
                        placeholderTextColor={GRAY}
                        style={styles.input}
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Décris la récompense"
                        placeholderTextColor={GRAY}
                        style={[styles.input, styles.textarea]}
                        multiline
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>Partenaire</Text>
                    <TextInput
                        value={partner}
                        onChangeText={setPartner}
                        placeholder="Ex : Test nom"
                        placeholderTextColor={GRAY}
                        style={styles.input}
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>Catégorie</Text>
                    <View style={styles.pickerWrapper}>
                        <Picker selectedValue={category} onValueChange={(value) => setCategory(value)}>
                            {CATEGORIES.map((c) => (
                                <Picker.Item key={c.value} label={c.label} value={c.value} />
                            ))}
                        </Picker>
                    </View>
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>Coût en points</Text>
                    <TextInput
                        value={cost}
                        onChangeText={setCost}
                        placeholder="Ex : 50"
                        placeholderTextColor={GRAY}
                        style={styles.input}
                        keyboardType="numeric"
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>Image</Text>
                    <TextInput
                        value={image}
                        onChangeText={setImage}
                        placeholder="/images/reward-default.png"
                        placeholderTextColor={GRAY}
                        style={styles.input}
                    />
                </View>

                <View style={styles.switchRow}>
                    <Text style={styles.label}>Récompense active</Text>
                    <Switch value={active} onValueChange={setActive} />
                </View>

                <Pressable
                    style={[styles.primaryBtn, (!canSubmit || saving) && styles.primaryBtnDisabled]}
                    onPress={submit}
                    disabled={!canSubmit || saving}
                >
                    {saving ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.primaryBtnText}>Enregistrer les modifications</Text>
                    )}
                </Pressable>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: BG,
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
        backgroundColor: BG,
        padding: 16,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    title: {
        fontSize: 24,
        fontWeight: "800",
        color: TEXT_DARK,
    },
    subtitle: {
        marginTop: 6,
        color: GRAY,
        textAlign: "center",
    },
    backBtn: {
        backgroundColor: "#FFF7ED",
        borderWidth: 1,
        borderColor: ORANGE,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 12,
    },
    backBtnText: {
        color: ORANGE,
        fontWeight: "800",
    },
    card: {
        backgroundColor: CARD,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: SOFT,
        gap: 14,
    },
    field: {
        gap: 6,
    },
    label: {
        fontSize: 14,
        fontWeight: "700",
        color: TEXT_DARK,
    },
    input: {
        borderWidth: 1,
        borderColor: SOFT,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: "#fff",
        color: TEXT_DARK,
    },
    textarea: {
        minHeight: 100,
        textAlignVertical: "top",
    },
    pickerWrapper: {
        borderWidth: 1,
        borderColor: SOFT,
        borderRadius: 12,
        backgroundColor: "#fff",
        overflow: "hidden",
    },
    switchRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    primaryBtn: {
        backgroundColor: ORANGE,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: "center",
        marginTop: 6,
    },
    primaryBtnDisabled: {
        opacity: 0.6,
    },
    primaryBtnText: {
        color: "#fff",
        fontWeight: "800",
        fontSize: 15,
    },
});