import React, { useState } from "react";
import { View, Text, Button, Alert } from "react-native";
import MapView, { Marker, MapPressEvent } from "react-native-maps";
import { useLocalSearchParams, router } from "expo-router";
import { reverseGeocode } from "@/services/geocodeService";

export default function PickLocationScreen() {
    const params = useLocalSearchParams<{
        description?: string;
        selectedTypes?: string; // JSON string
        imageUri?: string;
        addressLabel?: string;
    }>();

    const [coord, setCoord] = useState<{ lat: number; lon: number } | null>(null);
    const [loading, setLoading] = useState(false);

    function onMapPress(e: MapPressEvent) {
        const { latitude, longitude } = e.nativeEvent.coordinate;
        setCoord({ lat: latitude, lon: longitude });
    }

    function onPick(lat: number, lon: number, label: string) {
        router.replace({
            pathname: "/(citizen)/report",
            params: {
                description: params.description ?? "",
                selectedTypes: params.selectedTypes ?? "[]",
                imageUri: params.imageUri ?? "",
                addressLabel: label,
                lat: String(lat),
                lon: String(lon),
            },
        });
    }

    async function handleValidate() {
        if (!coord) return;

        try {
            setLoading(true);

            const result: unknown = await reverseGeocode(coord.lat, coord.lon);

            const label =
                typeof result === "string"
                    ? result
                    : typeof (result as any)?.label === "string"
                        ? (result as any).label
                        : "";

            onPick(coord.lat, coord.lon, label);
        } catch (e: any) {
            Alert.alert("Erreur", e?.message ?? "Impossible de récupérer l'adresse");
            onPick(coord.lat, coord.lon, "");
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={{ flex: 1 }}>
            <View style={{ padding: 12, gap: 8 }}>
                <Text style={{ fontSize: 18, fontWeight: "600" }}>Choisis l’emplacement</Text>
                <Text>Tape sur la carte pour placer le point.</Text>
            </View>

            <MapView
                style={{ flex: 1 }}
                initialRegion={{
                    latitude: 49.8941,
                    longitude: 2.2957,
                    latitudeDelta: 0.04,
                    longitudeDelta: 0.04,
                }}
                onPress={onMapPress}
            >
                {coord ? (
                    <Marker
                        coordinate={{ latitude: coord.lat, longitude: coord.lon }}
                        draggable
                        onDragEnd={(e) => {
                            const { latitude, longitude } = e.nativeEvent.coordinate;
                            setCoord({ lat: latitude, lon: longitude });
                        }}
                    />
                ) : null}
            </MapView>

            <View style={{ padding: 12 }}>
                <Button
                    title={
                        !coord
                            ? "Place un point d'abord"
                            : loading
                                ? "Récupération de l'adresse..."
                                : "Valider l'emplacement"
                    }
                    disabled={!coord || loading}
                    onPress={handleValidate}
                />
            </View>
        </View>
    );
}