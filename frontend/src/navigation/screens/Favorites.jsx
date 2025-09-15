import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useWeather } from "../../context/WeatherContext";
import { useNavigation } from "@react-navigation/native";

export default function Favorites() {
  const nav = useNavigation();
  const {
    token,
    favorites,
    loadFavorites,
    removeFavorite,
    selectLocation,
    fetchCurrent,
  } = useWeather();

  useEffect(() => {
    loadFavorites();
  }, [token]);

  const goTo = async (fav) => {
    const loc = {
      name: fav.name,
      country: fav.countryCode,
      state: fav.state ?? null,
      lat: fav.latitude,
      lon: fav.longitude,
    };
    selectLocation(loc);
    await fetchCurrent({ lat: loc.lat, lon: loc.lon });
    nav.navigate("Dashboard");
  };

  const onRemove = (fav) => {
    Alert.alert(
      "Remove favorite",
      `Remove ${fav.name}${fav.countryCode ? `, ${fav.countryCode}` : ""}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            await removeFavorite(fav.id);
          },
        },
      ]
    );
  };

  if (!token) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.title}>Favorites</Text>
        <Text style={styles.hint}>Log in to save locations as favorites.</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Favorites</Text>
      <FlatList
        data={favorites}
        keyExtractor={(f) => String(f.id)}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => goTo(item)}>
              <Text style={styles.name}>
                {item.name}
                {item.state ? ` (${item.state})` : ""} • {item.countryCode}
              </Text>
              <Text style={styles.coords}>
                {Number(item.latitude).toFixed(3)},{" "}
                {Number(item.longitude).toFixed(3)}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onRemove(item)}>
              <Text style={styles.remove}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        contentContainerStyle={{ paddingTop: 8 }}
        ListEmptyComponent={<Text style={styles.hint}>No favorites yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#000", padding: 16 },
  title: { color: "white", fontSize: 22, fontWeight: "600", marginBottom: 12 },
  hint: { color: "#ccc" },
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
  coords: { color: "#aaa", fontSize: 12, marginTop: 4 },
  remove: { color: "#ff6b6b", fontWeight: "600" },
});
