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
import {router, useLocalSearchParams} from "expo-router";
import { useAuth } from "@/app/providers/AuthProvider";

const API_URL = process.env.EXPO_PUBLIC_API_URL as string;
const ORANGE = "#F97316";

export default function AddMemberScreen() {
    const { token, user } = useAuth();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const { teamId } = useLocalSearchParams();

    const canSubmit = useMemo(() => {
        return email.trim().includes("@") && !!token;
    }, [email, token]);

    async function submit() {
        if (!token) return;

        try {
            setLoading(true);

            const res = await fetch(`${API_URL}/api/agent/equipe/${teamId}/modifier`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    Action: "add"
                },
                body: JSON.stringify({
                    email: email.trim().toLowerCase(),
                    action: "add"
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Erreur");

            Alert.alert("Succès", "Agent ajouté à l’équipe.");
            router.back();
        } catch (e: any) {
            Alert.alert("Erreur", e.message);
        } finally {
            setLoading(false);
        }
    }

    if (!user?.isTeamLeader) {
        return (
            <View style={styles.container}>
                <Text>Accès réservé au chef d’équipe.</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Ajouter un agent</Text>

                <Pressable style={styles.backBtn} onPress={() => router.back()}>
                    <Text style={styles.backBtnText}>Retour</Text>
                </Pressable>
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>Email de l’agent</Text>

                <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="ex : agent@ville.fr"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    style={styles.input}
                />

                <Pressable
                    style={[
                        styles.primaryBtn,
                        (!canSubmit || loading) && { opacity: 0.5 },
                    ]}
                    disabled={!canSubmit || loading}
                    onPress={submit}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.primaryBtnText}>Ajouter</Text>
                    )}
                </Pressable>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: "#F5F5F7",
        padding: 20,
        paddingTop: 45
    },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },

    title: {
        fontSize: 24,
        fontWeight: "800",
    },

    backBtn: {
        backgroundColor: "#E5E7EB",
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 10,
    },

    backBtnText: {
        fontWeight: "600",
    },

    card: {
        backgroundColor: "white",
        borderRadius: 16,
        padding: 20,
        gap: 14,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
    },

    label: {
        fontWeight: "600",
        fontSize: 14,
    },

    input: {
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 12,
        padding: 14,
        backgroundColor: "#FAFAFA",
    },

    primaryBtn: {
        backgroundColor: ORANGE,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 10,
    },

    primaryBtnText: {
        color: "white",
        fontWeight: "800",
    },
});