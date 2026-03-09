import {View, Text, StyleSheet, Pressable} from "react-native";
import {router} from "expo-router";
import React from "react";
import {AuthProvider, useAuth} from "@/app/providers/AuthProvider";

const ORANGE = "#F97316";

export default function ManagerScreen() {
    const {signOut} = useAuth()
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Manager Dashboard</Text>

            <Pressable
                style={styles.secondaryBtn}
                onPress={async () => {
                    await signOut();
                    router.replace("/login");
                }}
            >
                <Text style={styles.secondaryBtnText}>Se déconnecter</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F5F5F7" },
    title: { fontSize: 24, fontWeight: "800" },

    primaryBtn: { backgroundColor: ORANGE, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10 },
    primaryBtnText: { color: "white", fontWeight: "800" },

    secondaryBtn: { backgroundColor: "#FFF7ED", borderWidth: 1, borderColor: ORANGE, paddingVertical: 10, borderRadius: 10, alignItems: "center" },
    secondaryBtnText: { color: ORANGE, fontWeight: "900" },
});