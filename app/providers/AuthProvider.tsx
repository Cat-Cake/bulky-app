import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";

type Role = "citoyen" | "agent" | "gestionnaire";

type User = {
    id: string;
    firstname?: string;
    role: Role;
    point: number;
    isTeamLeader: boolean;
};

type AuthState = {
    token: string | null;
    user: User | null;
    loading: boolean;
    signIn: (token: string, user: User) => Promise<void>;
    signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const t = await SecureStore.getItemAsync("token");
            const u = await SecureStore.getItemAsync("user");
            setToken(t ?? null);
            setUser(u ? JSON.parse(u) : null);
            setLoading(false);
        })();
    }, []);

    async function signIn(newToken: string, newUser: User) {
        await SecureStore.setItemAsync("token", newToken);
        await SecureStore.setItemAsync("user", JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
    }

    async function signOut() {
        await SecureStore.deleteItemAsync("token");
        await SecureStore.deleteItemAsync("user");
        setToken(null);
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ token, user, loading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}