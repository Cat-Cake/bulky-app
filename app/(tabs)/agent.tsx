import { View, Text, StyleSheet } from "react-native";

export default function AgentScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Agent Dashboard</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F5F5F7" },
    title: { fontSize: 24, fontWeight: "800" },
});