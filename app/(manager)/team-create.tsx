import React, { useMemo, useState } from "react";
import {
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
    ActivityIndicator,
    Alert,
    ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/app/providers/AuthProvider";
import { Picker } from "@react-native-picker/picker";

const API_URL = process.env.EXPO_PUBLIC_API_URL as string;
const ORANGE = "#F97316";
const BG = "#F5F5F7";
const CARD = "#FFFFFF";
const TEXT_DARK = "#111827";
const GRAY = "#6B7280";
const SOFT = "#E5E7EB";

export default function UserCreateScreen() {
    const { token, user } = useAuth();

    const [name, setName] = useState("");
    const [leader, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const canSubmit = useMemo(() => {
        return (
            !!token &&
            name.trim().length > 0 &&
            leader.trim().length > 3
        );
    }, [token, name, leader]);

    async function submit() {
        if (!token || !canSubmit) {
            Alert.alert("Formulaire incomplet", "Merci de remplir tous les champs obligatoires.");
            return;
        }

        try {
            setLoading(true);

            const payload = {
                name: name.trim(),
                leader: leader.toLowerCase(),
            };

            const res = await fetch(`${API_URL}/api/gestionnaire/equipe/nouveau`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.error || "Impossible de créer l'équipe");
            }

            Alert.alert("Succès", "Équipe créé avec succès.");
            router.back();
        } catch (e: any) {
            Alert.alert("Erreur", e?.message ?? "Erreur inconnue");
        } finally {
            setLoading(false);
        }
    }

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
                <Text style={styles.title}>Créer une équipe</Text>
                <Pressable style={styles.backBtn} onPress={() => router.back()}>
                    <Text style={styles.backBtnText}>Retour</Text>
                </Pressable>
            </View>

            <View style={styles.card}>
                <View style={styles.field}>
                    <Text style={styles.label}>Nom *</Text>
                    <TextInput
                        value={name}
                        onChangeText={setName}
                        placeholder="Ex : Jean"
                        placeholderTextColor={GRAY}
                        style={styles.input}
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>Email *</Text>
                    <TextInput
                        value={leader}
                        onChangeText={setEmail}
                        placeholder="Ex : jean@exemple.com"
                        placeholderTextColor={GRAY}
                        style={styles.input}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                <Pressable
                    style={[styles.primaryBtn, (!canSubmit || loading) && styles.primaryBtnDisabled]}
                    onPress={submit}
                    disabled={!canSubmit || loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.primaryBtnText}>Créer l'équipe</Text>
                    )}
                </Pressable>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: BG },
    container: { padding: 16, paddingTop: 36, paddingBottom: 28, gap: 12 },
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: BG,
        padding: 16,
    },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    title: { fontSize: 24, fontWeight: "800", color: TEXT_DARK },
    subtitle: { marginTop: 6, color: GRAY, textAlign: "center" },
    backBtn: {
        backgroundColor: "#FFF7ED",
        borderWidth: 1,
        borderColor: ORANGE,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 12,
    },
    backBtnText: { color: ORANGE, fontWeight: "800" },
    card: {
        backgroundColor: CARD,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: SOFT,
        gap: 14,
    },
    field: { gap: 6 },
    label: { fontSize: 14, fontWeight: "700", color: TEXT_DARK },
    input: {
        borderWidth: 1,
        borderColor: SOFT,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: "#fff",
        color: TEXT_DARK,
    },
    pickerWrapper: {
        borderWidth: 1,
        borderColor: SOFT,
        borderRadius: 12,
        backgroundColor: "#fff",
        overflow: "hidden",
    },
    primaryBtn: {
        backgroundColor: ORANGE,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: "center",
        marginTop: 6,
    },
    primaryBtnDisabled: { opacity: 0.6 },
    primaryBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
});