import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useWeather } from "../../context/WeatherContext";
import { useNavigation } from "@react-navigation/native";
import WeatherBackground from "../../components/WeatherBackground";
import ScreenTransition from "../../components/ScreenTransition";

export default function Search() {
  const nav = useNavigation();
  const {
    searchResults,
    searchLocations,
    selectLocation,
    fetchCurrent,
    toggleFavorite,
    findFavoriteFor,
    error,
  } = useWeather();

  const [query, setQuery] = useState("");
  const debounceRef = useRef(null);

  const triggerSearch = (text) => {
    if (!text?.trim()) {
      searchLocations("");
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchLocations(text);
    }, 300);
  };

  const onChange = (t) => {
    setQuery(t);
    triggerSearch(t);
  };

  const onSelect = async (loc) => {
    selectLocation(loc);
    await fetchCurrent({ lat: loc.lat, lon: loc.lon });
    nav.navigate("Dashboard");
  };

  const onToggleFav = async (loc) => {
    const res = await toggleFavorite(loc);
    if (res?.reason === "auth") {
      Alert.alert("Login required", "Log in to save favorites.");
    }
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <WeatherBackground>
      <ScreenTransition>
        <View style={styles.container}>
          <View style={styles.panel}>
            <Text style={styles.title}>Search location</Text>

            <TextInput
              style={styles.input}
              value={query}
              onChangeText={onChange}
              placeholder="Enter the City or place"
              placeholderTextColor="white"
              autoCorrect={false}
              autoCapitalize="none"
            />

            {error ? (
              <Text style={styles.error}>
                {String(error?.message ?? error)}
              </Text>
            ) : null}

            <FlatList
              keyboardShouldPersistTaps="handled"
              data={searchResults}
              keyExtractor={(item, idx) => `${item.lat},${item.lon},${idx}`}
              renderItem={({ item }) => {
                const existing = findFavoriteFor(item);
                return (
                  <View style={styles.row}>
                    <TouchableOpacity
                      style={{ flex: 1 }}
                      onPress={() => onSelect(item)}
                    >
                      <Text style={styles.name}>
                        {item.name}
                        {item.state ? ` (${item.state})` : ""}
                        {item.country ? ` • ${item.country}` : ""}
                      </Text>
                      <Text style={styles.coords}>
                        {Number(item.lat).toFixed(3)},{" "}
                        {Number(item.lon).toFixed(3)}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => onToggleFav(item)}
                      style={styles.heartWrap}
                    >
                      <Text style={[styles.heart, existing && styles.heartOn]}>
                        {existing ? "♥" : "♡"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              }}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
              contentContainerStyle={{ paddingVertical: 12 }}
            />
          </View>
        </View>
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

  title: { color: "white", fontSize: 22, fontWeight: "600", marginBottom: 12 },
  error: { color: "#ff6b6b", marginTop: 8 },

  input: {
    backgroundColor: "rgba(255,255,255,0.12)",
    color: "white",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.22)",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 12,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.15)",
  },
  name: { color: "white", fontSize: 16, fontWeight: "600" },
  coords: { color: "white", fontSize: 12, marginTop: 4 },
  heartWrap: { paddingHorizontal: 8, paddingVertical: 4 },
  heart: { fontSize: 20, color: "#aaa" },
  heartOn: { color: "#ff718b" },
});
