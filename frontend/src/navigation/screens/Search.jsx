import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useWeather } from "../../context/WeatherContext";
import { useNavigation } from "@react-navigation/native";

export default function Search() {
  const nav = useNavigation();
  const {
    token,
    searchResults,
    searchLocations,
    selectLocation,
    fetchCurrent,
    error,
  } = useWeather();
  const [query, setQuery] = useState("");

  const onChange = (t) => {
    setQuery(t);
    if (token) searchLocations(t);
  };

  const onSelect = async (loc) => {
    selectLocation(loc);
    await fetchCurrent({ lat: loc.lat, lon: loc.lon });
    nav.navigate("Dashboard");
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Search location</Text>
      {!token && (
        <Text style={styles.hint}>
          You’re not logged in. Open the Login tab first.
        </Text>
      )}
      <TextInput
        style={styles.input}
        value={query}
        onChangeText={onChange}
        placeholder="City or place"
        placeholderTextColor="#999"
      />

      {error ? <Text style={styles.error}>{String(error)}</Text> : null}

      <FlatList
        data={searchResults}
        keyExtractor={(item, idx) => `${item.lat},${item.lon},${idx}`}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => onSelect(item)}>
            <Text style={styles.name}>
              {item.name} {item.state ? `(${item.state})` : ""}{" "}
              {item.country ? `• ${item.country}` : ""}
            </Text>
            <Text style={styles.coords}>
              {item.lat.toFixed(3)}, {item.lon.toFixed(3)}
            </Text>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        contentContainerStyle={{ paddingVertical: 12 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#000", padding: 16 },
  title: { color: "white", fontSize: 22, fontWeight: "600", marginBottom: 12 },
  hint: { color: "#ccc", marginBottom: 8 },
  error: { color: "#ff6b6b", marginTop: 8 },
  input: {
    backgroundColor: "rgba(255,255,255,0.07)",
    color: "white",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.15)",
  },
  row: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 12,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.15)",
  },
  name: { color: "white", fontSize: 16, fontWeight: "600" },
  coords: { color: "#aaa", fontSize: 12, marginTop: 4 },
});
