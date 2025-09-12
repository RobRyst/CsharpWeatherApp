import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useWeather } from "../../context/WeatherContext";
import { useNavigation } from "@react-navigation/native";

export default function Favorites() {
  const nav = useNavigation();
  const { token, favorites, loadFavorites, selectLocation } = useWeather();

  useEffect(() => {
    if (token) loadFavorites();
  }, [token]);

  const onSelect = (f) => {
    selectLocation({
      name: f.name,
      country: f.countryCode,
      state: f.state ?? undefined,
      lat: f.latitude,
      lon: f.longitude,
    });
    nav.navigate("Dashboard");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Favorites</Text>

      {!token ? (
        <Text style={styles.hint}>
          Log in to save and view favorite locations.
        </Text>
      ) : favorites.length === 0 ? (
        <Text style={styles.hint}>
          No favorites yet. Star a location from the Dashboard.
        </Text>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(it) => String(it.id)}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          contentContainerStyle={{ paddingVertical: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.row} onPress={() => onSelect(item)}>
              <Text style={styles.name} numberOfLines={1}>
                {item.name} {item.state ? `(${item.state})` : ""} •{" "}
                {item.countryCode}
              </Text>
              <Text style={styles.coords}>
                {item.latitude.toFixed(3)}, {item.longitude.toFixed(3)}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", padding: 16 },
  title: { color: "white", fontSize: 22, fontWeight: "600", marginBottom: 12 },
  hint: { color: "#ccc" },
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
