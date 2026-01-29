import React, { useMemo, useState } from "react";
import { View, Text, TextInput, Button, Image, Pressable, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@/app/providers/AuthProvider";
import { router, useLocalSearchParams } from "expo-router";
import { ScrollView } from "react-native";

const API_URL = process.env.EXPO_PUBLIC_API_URL as string;

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

    // récupère ce que la map renvoie (router.setParams)
    const params = useLocalSearchParams<{
        lat?: string;
        lon?: string;
        label?: string;
    }>();

    const lat = params.lat ? Number(params.lat) : null;
    const lon = params.lon ? Number(params.lon) : null;

    const [description, setDescription] = useState("");
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [imageUri, setImageUri] = useState<string | null>(null);

    // optionnel : juste un texte pour "address.label"
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
            Alert.alert("Formulaire incomplet", "Remplis la description, le type, la photo et sélectionne un point sur la carte.");
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
                headers: {
                    Authorization: `Bearer ${token}`,
                },
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

    return (
        <ScrollView
            contentContainerStyle={{ padding: 16, gap: 12 }}
            keyboardShouldPersistTaps="handled"
        >
            <Text style={{ fontSize: 22, fontWeight: "bold" }}>Nouveau signalement</Text>

            <Button title="Retour" onPress={() => router.push('/citizen')} />

            <Text>Description</Text>
            <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Décris l’encombrant..."
                style={{ borderWidth: 1, padding: 10, borderRadius: 8 }}
            />

            <Text>Types (multi)</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {TYPES.map((t) => {
                    const active = selectedTypes.includes(t.key);
                    return (
                        <Pressable
                            key={t.key}
                            onPress={() => toggleType(t.key)}
                            style={{
                                borderWidth: 1,
                                borderRadius: 999,
                                paddingVertical: 8,
                                paddingHorizontal: 12,
                                opacity: active ? 1 : 0.6,
                            }}
                        >
                            <Text>{active ? "✓ " : ""}{t.label}</Text>
                        </Pressable>
                    );
                })}
            </View>

            <Text>Photo</Text>
            <Button title={imageUri ? "Changer la photo" : "Choisir une photo"} onPress={pickImage} />
            {imageUri ? (
                <Image source={{ uri: imageUri }} style={{ width: "100%", height: 180, borderRadius: 10, marginTop: 8 }} />
            ) : null}

            <Text>Emplacement</Text>
            <Button title="Choisir sur la carte" onPress={() => router.push("/pick-location")} />

            {Number.isFinite(lat as number) && Number.isFinite(lon as number) ? (
                <Text>Point sélectionné : {lat?.toFixed(5)}, {lon?.toFixed(5)}</Text>
            ) : (
                <Text>Aucun point sélectionné</Text>
            )}

            <Text>Adresse</Text>
            <TextInput
                value={addressLabel}
                onChangeText={setAddressLabel}
                placeholder="Ex : Rue de la Vallée, Amiens"
                style={{ borderWidth: 1, padding: 10, borderRadius: 8 }}
                autoCorrect={false}
            />

            <Button
                title={loading ? "Envoi..." : "Envoyer le signalement"}
                onPress={submit}
                disabled={!canSubmit || loading}
            />
        </ScrollView>
    );
}