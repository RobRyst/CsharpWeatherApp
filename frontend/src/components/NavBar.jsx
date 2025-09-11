import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import Dashboard from "../navigation/screens/Dashboard";
import Search from "../navigation/screens/Search";
import Profile from "../navigation/screens/Profile";
import Login from "../navigation/screens/Login";
import Register from "../navigation/screens/Register";

const Tab = createBottomTabNavigator();

export default function NavBar() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
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
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="Search" component={Search} />
      <Tab.Screen name="Profile" component={Profile} />
      <Tab.Screen name="Login" component={Login} />
      <Tab.Screen name="Register" component={Register} /> {/* ⬅️ new tab */}
    </Tab.Navigator>
  );
}
