import React, { useEffect, useMemo, useState } from "react";
import {View, Text, Pressable, ActivityIndicator, StyleSheet} from "react-native";
import { useAuth } from "@/app/providers/AuthProvider";
import {router} from "expo-router";


const API_URL = process.env.EXPO_PUBLIC_API_URL as string;

type Member = {
    _id: string;
    firstname: string;
    lastname: string;
    role: string;
    isTeamLeader?: boolean;
};

type Team = {
    _id: string;
    name: string;
    leader?: {
        firstname: string;
        lastname: string;
    };
    members: Member[];
};

export default function TeamScreen() {
    const { token, user } = useAuth();
    const canUseApi = useMemo(() => !!API_URL && !!token, [token]);

    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(false);
    const [flash, setFlash] =
        useState<{ type: "success" | "error"; message: string } | null>(null);

    async function loadTeam() {
        if (!token) return;

        try {
            setLoading(true);
            setFlash(null);

            const res = await fetch(`${API_URL}/api/agent/equipe`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Impossible de charger l'équipe");

            const t = data?.team ?? data;
            setTeams(t ? [t] : []);
        } catch (e: any) {
            setFlash({ type: "error", message: e?.message ?? "Erreur" });
            setTeams([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (canUseApi) loadTeam();
    }, [canUseApi]);

    if (user?.role !== "agent") {
        return (
            <View style={{ padding: 16 }}>
                <Text>Cette page est réservée aux agents.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.pageTitle}>Équipe</Text>

            {loading && <ActivityIndicator style={{ marginVertical: 10 }} />}

            {flash && (
                <Text style={{ color: flash.type === "error" ? "red" : "green" }}>
                    {flash.message}
                </Text>
            )}

            {teams.length === 0 ? (
                <Text style={{ marginTop: 10 }}>
                    Vous n'êtes affecté à aucune équipe.
                </Text>
            ) : (
                teams.map((team) => (
                    <View key={team._id} style={styles.card}>

                        <Text style={styles.teamTitle}>
                            Membres de l'équipe {team.name}
                        </Text>

                        {user.isTeamLeader && (
                            <Pressable style={styles.primaryBtn} onPress={() =>
                                router.push({
                                    pathname: "/(agent)/team-add-member",
                                    params: { teamId: team._id },
                                })
                            }>
                                <Text style={styles.primaryBtnText}>
                                    Ajouter dans l'équipe
                                </Text>
                            </Pressable>
                        )}

                        <View style={styles.tableHeader}>
                            <Text style={[styles.headerCell, { flex: 2 }]}>
                                Nom Prénom
                            </Text>
                            <Text style={[styles.headerCell, { flex: 1 }]}>
                                Rôle
                            </Text>
                        </View>

                        {(team.members ?? []).map((m) => (
                            <View
                                key={`${team._id}-${m._id}`}
                                style={styles.tableRow}
                            >
                                <Text style={{ flex: 2 }}>
                                    {m.lastname} {m.firstname}
                                </Text>
                                <Text style={{ flex: 1 }}>
                                    {m.isTeamLeader ? "Chef d'équipe" : m.role}
                                </Text>
                            </View>
                        ))}
                    </View>
                ))
            )}
        </View>
    );
}

const ORANGE = "#F97316";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F7",
        padding: 16,
        paddingTop: 35
    },

    pageTitle: {
        fontSize: 26,
        fontWeight: "800",
        marginBottom: 16,
    },

    card: {
        backgroundColor: "white",
        borderRadius: 16,
        padding: 16,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
    },

    teamTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 12,
    },

    primaryBtn: {
        backgroundColor: ORANGE,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 8,
        alignSelf: "flex-start",
        marginBottom: 16,
    },

    primaryBtnText: {
        color: "white",
        fontWeight: "700",
    },

    tableHeader: {
        flexDirection: "row",
        backgroundColor: "#F3F4F6",
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 8,
        marginBottom: 4,
    },

    headerCell: {
        fontWeight: "700",
        color: "#374151",
    },

    tableRow: {
        flexDirection: "row",
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderColor: "#E5E7EB",
    },
});