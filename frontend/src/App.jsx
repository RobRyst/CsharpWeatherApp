import React from "react";
import {
  NavigationContainer,
  DefaultTheme as NavDefaultTheme,
  DarkTheme as NavDarkTheme,
} from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useColorScheme, StatusBar } from "react-native";

import NavBar from "./components/NavBar";
import { WeatherProvider } from "./context/WeatherContext";
import { AuthProvider } from "./context/AuthContext";
import WeatherBackground from "./components/WeatherBackground";

const TransparentTheme = {
  ...NavDefaultTheme,
  colors: {
    ...NavDefaultTheme.colors,
    background: "transparent",
    card: "transparent",
  },
};

export default function App() {
  const scheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <AuthProvider>
        <WeatherProvider>
          <WeatherBackground>
            <NavigationContainer
              theme={
                scheme === "dark"
                  ? {
                      ...NavDarkTheme,
                      colors: {
                        ...NavDarkTheme.colors,
                        background: "transparent",
                        card: "transparent",
                      },
                    }
                  : TransparentTheme
              }
            >
              <NavBar />
            </NavigationContainer>
          </WeatherBackground>
        </WeatherProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
