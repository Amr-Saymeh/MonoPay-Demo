import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { get, ref } from "firebase/database";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useI18n } from "@/hooks/use-i18n";
import { AppUser } from "@/src/features/transfer/types/index";
import { db } from "@/src/firebaseConfig";
import { useAuth } from "@/src/providers/AuthProvider";
import { QRScanner } from "../components/QRScanner";

// ─── Strings ─────────────────────────────────────────────────────────────────
const STRINGS = {
  en: {
    title: "Scan QR Code",
    ownQR: "You cannot send money to yourself.",
    invalidQR: "This QR code is not a valid MonoPay user.",
    fetchError: "Failed to load user info. Please try again.",
    loading: "Looking up user...",
  },
  ar: {
    title: "مسح رمز QR",
    ownQR: "لا يمكنك إرسال المال لنفسك.",
    invalidQR: "رمز QR هذا ليس مستخدماً صالحاً في MonoPay.",
    fetchError: "فشل تحميل بيانات المستخدم. حاول مجدداً.",
    loading: "جاري البحث عن المستخدم...",
  },
};

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function ScanQRScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { language, isRtl } = useI18n();
  const s = STRINGS[language as "en" | "ar"] ?? STRINGS.en;

  const currentUid = user?.uid ?? "";
  const [resolving, setResolving] = useState(false);

  const handleScanned = async (scannedValue: string) => {
    const uid = scannedValue.trim();

    if (uid === currentUid) {
      Alert.alert("", s.ownQR, [{ text: "OK" }]);
      return;
    }

    setResolving(true);

    try {
      const snap = await get(ref(db, `users/${uid}`));

      if (!snap.exists() || snap.val()?.type !== 1) {
        Alert.alert("", s.invalidQR, [{ text: "OK" }]);
        return;
      }

      const data = snap.val() as Omit<AppUser, "uid">;

      router.replace({
        pathname: "/qr-send",
        params: {
          uid,
          name: data.name ?? "",
          number: String(data.number ?? ""),
        },
      });
    } catch {
      Alert.alert("", s.fetchError, [{ text: "OK" }]);
    } finally {
      setResolving(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* ── Gradient Header ── */}
      <LinearGradient
        colors={["#7C3AED", "#6D28D9", "#5B21B6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View
          style={[
            styles.headerRow,
            { flexDirection: isRtl ? "row-reverse" : "row" },
          ]}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isRtl ? "chevron-forward" : "chevron-back"}
              size={22}
              color="white"
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{s.title}</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      {/* ── Camera area ── */}
      <View style={styles.cameraContainer}>
        {resolving ? (
          <View style={styles.resolvingOverlay}>
            <View style={styles.resolvingCard}>
              <ActivityIndicator size="large" color="#7C3AED" />
              <Text style={styles.resolvingText}>{s.loading}</Text>
            </View>
          </View>
        ) : (
          <QRScanner
            onScanned={handleScanned}
            isRtl={isRtl}
            language={language as "en" | "ar"}
          />
        )}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F8F5FF",
  },
  headerGradient: {
    paddingTop: Platform.OS === "ios" ? 56 : 44,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerRow: {
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 0.3,
  },
  cameraContainer: {
    flex: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
    marginTop: -14,
    backgroundColor: "#000",
  },
  resolvingOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F5FF",
  },
  resolvingCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 40,
    alignItems: "center",
    gap: 16,
    shadowColor: "#7C3AED",
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  resolvingText: {
    color: "#374151",
    fontSize: 15,
    fontWeight: "500",
  },
});
