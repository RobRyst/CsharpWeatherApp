import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from "react-native";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import WeatherBackground from "../../components/WeatherBackground";
import ScreenTransition from "../../components/ScreenTransition";

const API_BASE = "http://localhost:5092";

export default function Profile() {
  const { token, user, applyToken, logout } = useAuth();

  const [mode, setMode] = useState("login");
  const isLoggedIn = !!token;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");

  const authHeader = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token]
  );

  const handleLogin = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await axios.post(`${API_BASE}/api/auth/login`, {
        usernameOrEmail: loginUsername,
        password: loginPassword,
      });

      const data = resp?.data ?? {};
      const jwt = data.token ?? data.Token;
      const userInfo = data.user ?? data.User ?? null;

      if (!jwt) throw new Error("No token returned from server");
      await applyToken(jwt, userInfo);
    } catch (err) {
      if (err?.response?.data) {
        const d = err.response.data;
        setError(
          d.error || d.title || (typeof d === "string" ? d : JSON.stringify(d))
        );
      } else {
        setError(err.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  }, [loginUsername, loginPassword, applyToken]);

  const handleRegister = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!regUsername.trim() || !regEmail.trim() || !regPassword) {
      setError("Please fill out all fields.");
      setLoading(false);
      return;
    }
    if (regPassword !== regConfirm) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      await axios.post(`${API_BASE}/api/auth/register`, {
        username: regUsername,
        email: regEmail,
        password: regPassword,
        role: "User",
      });

      const loginResp = await axios.post(`${API_BASE}/api/auth/login`, {
        usernameOrEmail: regUsername,
        password: regPassword,
      });

      const data = loginResp?.data ?? {};
      const jwt = data.token ?? data.Token;
      const userInfo = data.user ?? data.User ?? null;

      if (!jwt) {
        setError("Registered, but no token returned on login.");
        return;
      }
      await applyToken(jwt, userInfo);
    } catch (err) {
      if (err?.response?.data) {
        const d = err.response.data;
        setError(
          d.error || d.title || (typeof d === "string" ? d : JSON.stringify(d))
        );
      } else {
        setError(err.message || "Registration failed");
      }
    } finally {
      setLoading(false);
    }
  }, [regUsername, regEmail, regPassword, regConfirm, applyToken]);

  const handleLogout = useCallback(async () => {
    await logout();
    setMode("login");
    Alert.alert("Logged out", "You have been logged out.");
  }, [logout]);

  const id = user?.id ?? user?.Id ?? "—";
  const username = user?.username ?? user?.Username ?? "—";
  const email = user?.email ?? user?.Email ?? "—";
  const role = user?.role ?? user?.Role ?? "—";

  return (
    <WeatherBackground>
      <ScreenTransition>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.panel}>
            <Text style={styles.title}>Profile</Text>

            {isLoggedIn ? (
              <ScrollView
                contentContainerStyle={{ paddingBottom: 24 }}
                keyboardShouldPersistTaps="handled"
              >
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

                <TouchableOpacity
                  onPress={handleLogout}
                  style={[styles.btn, styles.btnDanger]}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.btnText}>Log out</Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            ) : (
              <ScrollView
                contentContainerStyle={{ paddingBottom: 24 }}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.switchRow}>
                  <TouchableOpacity
                    style={[
                      styles.switchBtn,
                      mode === "login" && styles.switchBtnOn,
                    ]}
                    onPress={() => setMode("login")}
                  >
                    <Text
                      style={[
                        styles.switchText,
                        mode === "login" && styles.switchTextOn,
                      ]}
                    >
                      Login
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.switchBtn,
                      mode === "register" && styles.switchBtnOn,
                    ]}
                    onPress={() => setMode("register")}
                  >
                    <Text
                      style={[
                        styles.switchText,
                        mode === "register" && styles.switchTextOn,
                      ]}
                    >
                      Create Account
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.card}>
                  {mode === "login" ? (
                    <>
                      <TextInput
                        value={loginUsername}
                        onChangeText={setLoginUsername}
                        placeholder="Username or Email"
                        placeholderTextColor="#999"
                        autoCapitalize="none"
                        style={styles.input}
                      />
                      <TextInput
                        value={loginPassword}
                        onChangeText={setLoginPassword}
                        placeholder="Password"
                        placeholderTextColor="#999"
                        secureTextEntry
                        style={styles.input}
                      />

                      <TouchableOpacity
                        onPress={handleLogin}
                        style={styles.btn}
                        disabled={loading}
                      >
                        {loading ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <Text style={styles.btnText}>Login</Text>
                        )}
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <TextInput
                        value={regUsername}
                        onChangeText={setRegUsername}
                        placeholder="Username"
                        placeholderTextColor="#999"
                        autoCapitalize="none"
                        style={styles.input}
                      />
                      <TextInput
                        value={regEmail}
                        onChangeText={setRegEmail}
                        placeholder="Email"
                        placeholderTextColor="#999"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        style={styles.input}
                      />
                      <TextInput
                        value={regPassword}
                        onChangeText={setRegPassword}
                        placeholder="Password"
                        placeholderTextColor="#999"
                        secureTextEntry
                        style={styles.input}
                      />
                      <TextInput
                        value={regConfirm}
                        onChangeText={setRegConfirm}
                        placeholder="Confirm Password"
                        placeholderTextColor="#999"
                        secureTextEntry
                        style={styles.input}
                      />

                      <TouchableOpacity
                        onPress={handleRegister}
                        style={styles.btn}
                        disabled={loading}
                      >
                        {loading ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <Text style={styles.btnText}>Create Account</Text>
                        )}
                      </TouchableOpacity>
                    </>
                  )}

                  {error ? <Text style={styles.error}>{error}</Text> : null}
                </View>
              </ScrollView>
            )}
          </View>
        </KeyboardAvoidingView>
      </ScreenTransition>
    </WeatherBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "transparent" },
  panel: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 16,
  },

  title: { color: "white", fontSize: 22, fontWeight: "600", marginBottom: 16 },

  card: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 12,
    padding: 16,
  },

  label: { color: "rgba(255,255,255,0.75)", fontSize: 12, marginBottom: 4 },
  value: { color: "white", fontSize: 16, fontWeight: "600", marginBottom: 8 },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.18)",
    marginVertical: 8,
  },

  switchRow: {
    flexDirection: "row",
    marginBottom: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 10,
    overflow: "hidden",
  },
  switchBtn: { flex: 1, paddingVertical: 10, alignItems: "center" },
  switchBtnOn: { backgroundColor: "rgba(255,255,255,0.18)" },
  switchText: { color: "#cfe3ff", fontWeight: "600" },
  switchTextOn: { color: "white" },

  input: {
    backgroundColor: "rgba(255,255,255,0.07)",
    color: "white",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.15)",
  },
  btn: {
    backgroundColor: "rgba(255,255,255,0.22)",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  btnDanger: {
    backgroundColor: "rgba(204,75,75,0.9)",
    marginTop: 16,
  },
  btnText: { color: "white", fontWeight: "700" },
  error: { color: "#ff6b6b", marginTop: 12, textAlign: "center" },
});
