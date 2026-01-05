import "../global.css";
import "@/core/i18n"; // Initialize i18n
import { Stack } from "expo-router";
import { View, Text, LogBox } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { runMigrations } from "@/db/migrations-runner";
import { ThemeProvider, useTheme } from "@/core/theme/ThemeProvider";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Ignore SafeAreaView deprecation warning from external libraries
LogBox.ignoreLogs(["SafeAreaView has been deprecated"]);

import { requestPermissions, scheduleDailyReviewReminder, scheduleWeeklyReviewReminder } from "@/core/notifications/NotificationService";
import { useTasks } from "@/store/useTasks";
import { useSettings } from "@/store/useSettings";

function AppContent() {
  const [isReady, setIsReady] = useState(false);
  const { isDark } = useTheme();
  const { loadTasks, getTodayBriefing, processRecurrenceResets } = useTasks();
  const { 
    dailyReminderEnabled, dailyReminderTime, 
    weeklyReminderEnabled, weeklyReminderDay, weeklyReminderTime 
  } = useSettings();

  useEffect(() => {
    async function init() {
      try {
        if (!isReady) {
          console.log("[DEBUG] App Init: Running migrations...");
          await runMigrations();
          console.log("[DEBUG] App Init: Loading tasks...");
          await loadTasks();
          console.log("[DEBUG] App Init: Processing recurrence resets...");
          await processRecurrenceResets();
          console.log("[DEBUG] App Init: Startup sequence complete.");
        }
        
        const hasPermission = await requestPermissions();
        if (hasPermission) {
          // Daily Reminder
          if (dailyReminderEnabled) {
            const { dueCount, startCount } = getTodayBriefing();
            const [hour, minute] = dailyReminderTime.split(':').map(Number);
            await scheduleDailyReviewReminder(dueCount, startCount, hour, minute);
          }
          
          // Weekly Reminder
          if (weeklyReminderEnabled) {
            const [wHour, wMinute] = weeklyReminderTime.split(':').map(Number);
            await scheduleWeeklyReviewReminder(wHour, wMinute, weeklyReminderDay);
          }
        }
      } catch (e) {
        console.error("Initialization error:", e);
      } finally {
        setIsReady(true);
      }
    }
    init();
  }, [
    dailyReminderEnabled, dailyReminderTime, 
    weeklyReminderEnabled, weeklyReminderDay, weeklyReminderTime,
    processRecurrenceResets
  ]);

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
      <Stack screenOptions={{ headerShown: false }} />
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
