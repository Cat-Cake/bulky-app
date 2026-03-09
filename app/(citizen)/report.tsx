import React, {useEffect, useMemo, useState} from "react";
import {
    View,
    Text,
    TextInput,
    Image,
    Pressable,
    Alert,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    Button
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@/app/providers/AuthProvider";
import { router, useLocalSearchParams } from "expo-router";

const API_URL = process.env.EXPO_PUBLIC_API_URL as string;

const ORANGE = "#F97316";
const BG = "#F5F5F7";
const CARD = "#FFFFFF";
const TEXT_DARK = "#111827";
const GRAY = "#6B7280";
const SOFT = "#E5E7EB";

const TYPES = [
    { key: "meuble", label: "Meuble" },
    { key: "electromenager", label: "Électroménager" },
    { key: "matelas", label: "Matelas" },
    { key: "canape", label: "Canapé" },
    { key: "bois", label: "Bois" },
    { key: "metaux", label: "Métaux" },
    { key: "cartons", label: "Cartons" },
    { key: "gravats", label: "Gravats" },
    { key: "dechets_verts", label: "Déchets verts" },
    { key: "vetements", label: "Vêtements" },
    { key: "dechets_dangereux", label: "Déchets dangereux" },
    { key: "pneus", label: "Pneus" },
    { key: "plastiques_volumineux", label: "Plastiques volumineux" },
];

export default function CreateReportScreen() {
    const { token } = useAuth();

    const params = useLocalSearchParams<{
        lat?: string;
        lon?: string;
        description?: string;
        selectedTypes?: string;
        imageUri?: string;
        addressLabel?: string;
        label?: string;
    }>();

    useEffect(() => {
        if (typeof params.description === "string" && params.description !== description) {
            setDescription(params.description);
        }

        if (typeof params.imageUri === "string" && params.imageUri !== imageUri) {
            setImageUri(params.imageUri);
        }

        if (typeof params.addressLabel === "string" && params.addressLabel !== addressLabel) {
            setAddressLabel(params.addressLabel);
        }

        if (typeof params.selectedTypes === "string") {
            try {
                const parsed = JSON.parse(params.selectedTypes) as string[];

                // évite setSelectedTypes en boucle si identique
                const same =
                    parsed.length === selectedTypes.length &&
                    parsed.every((v, i) => v === selectedTypes[i]);

                if (!same) setSelectedTypes(parsed);
            } catch {
                // ignore
            }
        }
    }, [
        params.description,
        params.imageUri,
        params.addressLabel,
        params.selectedTypes,
    ]);

    const lat = params.lat ? Number(params.lat) : null;
    const lon = params.lon ? Number(params.lon) : null;

    const [description, setDescription] = useState("");
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [addressLabel, setAddressLabel] = useState("");
    const [loading, setLoading] = useState(false);

    const canSubmit = useMemo(() => {
        const hasCoords = Number.isFinite(lat as number) && Number.isFinite(lon as number);
        return description.trim().length > 3 && selectedTypes.length > 0 && !!imageUri && hasCoords && !!token;
    }, [description, selectedTypes, imageUri, lat, lon, token]);

    function toggleType(t: string) {
        setSelectedTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
    }

    async function pickImage() {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) {
            Alert.alert("Permission requise", "Autorise l'accès aux photos pour ajouter une image.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    }

    async function submit() {
        if (!token) return;

        const hasCoords = Number.isFinite(lat as number) && Number.isFinite(lon as number);

        if (!canSubmit || !hasCoords) {
            Alert.alert(
                "Formulaire incomplet",
                "Remplis la description, le type, la photo et sélectionne un point sur la carte."
            );
            return;
        }

        try {
            setLoading(true);

            const form = new FormData();
            form.append("description", description.trim());
            selectedTypes.forEach((t) => form.append("type", t));

            form.append("lat", String(lat));
            form.append("lon", String(lon));

            const labelFromMap = (params.label ?? "").trim();
            const label = labelFromMap.length > 0 ? labelFromMap : addressLabel.trim();
            form.append("address_label", label);

            form.append("picture", {
                uri: imageUri!,
                name: "report.jpg",
                type: "image/jpeg",
            } as any);

            const res = await fetch(`${API_URL}/api/signalement`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: form,
            });

            const text = await res.text();
            if (!res.ok) throw new Error(text || "Erreur lors de l'envoi");

            Alert.alert("Envoyé", "Ton signalement a bien été transmis.");
            router.back();
        } catch (e: any) {
            Alert.alert("Erreur", e.message ?? "Erreur inconnue");
        } finally {
            setLoading(false);
        }
    }

    const hasCoords = Number.isFinite(lat as number) && Number.isFinite(lon as number);

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Nouveau signalement</Text>

                <Pressable style={styles.backBtn} onPress={() => router.push("/citizen")}>
                    <Text style={styles.backBtnText}>Retour</Text>
                </Pressable>
            </View>

            <Text style={[styles.label, { marginTop: 12 }]}>Emplacement</Text>
            <Button
                title="Choisir sur la carte"
                onPress={() =>
                    router.push({
                        pathname: "/pick-location",
                        params: {
                            description,
                            selectedTypes: JSON.stringify(selectedTypes),
                            imageUri: imageUri ?? "",
                            addressLabel,
                        },
                    })
                }
            />

            <View style={[styles.coordsBox, hasCoords ? styles.coordsOk : styles.coordsKo]}>
                <Text style={styles.coordsText}>
                    {hasCoords
                        ? `Point sélectionné : ${lat!.toFixed(5)}, ${lon!.toFixed(5)}`
                        : "Aucun point sélectionné"}
                </Text>
            </View>

            <Text style={[styles.label, { marginTop: 12 }]}>Adresse</Text>
            <TextInput
                value={addressLabel}
                onChangeText={setAddressLabel}
                placeholder="Ex : Rue de la Vallée, Amiens"
                placeholderTextColor={GRAY}
                style={styles.input}
                autoCorrect={false}
            />
            <Text>Veuillez écrire l'adresse si rien n'est ajouté dans le champ</Text>

            <View style={styles.card}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Décris l’encombrant..."
                    placeholderTextColor={GRAY}
                    style={styles.input}
                />

                <Text style={[styles.label, { marginTop: 10 }]}>Types (multi)</Text>
                <View style={styles.chipsWrap}>
                    {TYPES.map((t) => {
                        const active = selectedTypes.includes(t.key);
                        return (
                            <Pressable
                                key={t.key}
                                onPress={() => toggleType(t.key)}
                                style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
                            >
                                <Text style={[styles.chipText, active ? styles.chipTextActive : styles.chipTextInactive]}>
                                    {active ? "✓ " : ""}
                                    {t.label}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>

                <Text style={[styles.label, { marginTop: 12 }]}>Photo</Text>
                <Pressable style={styles.secondaryBtn} onPress={pickImage}>
                    <Text style={styles.secondaryBtnText}>{imageUri ? "Changer la photo" : "Choisir une photo"}</Text>
                </Pressable>

                {imageUri ? <Image source={{ uri: imageUri }} style={styles.preview} /> : null}

                <Pressable
                    style={[styles.primaryBtn, (!canSubmit || loading) && styles.primaryBtnDisabled]}
                    onPress={submit}
                    disabled={!canSubmit || loading}
                >
                    {loading ? (
                        <ActivityIndicator />
                    ) : (
                        <Text style={styles.primaryBtnText}>Envoyer le signalement</Text>
                    )}
                </Pressable>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: BG, paddingTop: 35 },
    container: { padding: 16, paddingBottom: 28, gap: 12 },

    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    title: { fontSize: 22, fontWeight: "800", color: TEXT_DARK },

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
        padding: 14,
        borderWidth: 1,
        borderColor: SOFT,
    },

    label: { fontSize: 14, fontWeight: "700", color: TEXT_DARK, marginBottom: 6 },

    input: {
        borderWidth: 1,
        borderColor: SOFT,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        color: TEXT_DARK,
        backgroundColor: "#fff",
    },

    chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },

    chip: {
        borderRadius: 999,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
    },
    chipInactive: { borderColor: SOFT, backgroundColor: "#fff" },
    chipActive: { borderColor: ORANGE, backgroundColor: "#FFF7ED" },

    chipText: { fontSize: 13, fontWeight: "700" },
    chipTextInactive: { color: TEXT_DARK },
    chipTextActive: { color: ORANGE },

    secondaryBtn: {
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: SOFT,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: "center",
    },
    secondaryBtnText: { color: TEXT_DARK, fontWeight: "700" },

    preview: { width: "100%", height: 190, borderRadius: 12, marginTop: 10, backgroundColor: SOFT },

    coordsBox: {
        marginTop: 10,
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderWidth: 1,
    },
    coordsOk: { borderColor: "#86EFAC", backgroundColor: "#F0FDF4" },
    coordsKo: { borderColor: "#FECACA", backgroundColor: "#FEF2F2" },
    coordsText: { color: TEXT_DARK, fontWeight: "700" },

    primaryBtn: {
        marginTop: 14,
        backgroundColor: ORANGE,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: "center",
    },
    primaryBtnDisabled: { opacity: 0.6 },
    primaryBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },

    helper: { marginTop: 10, fontSize: 12, color: GRAY },
});