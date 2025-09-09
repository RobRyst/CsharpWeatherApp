import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import api from "../../api/client";
import { useWeather } from "../../context/WeatherContext";

export default function Login() {
  const { applyToken } = useWeather();
  const [usernameOrEmail, setUser] = useState("");
  const [password, setPass] = useState("");
  const [error, setError] = useState(null);

  const login = async () => {
    try {
      setError(null);
      const resp = await api.post("/api/auth/login", {
        usernameOrEmail,
        password,
      });
      const token = resp.data?.accessToken || resp.data?.AccessToken;
      if (!token) throw new Error("No token in response");
      applyToken(token);
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    }
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        placeholder="Username or Email"
        placeholderTextColor="#999"
        value={usernameOrEmail}
        onChangeText={setUser}
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor="#999"
        value={password}
        onChangeText={setPass}
        style={styles.input}
        secureTextEntry
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <Button title="Login" onPress={login} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#000", padding: 16, gap: 12 },
  title: { color: "white", fontSize: 22, fontWeight: "600", marginBottom: 8 },
  input: {
    backgroundColor: "rgba(255,255,255,0.07)",
    color: "white",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.15)",
  },
  error: { color: "#ff6b6b" },
});
