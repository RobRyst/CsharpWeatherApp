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
import WeatherBackground from "../../components/WeatherBackground";
import ScreenTransition from "../../components/ScreenTransition";

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

  return (
    <WeatherBackground>
      <ScreenTransition>
        <View style={styles.container}>
          <View style={styles.panel}>
            <Text style={styles.title}>Favorites</Text>

            {!token ? (
              <Text style={styles.hint}>
                Log in to save locations as favorites.
              </Text>
            ) : (
              <FlatList
                data={favorites}
                keyExtractor={(f) => String(f.id)}
                renderItem={({ item }) => (
                  <View style={styles.row}>
                    <TouchableOpacity
                      style={{ flex: 1 }}
                      onPress={() => goTo(item)}
                    >
                      <Text style={styles.name}>
                        {item.name}
                        {item.state ? ` (${item.state})` : ""} •{" "}
                        {item.countryCode}
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
                ListEmptyComponent={
                  <Text style={styles.hint}>No favorites yet.</Text>
                }
              />
            )}
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
  hint: { color: "white" },

  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 12,
    padding: 12,
  },
  name: { color: "white", fontSize: 16, fontWeight: "600" },
  coords: { color: "white", fontSize: 12, marginTop: 4 },
  remove: { color: "#ff6b6b", fontWeight: "600" },
});
