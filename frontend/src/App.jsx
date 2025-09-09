import "react-native-gesture-handler";
import React from "react";
import { useColorScheme } from "react-native";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { WeatherProvider } from "./context/WeatherContext";
import NavBar from "./components/NavBar";

export default function App() {
  const scheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={scheme === "dark" ? DarkTheme : DefaultTheme}>
        <WeatherProvider>
          <NavBar />
        </WeatherProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
