import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useWeather } from "../../context/WeatherContext";
import WeatherCard from "../../components/WeatherCard";
import HourlyForecast from "../../components/HourlyForecast";
import WeeklyForecast from "../../components/WeeklyForecast";

export default function Dashboard() {
  const {
    selected,
    current,
    fetchCurrent,
    fetchHourly,
    fetchDaily,
    loading: ctxLoading,
    error,
  } = useWeather();

  const [hourly, setHourly] = useState([]);
  const [weekly, setWeekly] = useState([]);
  const [loading, setLoading] = useState(false);

  const wx = useMemo(() => {
    if (!current || !selected) return null;
    const main = current.main || {};
    const wind = current.wind || {};
    const weather0 = (current.weather && current.weather[0]) || {};
    return {
      LocationName: selected.name,
      CountryCode: selected.country,
      Description: weather0.description || "",
      Icon: weather0.icon || "01d",
      Temperature: main.temp ?? 0,
      FeelsLikeTemperature: main.feels_like ?? main.temp ?? 0,
      MinTemperature: main.temp_min ?? main.temp ?? 0,
      MaxTemperature: main.temp_max ?? main.temp ?? 0,
      Humidity: main.humidity ?? 0,
      WindSpeed: wind.speed ?? 0,
    };
  }, [current, selected]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!selected) return;
      setLoading(true);
      try {
        await fetchCurrent({
          lat: selected.lat,
          lon: selected.lon,
          units: "metric",
          lang: "en",
        });

        const [h, d] = await Promise.all([
          fetchHourly({
            lat: selected.lat,
            lon: selected.lon,
            hours: 24,
            units: "metric",
            lang: "en",
          }),
          fetchDaily({
            lat: selected.lat,
            lon: selected.lon,
            days: 7,
            units: "metric",
            lang: "en",
          }),
        ]);

        if (!cancelled) {
          setHourly(Array.isArray(h) ? h : []);
          setWeekly(Array.isArray(d) ? d : []);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [selected, fetchCurrent, fetchHourly, fetchDaily]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      <Text style={styles.title}>Dashboard</Text>

      {!selected ? (
        <Text style={styles.hint}>
          Search for a location (Search tab), then select it to load weather.
        </Text>
      ) : (loading || ctxLoading) && !wx ? (
        <View style={styles.center}>
          <ActivityIndicator color="#fff" />
          <Text style={styles.hint}>Loading weather…</Text>
        </View>
      ) : error ? (
        <Text style={styles.error}>{String(error)}</Text>
      ) : !wx ? (
        <Text style={styles.hint}>No current weather yet.</Text>
      ) : (
        <>
          <WeatherCard
            locationName={wx.LocationName}
            countryCode={wx.CountryCode}
            description={wx.Description}
            icon={wx.Icon}
            temperature={wx.Temperature}
            feelsLike={wx.FeelsLikeTemperature}
            min={wx.MinTemperature}
            max={wx.MaxTemperature}
            humidity={wx.Humidity}
            windSpeed={wx.WindSpeed}
          />

          <View style={{ height: 16 }} />

          {loading && hourly.length === 0 ? (
            <View style={styles.center}>
              <ActivityIndicator color="#fff" />
            </View>
          ) : hourly.length > 0 ? (
            <HourlyForecast items={hourly} />
          ) : (
            <Text style={styles.hint}>No hourly data yet.</Text>
          )}

          <View style={{ height: 16 }} />

          {loading && weekly.length === 0 ? (
            <View style={styles.center}>
              <ActivityIndicator color="#fff" />
            </View>
          ) : weekly.length > 0 ? (
            <WeeklyForecast items={weekly} />
          ) : (
            <Text style={styles.hint}>No weekly data yet.</Text>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#000" },
  title: { color: "white", fontSize: 22, fontWeight: "600", marginBottom: 16 },
  hint: { color: "#ccc" },
  error: { color: "#ff6b6b" },
  center: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
});
