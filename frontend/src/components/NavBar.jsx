import React from "react";
import { View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import Dashboard from "../navigation/screens/Dashboard";
import Search from "../navigation/screens/Search";
import Profile from "../navigation/screens/Profile";
import Favorites from "../navigation/screens/Favorites";

const Tab = createBottomTabNavigator();

export default function NavBar() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarIcon: () => null,
        tabBarIconStyle: { display: "none", width: 0, height: 0 },

        tabBarItemStyle: {
          justifyContent: "center",
          paddingVertical: 8,
        },
        tabBarLabelStyle: {
          fontSize: 13,
          lineHeight: 16,
          marginBottom: 0,
        },

        tabBarStyle: {
          backgroundColor: "transparent",
          borderTopWidth: 0,
          elevation: 0,
          boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 50,
          overflow: "visible",
        },

        tabBarBackground: () => (
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.6)",
            }}
          />
        ),

        tabBarActiveTintColor: "white",
        tabBarInactiveTintColor: "gray",
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen
        name="Search"
        component={Search}
        options={{ unmountOnBlur: true }}
      />
      <Tab.Screen name="Favorites" component={Favorites} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}
