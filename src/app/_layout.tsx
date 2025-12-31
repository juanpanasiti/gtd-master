import "../global.css";
import { Slot } from "expo-router";
import { View, Text } from "react-native";
import { useEffect, useState } from "react";
import { runMigrations } from "@/db/migrations-runner";

export default function Layout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    runMigrations()
      .then(() => setIsReady(true))
      .catch((e) => console.error(e));
  }, []);

  if (!isReady) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <Slot />
    </View>
  );
}
