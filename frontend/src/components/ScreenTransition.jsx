import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Platform } from "react-native";
import { useIsFocused } from "@react-navigation/native";

export default function ScreenTransition({
  children,
  duration = 220,
  translate = 6,
}) {
  const isFocused = useIsFocused();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(translate)).current;
  const useDriver = Platform.OS !== "web";

  useEffect(() => {
    if (isFocused) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: useDriver,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: useDriver,
        }),
      ]).start();
    } else {
      opacity.setValue(0);
      translateY.setValue(translate);
    }
  }, [isFocused, duration, translate, opacity, translateY, useDriver]);

  return (
    <Animated.View
      style={[
        styles.fill,
        { opacity, transform: [{ translateY }], pointerEvents: "box-none" },
      ]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
