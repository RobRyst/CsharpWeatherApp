import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const { applyToken } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const resp = await axios.post("http://localhost:5092/api/auth/login", {
        usernameOrEmail: username,
        password,
      });

      const { token, user } = resp.data;

      if (!token) {
        throw new Error("No token returned from server");
      }

      applyToken(token, user);
      setSuccess(true);
    } catch (err) {
      console.error("Login failed:", err);

      if (err.response?.data) {
        setError(
          err.response.data.error ||
            err.response.data.title ||
            JSON.stringify(err.response.data)
        );
      } else {
        setError(err.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.title}>Login</Text>

      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder="Username or Email"
        style={styles.input}
        autoCapitalize="none"
      />

      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
        style={styles.input}
      />

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#fff"
          style={{ marginBottom: 16 }}
        />
      ) : (
        <Button title="Login" onPress={handleLogin} />
      )}

      {error && <Text style={styles.error}>{error}</Text>}
      {success && <Text style={styles.success}>Login successful!</Text>}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  error: {
    color: "red",
    marginTop: 12,
    textAlign: "center",
  },
  success: {
    color: "lime",
    marginTop: 12,
    textAlign: "center",
  },
});
