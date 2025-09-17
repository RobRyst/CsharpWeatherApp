import React from "react";
import { View, Text, Image, StyleSheet, FlatList } from "react-native";

export default function HourlyForecast({ items = [] }) {
  const data = Array.isArray(items) ? items : [];

  const renderItem = ({ item }) => {
    const time = item.time ?? item.Time;
    const temp = item.temperature ?? item.Temperature ?? 0;
    const feels = item.feelsLike ?? item.FeelsLike;
    const icon = item.icon ?? item.Icon ?? "01d";
    const desc = item.description ?? item.Description ?? "";

    const dt = time ? new Date(time) : null;
    const hourLabel =
      dt && !isNaN(dt.getTime())
        ? dt.toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
        : "--:--";

    const iconUrl = `https://openweathermap.org/img/wn/${icon}.png`;

    return (
      <View style={styles.cell}>
        <Text style={styles.hour}>{hourLabel}</Text>
        <Image source={{ uri: iconUrl }} style={styles.icon} />
        <Text style={styles.temp}>{Math.round(Number(temp))}°</Text>
        {typeof feels === "number" && (
          <Text style={styles.feels}>Feels {Math.round(feels)}°</Text>
        )}
        {!!desc && (
          <Text style={styles.desc} numberOfLines={1}>
            {desc}
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
        keyExtractor={(item, index) =>
          String(item?.time ?? item?.Time ?? index)
        }
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
    backgroundColor: "rgba(255,255,255,0.16)", // was 0.06
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.22)", // was 0.15
  },
  hour: { color: "rgba(255,255,255,0.95)", fontSize: 12, marginBottom: 4 }, // was 0.9
  icon: { width: 36, height: 36, marginVertical: 4 },
  temp: { color: "white", fontSize: 16, fontWeight: "600" },
  feels: { color: "rgba(255,255,255,0.9)", fontSize: 11, marginTop: 2 }, // was 0.85
  desc: {
    color: "rgba(255,255,255,0.9)", // was 0.85
    fontSize: 11,
    marginTop: 4,
    textAlign: "center",
  },
});
