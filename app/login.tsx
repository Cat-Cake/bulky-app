import {useRouter} from "expo-router";
import {useState} from "react";
import {login} from "@/services/authService";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";

export default function LoginScreen() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null);

    const canSubmit =
        email.trim().includes("@") &&
        password.trim().length > 6
    ;

    async function handleLogin() {
        try {
            setError(null)
            setLoading(true)

            await login({
                email: email.trim().toLowerCase(),
                password: password
            })
        } catch (e: any) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Connexion</Text>
            <Text style={styles.subtitle}>
                Connecte-toi pour accéder à CleanCity
            </Text>

            {error && <Text style={styles.error}>{error}</Text>}

            <View style={styles.form}>
                <TextInput
                    placeholder="Adresse email"
                    placeholderTextColor="#999"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                    style={styles.input}
                />

                <TextInput
                    placeholder="Mot de passe"
                    placeholderTextColor="#999"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    style={styles.input}
                />

                <TouchableOpacity
                    style={[styles.button, !canSubmit && styles.buttonDisabled]}
                    onPress={handleLogin}
                    disabled={!canSubmit}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Se connecter</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push("/register")}>
                    <Text style={styles.link}>
                        Pas encore de compte ? Créer un compte
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F7",
        padding: 24,
        justifyContent: "center",
    },

    title: {
        fontSize: 32,
        fontWeight: "700",
        color: "#1A1A1C",
        marginBottom: 6,
    },

    subtitle: {
        fontSize: 14,
        color: "#666",
        marginBottom: 24,
    },

    form: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },

    input: {
        borderWidth: 1,
        borderColor: "#E6E7EB",
        borderRadius: 10,
        padding: 14,
        marginBottom: 12,
        fontSize: 16,
        color: "#1A1A1C",
        backgroundColor: "#fff",
    },

    button: {
        backgroundColor: "#F4A261",
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 8,
    },

    buttonDisabled: {
        backgroundColor: "#E0E0E0",
    },

    buttonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 16,
    },

    link: {
        marginTop: 16,
        textAlign: "center",
        color: "#CB4C2F",
        fontWeight: "600",
    },

    error: {
        backgroundColor: "#FFE5E5",
        color: "#B00020",
        padding: 10,
        borderRadius: 8,
        marginBottom: 16,
    },
});