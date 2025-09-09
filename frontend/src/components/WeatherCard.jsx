import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

/**
 * WeatherCard
 * @param {{
 *  locationName?: string,
 *  countryCode?: string,
 *  description?: string,
 *  icon?: string, // OpenWeather icon id (e.g., "10d")
 *  temperature?: number,
 *  feelsLike?: number,
 *  min?: number,
 *  max?: number,
 *  humidity?: number,
 *  windSpeed?: number,
 * }} props
 */
export default function WeatherCard({
  locationName = "",
  countryCode = "",
  description = "",
  icon = "01d",
  temperature = 0,
  feelsLike = 0,
  min = 0,
  max = 0,
  humidity = 0,
  windSpeed = 0,
}) {
  const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.location} numberOfLines={1}>
            {locationName}
            {countryCode ? `, ${countryCode}` : ""}
          </Text>
          <Text style={styles.desc} numberOfLines={1}>
            {description}
          </Text>
        </View>
        <Image source={{ uri: iconUrl }} style={styles.icon} />
      </View>

      <View style={styles.centerRow}>
        <Text style={styles.temp}>{Math.round(temperature)}°</Text>
        <Text style={styles.feels}>Feels like {Math.round(feelsLike)}°</Text>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.meta}>H: {Math.round(max)}°</Text>
        <Text style={styles.dot}>•</Text>
        <Text style={styles.meta}>L: {Math.round(min)}°</Text>
        <Text style={styles.dot}>•</Text>
        <Text style={styles.meta}>Humidity: {Math.round(humidity)}%</Text>
        <Text style={styles.dot}>•</Text>
        <Text style={styles.meta}>Wind: {Math.round(windSpeed)} m/s</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.15)",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  location: {
    color: "white",
    fontSize: 20,
    fontWeight: "600",
  },
  desc: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    marginTop: 2,
    textTransform: "capitalize",
  },
  icon: {
    width: 64,
    height: 64,
    marginLeft: 8,
  },
  centerRow: {
    alignItems: "flex-start",
  },
  temp: {
    color: "white",
    fontSize: 56,
    fontWeight: "700",
    lineHeight: 60,
  },
  feels: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  meta: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
  },
  dot: {
    color: "rgba(255,255,255,0.5)",
    marginHorizontal: 2,
  },
});
