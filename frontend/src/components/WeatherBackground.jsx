import React from "react";
import { View, ImageBackground, StyleSheet } from "react-native";
import { useWeather } from "../context/WeatherContext";
import {
  conditionToKey,
  isDayFromOpenWeather,
} from "../theme/WeatherBackground";

const IMAGES = {
  clear: {
    day: require("../assets/backgrounds/clear_day.jpg"),
    night: require("../assets/backgrounds/clear_night.jpg"),
  },
  partly: {
    day: require("../assets/backgrounds/partly_day.jpg"),
    night: require("../assets/backgrounds/partly_night.jpg"),
  },
  clouds: {
    day: require("../assets/backgrounds/clouds_day.jpg"),
    night: require("../assets/backgrounds/clouds_night.jpg"),
  },
  rain: {
    day: require("../assets/backgrounds/rain_day.jpg"),
    night: require("../assets/backgrounds/rain_night.jpg"),
  },
  thunder: {
    day: require("../assets/backgrounds/thunder_day.jpg"),
    night: require("../assets/backgrounds/thunder_night.jpg"),
  },
  snow: {
    day: require("../assets/backgrounds/snow_day.jpg"),
    night: require("../assets/backgrounds/snow_night.jpg"),
  },
  mist: {
    day: require("../assets/backgrounds/mist_day.jpg"),
    night: require("../assets/backgrounds/mist_night.jpg"),
  },
  default: {
    day: require("../assets/backgrounds/default_day.jpg"),
    night: require("../assets/backgrounds/default_night.jpg"),
  },
};

function pickImage(key, day) {
  const group = IMAGES[key] ?? IMAGES.default;
  return day ? group.day : group.night;
}

export default function WeatherBackground({ children }) {
  const { current } = useWeather();
  const key = conditionToKey(current);
  const day = isDayFromOpenWeather(current);
  const source = pickImage(key, day);

  return (
    <ImageBackground source={source} style={styles.fill} resizeMode="cover">
      <View style={styles.overlay} />
      <View style={styles.content}>{children}</View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  content: { flex: 1 },
});
