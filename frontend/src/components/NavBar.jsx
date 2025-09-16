import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import Dashboard from "../navigation/screens/Dashboard";
import Search from "../navigation/screens/Search";
import Profile from "../navigation/screens/Profile";
import Login from "../navigation/screens/Login";
import Register from "../navigation/screens/Register";
import Favorites from "../navigation/screens/Favorites";

const Tab = createBottomTabNavigator();

export default function NavBar() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        sceneContainerStyle: { backgroundColor: "rgba(0,0,0,0.01)" },
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
      <Tab.Screen
        name="Search"
        component={Search}
        options={{ unmountOnBlur: true }}
      />
      <Tab.Screen name="Favorites" component={Favorites} />
      <Tab.Screen name="Profile" component={Profile} />
      <Tab.Screen name="Login" component={Login} />
      <Tab.Screen name="Register" component={Register} />
    </Tab.Navigator>
  );
}
