import {useState} from "react";
import {register} from "@/services/authService";
import {useRouter} from "expo-router";
import {ActivityIndicator, Pressable, View, Text, TextInput, StyleSheet} from "react-native";

export default function RegisterScreen() {
    const router = useRouter()
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null);

    const canSubmit =
        firstname.trim().length > 1 &&
        lastname.trim().length > 1 &&
        email.trim().includes('@') &&
        password.trim().length > 6
    ;

    async function handleRegister() {
        try {
            setError(null);
            setLoading(true);

            await register({
                firstname: firstname.trim(),
                lastname: lastname.trim(),
                email: email.trim().toLowerCase(),
                password: password
            })

            router.replace("/login");
        } catch (e: any) {
            setError(e.message)
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Créer un compte</Text>
                <Text style={styles.subtitle}>Rejoins CleanCity et gagne des points</Text>

                {error ? <Text style={styles.error}>{error}</Text> : null}

                <View style={styles.row}>
                    <View style={styles.col}>
                        <Text style={styles.label}>Prénom</Text>
                        <TextInput
                            value={firstname}
                            onChangeText={setFirstname}
                            placeholder="Prénom"
                            style={styles.input}
                            autoCapitalize="words"
                            returnKeyType="next"
                        />
                    </View>

                    <View style={styles.col}>
                        <Text style={styles.label}>Nom</Text>
                        <TextInput
                            value={lastname}
                            onChangeText={setLastname}
                            placeholder="Nom"
                            style={styles.input}
                            autoCapitalize="words"
                            returnKeyType="next"
                        />
                    </View>
                </View>

                <Text style={styles.label}>Email</Text>
                <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="email@email.com"
                    style={styles.input}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    returnKeyType="next"
                />

                <Text style={styles.label}>Mot de passe</Text>
                <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    style={styles.input}
                    secureTextEntry
                    returnKeyType="done"
                />

                <Pressable
                    onPress={handleRegister}
                    disabled={!canSubmit}
                    style={({ pressed }) => [
                        styles.button,
                        (!canSubmit || pressed) && styles.buttonPressed,
                        !canSubmit && styles.buttonDisabled,
                    ]}
                >
                    {loading ? (
                        <ActivityIndicator />
                    ) : (
                        <Text style={styles.buttonText}>Inscription</Text>
                    )}
                </Pressable>

                <Pressable onPress={() => router.push("/login")} style={styles.linkWrap}>
                    <Text style={styles.linkText}>
                        Déjà un compte ? <Text style={styles.linkBold}>Se connecter</Text>
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: "center", backgroundColor: "#F5F5F7" },

    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },

    title: { fontSize: 24, fontWeight: "700", color: "#1A1A1C" },
    subtitle: { marginTop: 6, fontSize: 13, color: "#4A4A4A" },

    error: {
        marginTop: 12,
        backgroundColor: "#E66868",
        color: "#fff",
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 10,
        fontSize: 13,
    },

    row: { flexDirection: "row", gap: 12, marginTop: 14 },
    col: { flex: 1 },

    label: { marginTop: 14, marginBottom: 6, fontSize: 13, fontWeight: "600", color: "#1A1A1C" },

    input: {
        borderWidth: 1,
        borderColor: "#E6E7EB",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: "#fff",
    },

    button: {
        marginTop: 18,
        backgroundColor: "#F4A261",
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
    },
    buttonPressed: { opacity: 0.9 },
    buttonDisabled: { opacity: 0.5 },

    buttonText: { color: "#fff", fontWeight: "700", fontSize: 15 },

    linkWrap: { marginTop: 14, alignItems: "center" },
    linkText: { fontSize: 13, color: "#4A4A4A" },
    linkBold: { color: "#CB4C2F", fontWeight: "700" },
});