import { View, Text, Button } from "react-native";
import { useAuth } from "@/app/providers/AuthProvider";
import { router } from "expo-router";

export default function CitizenDashboard() {
    const { user, signOut } = useAuth();

    return (
        <View style={{ padding: 20, gap: 12 }}>
            <Text style={{ fontSize: 22, fontWeight: "bold" }}>
                Dashboard citoyen
            </Text>

            <Text>Bienvenue {user?.firstname ?? "citoyen"}</Text>

            <Text>Rôle : {user?.role}</Text>

            <Button
                title="Créer un signalement"
                onPress={() => router.push("/(citizen)/report")}
            />

            <Button
                title="Voir mes récompenses"

            />

            <Button
                title="Se déconnecter"
                color="red"
                onPress={async () => {
                    await signOut();
                    router.replace("/login");
                }}
            />
        </View>
    );
}