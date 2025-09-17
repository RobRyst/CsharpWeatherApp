import React from "react";
import {
  NavigationContainer,
  DefaultTheme as NavDefaultTheme,
} from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "react-native";
import { enableScreens } from "react-native-screens";

import NavBar from "./components/NavBar";
import { WeatherProvider } from "./context/WeatherContext";
import { AuthProvider } from "./context/AuthContext";

enableScreens(true);

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <AuthProvider>
        <WeatherProvider>
          <NavigationContainer theme={NavDefaultTheme}>
            <NavBar />
          </NavigationContainer>
        </WeatherProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
