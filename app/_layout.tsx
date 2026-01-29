import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "./providers/AuthProvider";

function RoleGuard() {
    const { token, user, loading } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        const inAuthGroup = segments[0] === "(auth)";

        if (!token || !user) {
            if (!inAuthGroup) router.replace("/login");
            return;
        }

        if (inAuthGroup) {
            if (user.role === "citoyen") router.replace("/citizen");
            if (user.role === "agent") router.replace("/agent");
            if (user.role === "gestionnaire") router.replace("/manager");
        }
    }, [token, user, loading, segments]);

    return null;
}

export default function RootLayout() {
    return (
        <AuthProvider>
            <RoleGuard />
            <Stack screenOptions={{ headerShown: false }} />
        </AuthProvider>
    );
}