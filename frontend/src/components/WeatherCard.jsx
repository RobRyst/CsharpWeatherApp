import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

// Helper to format sunrise/sunset time using location timezone offset
function formatLocalClockFromUnix(unixSeconds, offsetSeconds) {
  const localMs = (unixSeconds + offsetSeconds) * 1000;
  return new Date(localMs).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  });
}

/**
 * WeatherCard
 * @param {{
 *  locationName?: string,
 *  countryCode?: string,
 *  description?: string,
 *  icon?: string,
 *  temperature?: number,
 *  feelsLike?: number,
 *  min?: number,
 *  max?: number,
 *  humidity?: number,
 *  windSpeed?: number,
 *  sunrise?: number, // unix seconds (UTC)
 *  sunset?: number,  // unix seconds (UTC)
 *  tzOffset?: number // seconds offset from UTC
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
  sunrise = null,
  sunset = null,
  tzOffset = 0,
}) {
  const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;
  const sunriseLabel =
    typeof sunrise === "number"
      ? formatLocalClockFromUnix(sunrise, tzOffset)
      : "—";
  const sunsetLabel =
    typeof sunset === "number"
      ? formatLocalClockFromUnix(sunset, tzOffset)
      : "—";

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

      <View style={styles.metaRow}>
        <Text style={styles.meta}>Sunrise: {sunriseLabel}</Text>
        <Text style={styles.dot}>•</Text>
        <Text style={styles.meta}>Sunset: {sunsetLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.22)",
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
    color: "rgba(255,255,255,0.95)",
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
    color: "rgba(255,255,255,0.92)",
    fontSize: 14,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 4,
  },
  meta: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 13,
  },
  dot: {
    color: "rgba(255,255,255,0.6)",
    marginHorizontal: 6,
  },
});
