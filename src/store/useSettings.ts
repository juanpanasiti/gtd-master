import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ThemeMode = "light" | "dark" | "system";
export type Language = "es" | "en" | "system";

interface SettingsState {
    themeMode: ThemeMode;
    language: Language;
    dailyReminderEnabled: boolean;
    dailyReminderTime: string; // HH:mm
    weeklyReminderEnabled: boolean;
    weeklyReminderDay: number; // 1 (Sun) - 7 (Sat)
    weeklyReminderTime: string; // HH:mm
    setThemeMode: (mode: ThemeMode) => void;
    setLanguage: (language: Language) => void;
    setDailyReminderEnabled: (enabled: boolean) => void;
    setDailyReminderTime: (time: string) => void;
    setWeeklyReminderEnabled: (enabled: boolean) => void;
    setWeeklyReminderDay: (day: number) => void;
    setWeeklyReminderTime: (time: string) => void;
}

export const useSettings = create<SettingsState>()(
    persist(
        (set) => ({
            themeMode: "system",
            language: "system",
            dailyReminderEnabled: true,
            dailyReminderTime: "09:00",
            weeklyReminderEnabled: true,
            weeklyReminderDay: 1, // Sunday
            weeklyReminderTime: "10:00",
            setThemeMode: (mode) => set({ themeMode: mode }),
            setLanguage: (language) => set({ language }),
            setDailyReminderEnabled: (enabled) => set({ dailyReminderEnabled: enabled }),
            setDailyReminderTime: (time) => set({ dailyReminderTime: time }),
            setWeeklyReminderEnabled: (enabled) => set({ weeklyReminderEnabled: enabled }),
            setWeeklyReminderDay: (day) => set({ weeklyReminderDay: day }),
            setWeeklyReminderTime: (time) => set({ weeklyReminderTime: time }),
        }),
        {
            name: "gtd-settings",
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
