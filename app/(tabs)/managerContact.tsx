import React, { useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ActivityIndicator,
    FlatList,
    ScrollView,
    Alert,
} from "react-native";
import { useAuth } from "@/app/providers/AuthProvider";

const API_URL = process.env.EXPO_PUBLIC_API_URL as string;
const ORANGE = "#F97316";

type ContactItem = {
    _id: string;
    title: string;
    message: string;
    email: string;
    date: string | number;
    user: string;
    status: "envoye" | "en_cours" | "traite";
};

const STATUS_OPTIONS: ContactItem["status"][] = ["envoye", "en_cours" , "traite"];

export default function ContactScreen() {
    const { token, user } = useAuth();
    const canUseApi = useMemo(() => !!API_URL && !!token, [token]);

    const [contacts, setContacts] = useState<ContactItem[]>([]);
    const [selectedContact, setSelectedContact] = useState<ContactItem | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    async function loadContacts() {
        if (!token) return;

        try {
            setLoading(true);
            setErr(null);

            const res = await fetch(`${API_URL}/api/gestionnaire/contact`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.error || "Impossible de charger les contacts");
            }

            const list = Array.isArray(data) ? data : data.contacts ?? [];
            setContacts(list);

            if (list.length > 0) {
                setSelectedContact((prev) => {
                    if (!prev) return list[0];
                    const found = list.find((c: ContactItem) => c._id === prev._id);
                    return found ?? list[0];
                });
            } else {
                setSelectedContact(null);
            }
        } catch (e: any) {
            setErr(e?.message ?? "Erreur");
        } finally {
            setLoading(false);
        }
    }

    async function updateStatus(contactId: string, status: ContactItem["status"]) {
        if (!token) return;

        try {
            setSaving(true);

            const res = await fetch(`${API_URL}/api/gestionnaire/contact/${contactId}/modifier`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.error || "Impossible de mettre à jour le statut");
            }

            setContacts((prev) =>
                prev.map((contact) =>
                    contact._id === contactId ? { ...contact, status } : contact
                )
            );

            setSelectedContact((prev) =>
                prev && prev._id === contactId ? { ...prev, status } : prev
            );

            Alert.alert("Succès", "Statut mis à jour.");
        } catch (e: any) {
            Alert.alert("Erreur", e?.message ?? "Erreur inconnue");
        } finally {
            setSaving(false);
        }
    }

    useEffect(() => {
        if (canUseApi && user?.role === "gestionnaire") {
            loadContacts();
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
        <View style={styles.screen}>
            <Text style={styles.pageTitle}>Contacts</Text>

            {loading ? <ActivityIndicator style={{ marginBottom: 12 }} /> : null}
            {err ? <Text style={styles.error}>{err}</Text> : null}

            <View style={styles.layout}>
                <View style={styles.listCard}>
                    <View style={styles.listHeader}>
                        <Text style={styles.sectionTitle}>Liste des contacts</Text>

                        <Pressable style={styles.secondaryBtn} onPress={loadContacts} disabled={loading}>
                            <Text style={styles.secondaryBtnText}>Rafraîchir</Text>
                        </Pressable>
                    </View>

                    {contacts.length === 0 ? (
                        <Text style={styles.emptyText}>Aucun contact pour le moment.</Text>
                    ) : (
                        <FlatList
                            data={contacts}
                            keyExtractor={(item) => item._id}
                            renderItem={({ item }) => {
                                const active = selectedContact?._id === item._id;

                                return (
                                    <Pressable
                                        onPress={() => setSelectedContact(item)}
                                        style={[styles.contactRow, active && styles.contactRowActive]}
                                    >
                                        <Text style={styles.contactTitle} numberOfLines={1}>
                                            {item.title}
                                        </Text>
                                        <Text style={styles.contactMeta}>{item.email}</Text>
                                        <Text style={styles.contactMeta}>{formatDate(item.date)}</Text>

                                        <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
                                            <Text style={styles.statusBadgeText}>{item.status}</Text>
                                        </View>
                                    </Pressable>
                                );
                            }}
                        />
                    )}
                </View>

                <ScrollView style={styles.detailCard} contentContainerStyle={{ gap: 12 }}>
                    <Text style={styles.sectionTitle}>Détail du contact</Text>

                    {!selectedContact ? (
                        <Text style={styles.emptyText}>Sélectionne un contact.</Text>
                    ) : (
                        <>
                            <View style={styles.detailBlock}>
                                <Text style={styles.label}>Titre</Text>
                                <Text style={styles.value}>{selectedContact.title}</Text>
                            </View>

                            <View style={styles.detailBlock}>
                                <Text style={styles.label}>Email</Text>
                                <Text style={styles.value}>{selectedContact.email}</Text>
                            </View>

                            <View style={styles.detailBlock}>
                                <Text style={styles.label}>Date</Text>
                                <Text style={styles.value}>{formatDate(selectedContact.date)}</Text>
                            </View>

                            <View style={styles.detailBlock}>
                                <Text style={styles.label}>Message</Text>
                                <Text style={styles.value}>{selectedContact.message}</Text>
                            </View>

                            <View style={styles.detailBlock}>
                                <Text style={styles.label}>Statut actuel</Text>
                                <Text style={styles.value}>{selectedContact.status}</Text>
                            </View>

                            <View style={styles.actionsWrap}>
                                {STATUS_OPTIONS.map((status) => {
                                    const active = selectedContact.status === status;

                                    return (
                                        <Pressable
                                            key={status}
                                            disabled={saving || active}
                                            onPress={() => updateStatus(selectedContact._id, status)}
                                            style={[
                                                styles.statusButton,
                                                active ? styles.statusButtonActive : styles.statusButtonInactive,
                                                (saving || active) && styles.disabledButton,
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.statusButtonText,
                                                    active && styles.statusButtonTextActive,
                                                ]}
                                            >
                                                {status}
                                            </Text>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        </>
                    )}
                </ScrollView>
            </View>
        </View>
    );
}

function formatDate(date: string | number) {
    return new Date(date).toLocaleString("fr-FR");
}

function getStatusStyle(status: ContactItem["status"]) {
    switch (status) {
        case "envoye":
            return { backgroundColor: "#FEF3C7" };
        case "en_cours":
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
        padding: 16,
        paddingTop: 36,
    },
    center: {
        flex: 1,
        backgroundColor: "#F5F5F7",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: "800",
        marginBottom: 16,
        color: "#111827",
    },
    title: {
        fontSize: 24,
        fontWeight: "800",
        color: "#111827",
    },
    subtitle: {
        marginTop: 6,
        color: "#6B7280",
        textAlign: "center",
    },
    error: {
        color: "#DC2626",
        marginBottom: 12,
    },
    layout: {
        flex: 1,
        gap: 12,
    },
    listCard: {
        backgroundColor: "white",
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        maxHeight: 300,
    },
    detailCard: {
        flex: 1,
        backgroundColor: "white",
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    listHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
        gap: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#111827",
    },
    emptyText: {
        color: "#6B7280",
    },
    contactRow: {
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        marginBottom: 10,
        backgroundColor: "#FFFFFF",
    },
    contactRowActive: {
        borderColor: ORANGE,
        backgroundColor: "#FFF7ED",
    },
    contactTitle: {
        fontWeight: "700",
        color: "#111827",
        marginBottom: 4,
    },
    contactMeta: {
        fontSize: 12,
        color: "#6B7280",
        marginBottom: 2,
    },
    statusBadge: {
        alignSelf: "flex-start",
        marginTop: 6,
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 999,
    },
    statusBadgeText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#111827",
    },
    detailBlock: {
        gap: 4,
    },
    label: {
        fontSize: 13,
        fontWeight: "700",
        color: "#6B7280",
    },
    value: {
        fontSize: 15,
        color: "#111827",
    },
    actionsWrap: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 8,
    },
    statusButton: {
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 10,
        borderWidth: 1,
    },
    statusButtonActive: {
        backgroundColor: ORANGE,
        borderColor: ORANGE,
    },
    statusButtonInactive: {
        backgroundColor: "#FFFFFF",
        borderColor: "#E5E7EB",
    },
    statusButtonText: {
        fontWeight: "700",
        color: "#111827",
    },
    statusButtonTextActive: {
        color: "white",
    },
    disabledButton: {
        opacity: 0.6,
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
});