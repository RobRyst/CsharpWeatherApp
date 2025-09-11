import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Button,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigation } from "@react-navigation/native";

export default function Register() {
  const nav = useNavigation();
  const { applyToken } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async () => {
    setError(null);
    setSuccess(false);

    if (!username.trim() || !email.trim() || !password) {
      setError("Please fill out all fields.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await axios.post("http://localhost:5092/api/auth/register", {
        username,
        email,
        password,
        role: "User",
      });

      const loginResp = await axios.post(
        "http://localhost:5092/api/auth/login",
        {
          usernameOrEmail: username,
          password,
        }
      );

      const { token, user } = loginResp.data || {};
      if (!token) {
        setSuccess(true);
        setError("Registered, but no token returned on login.");
        return;
      }

      applyToken(token, user);
      setSuccess(true);

      nav.navigate("Dashboard");
    } catch (err) {
      console.error("Register failed:", err);
      if (err.response?.data) {
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
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.title}>Create Account</Text>

      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder="Username"
        placeholderTextColor="#999"
        autoCapitalize="none"
        style={styles.input}
      />

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        placeholderTextColor="#999"
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />

      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        placeholderTextColor="#999"
        secureTextEntry
        style={styles.input}
      />

      <TextInput
        value={confirm}
        onChangeText={setConfirm}
        placeholder="Confirm Password"
        placeholderTextColor="#999"
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
        <Button title="Register" onPress={handleRegister} />
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}> Account created!</Text> : null}

      <TouchableOpacity
        onPress={() => nav.navigate("Login")}
        style={{ marginTop: 16 }}
      >
        <Text style={{ color: "#9cf", textAlign: "center" }}>
          Already have an account? Log in
        </Text>
      </TouchableOpacity>
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
    backgroundColor: "rgba(255,255,255,0.07)",
    color: "white",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.15)",
  },
  error: {
    color: "#ff6b6b",
    marginTop: 12,
    textAlign: "center",
  },
  success: {
    color: "lime",
    marginTop: 12,
    textAlign: "center",
  },
});
