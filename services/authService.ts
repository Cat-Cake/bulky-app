import * as SecureStore from "expo-secure-store";

const API_URL = process.env.EXPO_PUBLIC_API_URL as string;
const TOKEN_KEY = "auth_token"

type RegisterPayload = {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
};

type LoginPayload = {
    email: string;
    password: string;
};

export async function register(data: RegisterPayload) {
    const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || "Erreur lors de l'inscription");
    }

    return result;
}

export async function login(data: LoginPayload) {
    const url = `${API_URL}/api/login`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "ngrok-skip-browser-warning": "1",
        },
        body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || "Erreur lors de la connexion");
    }

    if (result.token) {
        await SecureStore.setItemAsync(TOKEN_KEY, result.token)
    } else {
        throw new Error("Toek manquant dans la réponse")
    }

    return result;
}