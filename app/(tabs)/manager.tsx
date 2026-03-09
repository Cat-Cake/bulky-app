import React, { useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ActivityIndicator,
    ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/app/providers/AuthProvider";

const API_URL = process.env.EXPO_PUBLIC_API_URL as string;
const ORANGE = "#F97316";

type ReportByMonth = {
    _id: {
        year: number;
        month: number;
    };
    count: number;
};

type TeamUser = {
    _id: string;
    firstname?: string;
    lastname?: string;
    email?: string;
};

type Team = {
    _id: string;
    name: string;
    leader?: TeamUser | null;
    members: TeamUser[];
};

type ContactUser = {
    _id: string;
    firstname?: string;
    lastname?: string;
    email?: string;
};

type Contact = {
    _id: string;
    title: string;
    message: string;
    email: string;
    date: string | number;
    status: string;
    user?: ContactUser | null;
};

type ManagerDashboardResponse = {
    reportsByMonth: ReportByMonth[];
    stats: {
        totalReports: number;
        en_cours: number;
        collecte: number;
        refuse: number;
    };
    teams: Team[];
    contacts: Contact[];
};

export default function ManagerScreen() {
    const { token, user, signOut } = useAuth();
    const canUseApi = useMemo(() => !!API_URL && !!token, [token]);

    const [data, setData] = useState<ManagerDashboardResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    async function loadDashboard() {
        if (!token) return;

        try {
            setLoading(true);
            setErr(null);

            const res = await fetch(`${API_URL}/api/gestionnaire`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const json = await res.json();
            if (!res.ok) {
                throw new Error(json?.error || "Impossible de charger le dashboard");
            }

            setData(json);
        } catch (e: any) {
            setErr(e?.message ?? "Erreur");
            setData(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (canUseApi && user?.role === "gestionnaire") {
            loadDashboard();
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

    const totalReports = data?.stats?.totalReports ?? 0;
    const enCours = data?.stats?.en_cours ?? 0;
    const collecte = data?.stats?.collecte ?? 0;
    const refuse = data?.stats?.refuse ?? 0;

    const reportsByMonth = data?.reportsByMonth ?? [];
    const teams = data?.teams ?? [];
    const contacts = data?.contacts ?? [];

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.title}>Tableau de bord gestionnaire</Text>
                    <Text style={styles.subtitle}>
                        Vue globale de l’activité, des équipes et des contacts.
                    </Text>
                </View>

                <Pressable style={styles.secondaryBtn} onPress={loadDashboard}>
                    <Text style={styles.secondaryBtnText}>Rafraîchir</Text>
                </Pressable>
            </View>

            {loading ? <ActivityIndicator style={{ marginBottom: 12 }} /> : null}
            {err ? <Text style={styles.error}>{err}</Text> : null}

            <View style={styles.statsGrid}>
                <StatCard
                    label="Signalements totaux"
                    value={totalReports}
                    caption="Tous les signalements enregistrés"
                    main
                />
                <StatCard
                    label="En cours"
                    value={enCours}
                    caption="Signalements actuellement traités"
                />
                <StatCard
                    label="Traités"
                    value={collecte}
                    caption="Signalements terminés"
                />
                <StatCard
                    label="Refusés"
                    value={refuse}
                    caption="Signalements refusés"
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Évolution mensuelle</Text>
                <Text style={styles.sectionSubtitle}>Nombre de signalements par mois.</Text>

                <View style={styles.card}>
                    {reportsByMonth.length === 0 ? (
                        <Text style={styles.emptyText}>Aucune donnée de signalements pour le moment.</Text>
                    ) : (
                        reportsByMonth.map((item) => (
                            <View key={`${item._id.year}-${item._id.month}`} style={styles.row}>
                                <Text style={styles.rowTitle}>
                                    {String(item._id.month).padStart(2, "0")}/{item._id.year}
                                </Text>
                                <Text style={styles.rowValue}>{item.count}</Text>
                            </View>
                        ))
                    )}
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Équipes</Text>
                <Text style={styles.sectionSubtitle}>Vue d’ensemble des équipes existantes.</Text>

                <View style={styles.card}>
                    {teams.length === 0 ? (
                        <Text style={styles.emptyText}>Aucune équipe pour le moment.</Text>
                    ) : (
                        teams.map((team) => (
                            <View key={team._id} style={styles.block}>
                                <Text style={styles.blockTitle}>{team.name}</Text>
                                <Text style={styles.meta}>
                                    Leader :{" "}
                                    {team.leader
                                        ? `${team.leader.firstname ?? ""} ${team.leader.lastname ?? ""}`.trim()
                                        : "Aucun leader"}
                                </Text>
                                <Text style={styles.meta}>Membres : {team.members?.length ?? 0}</Text>
                            </View>
                        ))
                    )}
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Contacts</Text>
                <Text style={styles.sectionSubtitle}>Derniers messages envoyés par les utilisateurs.</Text>

                <View style={styles.card}>
                    {contacts.length === 0 ? (
                        <Text style={styles.emptyText}>Aucun contact pour le moment.</Text>
                    ) : (
                        contacts.slice(0, 5).map((contact) => (
                            <View key={contact._id} style={styles.block}>
                                <View style={styles.contactHeader}>
                                    <Text style={styles.blockTitle}>{contact.title}</Text>
                                    <View style={[styles.badge, badgeByStatus(contact.status)]}>
                                        <Text style={styles.badgeText}>{contact.status}</Text>
                                    </View>
                                </View>

                                <Text style={styles.meta}>Email : {contact.email}</Text>
                                <Text style={styles.meta}>
                                    Date : {new Date(contact.date).toLocaleString("fr-FR")}
                                </Text>
                                <Text style={styles.message} numberOfLines={3}>
                                    {contact.message}
                                </Text>
                            </View>
                        ))
                    )}
                </View>
            </View>

            <Pressable
                style={styles.logoutBtn}
                onPress={async () => {
                    await signOut();
                    router.replace("/login");
                }}
            >
                <Text style={styles.logoutBtnText}>Se déconnecter</Text>
            </Pressable>
        </ScrollView>
    );
}

function StatCard({
                      label,
                      value,
                      caption,
                      main = false,
                  }: {
    label: string;
    value: number;
    caption: string;
    main?: boolean;
}) {
    return (
        <View style={[styles.statCard, main && styles.statCardMain]}>
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statCaption}>{caption}</Text>
        </View>
    );
}

function badgeByStatus(status: string) {
    switch (status) {
        case "envoye":
            return { backgroundColor: "#FEF3C7" };
        case "lu":
            return { backgroundColor: "#DBEAFE" };
        case "traite":
            return { backgroundColor: "#DCFCE7" };
        default:
            return { backgroundColor: "#E5E7EB" };
    }
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
        gap: 14,
    },
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F5F5F7",
        padding: 16,
    },
    header: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
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
    error: {
        color: "#DC2626",
    },
    statsGrid: {
        gap: 12,
    },
    statCard: {
        backgroundColor: "white",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    statCardMain: {
        backgroundColor: "#FFF7ED",
        borderColor: "#FED7AA",
    },
    statLabel: {
        fontSize: 13,
        color: "#6B7280",
        fontWeight: "700",
    },
    statValue: {
        fontSize: 30,
        fontWeight: "800",
        color: "#111827",
        marginVertical: 8,
    },
    statCaption: {
        fontSize: 12,
        color: "#6B7280",
    },
    section: {
        gap: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: "#111827",
    },
    sectionSubtitle: {
        fontSize: 13,
        color: "#6B7280",
    },
    card: {
        backgroundColor: "white",
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        gap: 10,
    },
    emptyText: {
        color: "#6B7280",
        fontStyle: "italic",
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
    },
    rowTitle: {
        fontWeight: "700",
        color: "#111827",
    },
    rowValue: {
        fontWeight: "800",
        color: ORANGE,
    },
    block: {
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
        gap: 4,
    },
    blockTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#111827",
    },
    meta: {
        fontSize: 13,
        color: "#6B7280",
    },
    message: {
        fontSize: 13,
        color: "#111827",
        marginTop: 4,
    },
    contactHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 8,
        alignItems: "center",
    },
    badge: {
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 999,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#111827",
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
    logoutBtn: {
        backgroundColor: ORANGE,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 8,
    },
    logoutBtnText: {
        color: "white",
        fontWeight: "800",
        fontSize: 15,
    },
});