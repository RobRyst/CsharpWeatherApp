import React from "react";
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
        sceneContainerStyle: { backgroundColor: "#000" },
        tabBarStyle: {
          backgroundColor: "rgba(0,0,0,0.6)",
          borderTopWidth: 0.5,
          borderTopColor: "rgba(255,255,255,0.2)",
          position: "absolute",
        },
        tabBarActiveTintColor: "white",
        tabBarInactiveTintColor: "gray",
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={Dashboard}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Search"
        component={Search}
        options={{ unmountOnBlur: true, headerShown: false }}
      />
      <Tab.Screen
        name="Favorites"
        component={Favorites}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
}
