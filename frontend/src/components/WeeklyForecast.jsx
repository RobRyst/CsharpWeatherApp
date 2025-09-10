import React from "react";
import { View, Text, Image, StyleSheet, FlatList } from "react-native";

export default function WeeklyForecast({ items = [] }) {
  const data = Array.isArray(items) ? items : [];

  const renderItem = ({ item }) => {
    const date = item.date ?? item.Date;
    const minT = item.minTemperature ?? item.MinTemperature ?? 0;
    const maxT = item.maxTemperature ?? item.MaxTemperature ?? 0;
    const icon = item.icon ?? item.Icon ?? "01d";
    const desc = item.description ?? item.Description ?? "";
    const popVal =
      item.precipitationProbability ?? item.PrecipitationProbability;

    const dt = date ? new Date(date) : null;
    const isValidDate = dt && !isNaN(dt.getTime());
    const dayLabel = isValidDate
      ? dt.toLocaleDateString(undefined, { weekday: "short" })
      : "--";

    const iconUrl = `https://openweathermap.org/img/wn/${icon}.png`;
    const pop =
      typeof popVal === "number"
        ? Math.round(Math.max(0, Math.min(1, popVal)) * 100)
        : null;

    return (
      <View style={styles.row}>
        <Text style={styles.day}>{dayLabel}</Text>
        <View style={styles.mid}>
          <Image source={{ uri: iconUrl }} style={styles.icon} />
          <Text style={styles.desc} numberOfLines={1}>
            {desc}
          </Text>
        </View>
        <View style={styles.right}>
          {pop !== null && <Text style={styles.pop}>{pop}%</Text>}
          <Text style={styles.temps}>
            {Math.round(minT)}° / {Math.round(maxT)}°
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Weekly Forecast</Text>
      <FlatList
        data={data}
        keyExtractor={(it, idx) => String(it?.date ?? it?.Date ?? idx)}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        contentContainerStyle={{ paddingHorizontal: 8, paddingVertical: 4 }}
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.15)",
  },
  sep: { height: 8 },
  day: { color: "white", width: 60, fontSize: 14, fontWeight: "600" },
  mid: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  icon: { width: 28, height: 28 },
  desc: { color: "rgba(255,255,255,0.9)", fontSize: 13, flexShrink: 1 },
  right: { alignItems: "flex-end", gap: 4 },
  pop: { color: "rgba(135,206,250,0.95)", fontSize: 12, fontWeight: "600" },
  temps: { color: "white", fontSize: 14, fontWeight: "600" },
});
