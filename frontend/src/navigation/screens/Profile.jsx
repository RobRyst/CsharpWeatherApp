import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigation } from "@react-navigation/native";

export default function Profile() {
  const nav = useNavigation();
  const { token, user, applyToken, logout } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const authHeader = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token]
  );

  const fetchMe = useCallback(async () => {
    if (!token) {
      Alert.alert("Not logged in", "Please log in to view your profile.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const resp = await axios.get("http://localhost:5092/api/auth/me", {
        headers: authHeader,
      });

      const me = resp.data || {};
      applyToken(token, me);
    } catch (err) {
      console.error("Fetch /me failed:", err);
      if (err.response?.data) {
        const d = err.response.data;
        setError(d.error || d.title || JSON.stringify(d));
      } else {
        setError(err.message || "Failed to load profile");
      }
    } finally {
      setLoading(false);
    }
  }, [token, authHeader, applyToken]);

  const isLoggedIn = !!token;

  const id = user?.id ?? user?.Id ?? "—";
  const username = user?.username ?? user?.Username ?? "—";
  const email = user?.email ?? user?.Email ?? "—";
  const role = user?.role ?? user?.Role ?? "—";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      {!isLoggedIn ? (
        <>
          <Text style={styles.hint}>
            You’re not logged in. Log in or create an account to see your
            profile.
          </Text>

          <View style={styles.rowButtons}>
            <Button title="Go to Login" onPress={() => nav.navigate("Login")} />
            <View style={{ width: 12 }} />
            <Button
              title="Create Account"
              onPress={() => nav.navigate("Register")}
            />
          </View>
        </>
      ) : (
        <>
          <View style={styles.card}>
            <Text style={styles.label}>User ID</Text>
            <Text style={styles.value}>{String(id)}</Text>

            <View style={styles.divider} />

            <Text style={styles.label}>Username</Text>
            <Text style={styles.value}>{username}</Text>

            <View style={styles.divider} />

            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{email}</Text>

            <View style={styles.divider} />

            <Text style={styles.label}>Role</Text>
            <Text style={styles.value}>{role}</Text>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.rowButtons}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Button title="Refresh" onPress={fetchMe} />
            )}
            <View style={{ width: 12 }} />
            <Button
              title="Log out"
              color="#cc4b4b"
              onPress={() => {
                logout();
                Alert.alert("Logged out", "You have been logged out.");
              }}
            />
          </View>

          <TouchableOpacity
            onPress={() => nav.navigate("Dashboard")}
            style={{ marginTop: 16 }}
          >
            <Text style={styles.link}>← Back to Dashboard</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", padding: 16 },
  title: { color: "white", fontSize: 22, fontWeight: "600", marginBottom: 16 },
  hint: { color: "#ccc", marginBottom: 12 },
  card: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.15)",
    padding: 16,
  },
  label: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    marginBottom: 4,
  },
  value: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    marginVertical: 8,
  },
  rowButtons: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  link: {
    color: "#9cf",
    textAlign: "center",
    textDecorationLine: "underline",
  },
  error: {
    color: "#ff6b6b",
    marginTop: 12,
  },
});
