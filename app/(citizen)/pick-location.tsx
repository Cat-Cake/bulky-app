import React, { useState } from "react";
import { View, Text, Button } from "react-native";
import MapView, { Marker, MapPressEvent } from "react-native-maps";
import { router } from "expo-router";

export default function PickLocationScreen() {
    const [coord, setCoord] = useState<{ lat: number; lon: number } | null>(null);

    function onMapPress(e: MapPressEvent) {
        const { latitude, longitude } = e.nativeEvent.coordinate;
        setCoord({ lat: latitude, lon: longitude });
    }

    return (
        <View style={{ flex: 1 }}>
            <View style={{ padding: 12, gap: 8 }}>
                <Text style={{ fontSize: 18, fontWeight: "600" }}>Choisis l’emplacement</Text>
                <Text>
                    Tape sur la carte pour placer le point.
                </Text>
            </View>

            <MapView
                style={{ flex: 1 }}
                initialRegion={{
                    latitude: 49.8941,   // Amiens (ex)
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
                    title={coord ? "Valider l'emplacement" : "Place un point d'abord"}
                    disabled={!coord}
                    onPress={() => {
                        if (!coord) return;
                        router.navigate({
                            pathname: "/(citizen)/report",
                            params: {
                                lat: String(coord.lat),
                                lon: String(coord.lon),
                            },
                        });
                    }}
                />
            </View>
        </View>
    );
}