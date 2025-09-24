import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  RefreshControl,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import WeatherBackground from "../../components/WeatherBackground";
import ScreenTransition from "../../components/ScreenTransition";
import { useWeather } from "../../context/WeatherContext";

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

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFavorites();
  }, [token, loadFavorites]);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [loadFavorites])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadFavorites();
    } finally {
      setRefreshing(false);
    }
  }, [loadFavorites]);

  const goTo = useCallback(
    async (fav) => {
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
    },
    [nav, selectLocation, fetchCurrent]
  );

  const onRemove = useCallback(
    async (fav) => {
      const msg = `Remove ${fav.name}${
        fav.countryCode ? `, ${fav.countryCode}` : ""
      }?`;

      if (Platform.OS === "web") {
        if (window.confirm(msg)) {
          const ok = await removeFavorite(fav.id);
          if (!ok) window.alert("Could not remove favorite. Please try again.");
        }
        return;
      }

      Alert.alert("Remove favorite", msg, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            const ok = await removeFavorite(fav.id);
            if (!ok)
              Alert.alert("Could not remove favorite", "Please try again.");
          },
        },
      ]);
    },
    [removeFavorite]
  );

  const renderItem = useCallback(
    ({ item }) => (
      <View style={styles.row}>
        <TouchableOpacity style={{ flex: 1 }} onPress={() => goTo(item)}>
          <Text style={styles.name}>
            {item.name}
            {item.state ? ` (${item.state})` : ""} • {item.countryCode}{" "}
            {item.isDefault ? "★" : ""}
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
    ),
    [goTo, onRemove]
  );

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
                renderItem={renderItem}
                ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                contentContainerStyle={{ paddingTop: 8, paddingBottom: 12 }}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor="#fff"
                  />
                }
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
