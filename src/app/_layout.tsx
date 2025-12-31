import "../global.css";
import "@/core/i18n"; // Initialize i18n
import { Slot } from "expo-router";
import { View, Text } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { runMigrations } from "@/db/migrations-runner";
import { ThemeProvider, useTheme } from "@/core/theme/ThemeProvider";
import { GestureHandlerRootView } from "react-native-gesture-handler";

function AppContent() {
  const [isReady, setIsReady] = useState(false);
  const { isDark } = useTheme();

  useEffect(() => {
    runMigrations()
      .then(() => setIsReady(true))
      .catch((e) => console.error(e));
  }, []);

  if (!isReady) {
    return (
      <View className={`flex-1 items-center justify-center ${isDark ? "bg-gray-900" : "bg-white"}`}>
        <Text className={isDark ? "text-white" : "text-gray-900"}>Loading...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Slot />
    </>
  );
}

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
