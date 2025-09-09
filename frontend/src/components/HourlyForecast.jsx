import React from "react";
import { View, Text, Image, StyleSheet, FlatList } from "react-native";

/**
 * HourlyForecast
 * @param {Object} props
 * @param {Array<{
 *   Time: string | Date,
 *   Temperature: number,
 *   FeelsLike?: number,
 *   Icon?: string,
 *   Description?: string
 * }>} props.items
 */
export default function HourlyForecast({ items = [] }) {
  const data = Array.isArray(items) ? items : [];

  const renderItem = ({ item }) => {
    const dt = new Date(item.Time);
    const hourLabel = dt.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const iconUrl = `https://openweathermap.org/img/wn/${
      item.Icon || "01d"
    }.png`;

    return (
      <View style={styles.cell}>
        <Text style={styles.hour}>{hourLabel}</Text>
        <Image source={{ uri: iconUrl }} style={styles.icon} />
        <Text style={styles.temp}>{Math.round(item.Temperature)}°</Text>
        {typeof item.FeelsLike === "number" && (
          <Text style={styles.feels}>Feels {Math.round(item.FeelsLike)}°</Text>
        )}
        {!!item.Description && (
          <Text style={styles.desc} numberOfLines={1}>
            {item.Description}
          </Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Hourly Forecast</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={data}
        keyExtractor={(it, idx) => String(it.Time ?? idx)}
        renderItem={renderItem}
        contentContainerStyle={{ gap: 12, paddingHorizontal: 8 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  title: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    paddingHorizontal: 8,
  },
  cell: {
    width: 100,
    alignItems: "center",
    paddingVertical: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.15)",
  },
  hour: { color: "rgba(255,255,255,0.9)", fontSize: 12, marginBottom: 4 },
  icon: { width: 36, height: 36, marginVertical: 4 },
  temp: { color: "white", fontSize: 16, fontWeight: "600" },
  feels: { color: "rgba(255,255,255,0.85)", fontSize: 11, marginTop: 2 },
  desc: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 11,
    marginTop: 4,
    textAlign: "center",
  },
});
