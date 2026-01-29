import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const isSmall = width < 380;

  return (
      <ScrollView style={styles.page} contentContainerStyle={styles.container}>
        <View style={[styles.hero, isSmall && styles.heroSmall]}>
          <View style={styles.heroLeft}>
            <Text style={styles.heroTitle}>
              CleanCity – La plateforme citoyenne pour une ville plus propre
            </Text>

            <Text style={styles.heroSubtitle}>
              Signalez les encombrants, gagnez des points, montez en niveau et contribuez à rendre
              votre ville plus agréable à vivre.
            </Text>

            <View style={[styles.heroActions, isSmall && styles.heroActionsSmall]}>
              <Pressable onPress={() => router.push("/register")} style={styles.btnPrimary}>
                <Text style={styles.btnPrimaryText}>Créer un compte</Text>
              </Pressable>

              <Pressable onPress={() => router.push("/login")} style={styles.btnSecondary}>
                <Text style={styles.btnSecondaryText}>Se connecter</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.heroRight}>
            <Image
                source={require("../../assets/images/cleaning.png")}
                style={styles.heroImage}
                contentFit="contain"
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Comment ça fonctionne ?</Text>
        <View style={styles.grid}>
            <LevelCard title="1. Vous signalez" subtitle="Photographiez un encombrant, localisez-le et envoyez votre signalement." />
            <LevelCard title="2. Les agents interviennent" subtitle="Votre signalement est traité par une équipe municipale dédiée." />
            <LevelCard title="3. Vous gagnez des points" subtitle="Chaque signalement validé vous rapporte des points et augmente votre niveau." />
        </View>

        <Text style={styles.sectionTitle}>Un système de points motivant</Text>
        <View style={styles.grid}>
          <LevelCard title="Débutant" subtitle="Moins de 20 points" />
          <LevelCard title="Citoyen engagé" subtitle="Entre 20 et 49 points" />
          <LevelCard title="Ambassadeur CleanCity" subtitle="50 points et plus" />
        </View>

        <Text style={styles.sectionTitle}>Des commerces partenaires</Text>
        <Text style={styles.sectionText}>
          Vos points CleanCity sont échangeables dans des commerces partenaires proches de chez vous.
        </Text>

        <View style={styles.grid}>
          <PartnerCard name="Commerce" type="Commerce" address="Commerce" />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>CleanCity © 2025</Text>
        </View>
      </ScrollView>
  );
}

function StepCard({
                    title,
                    icon,
                    children,
                  }: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
      <View style={styles.card}>
        <Text style={styles.cardIcon}>{icon}</Text>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardText}>{children}</Text>
      </View>
  );
}

function LevelCard({ title, subtitle }: { title: string; subtitle: string }) {
  return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardText}>{subtitle}</Text>
      </View>
  );
}

function PartnerCard({
                       name,
                       type,
                       address,
                       muted,
                     }: {
  name: string;
  type: string;
  address: string;
  muted?: boolean;
}) {
  return (
      <View style={[styles.card, muted && styles.cardMuted]}>
        <Text style={styles.partnerName}>{name}</Text>
        <Text style={styles.partnerType}>{type}</Text>
        <Text style={styles.partnerAddress}>{address}</Text>
      </View>
  );
}

const ORANGE = "#F4A261";
const ORANGE_DARK = "#CB4C2F";
const BG = "#F5F5F7";
const TEXT = "#1A1A1C";
const MUTED = "#A1A4AA";
const BORDER = "#E6E7EB";

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: BG, marginTop: 50 },
  container: { padding: 16, gap: 18 },

  hero: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: "row",
    gap: 12,
  },
  heroSmall: { flexDirection: "column" },
  heroLeft: { flex: 1, gap: 10 },
  heroRight: { width: 150, alignItems: "center", justifyContent: "center" },

  heroTitle: { fontSize: 20, fontWeight: "800", color: TEXT, lineHeight: 26 },
  heroSubtitle: { fontSize: 14, color: "#4A4A4A", lineHeight: 20 },

  heroActions: { flexDirection: "row", gap: 10, marginTop: 6 },
  heroActionsSmall: { flexDirection: "column" },

  btnPrimary: {
    backgroundColor: ORANGE,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 1,
  },
  btnPrimaryText: { color: "white", fontWeight: "700" },

  btnSecondary: {
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: ORANGE,
    flexGrow: 1,
  },
  btnSecondaryText: { color: ORANGE_DARK, fontWeight: "800" },

  heroImage: { width: 140, height: 140 },

  sectionTitle: { fontSize: 18, fontWeight: "800", color: TEXT, marginTop: 4 },
  sectionText: { fontSize: 14, color: "#4A4A4A", lineHeight: 20, marginTop: -10 },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: BORDER,
    width: "100%",
  },

  cardMuted: { opacity: 0.75 },

  cardIcon: { fontSize: 22, marginBottom: 6 },
  cardTitle: { fontSize: 16, fontWeight: "800", color: TEXT, marginBottom: 6 },
  cardText: { fontSize: 14, color: "#4A4A4A", lineHeight: 20 },

  partnerName: { fontSize: 15, fontWeight: "800", color: TEXT },
  partnerType: { fontSize: 13, color: ORANGE_DARK, fontWeight: "700", marginTop: 2 },
  partnerAddress: { fontSize: 13, color: "#4A4A4A", marginTop: 6 },

  footer: { alignItems: "center", paddingVertical: 10 },
  footerText: { color: MUTED, fontSize: 12 },
});