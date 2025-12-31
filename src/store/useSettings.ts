import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ThemeMode = "light" | "dark" | "system";
export type Language = "es" | "en" | "system";

interface SettingsState {
    themeMode: ThemeMode;
    language: Language;
    setThemeMode: (mode: ThemeMode) => void;
    setLanguage: (language: Language) => void;
}

export const useSettings = create<SettingsState>()(
    persist(
        (set) => ({
            themeMode: "system",
            language: "system",
            setThemeMode: (mode) => set({ themeMode: mode }),
            setLanguage: (language) => set({ language }),
        }),
        {
            name: "gtd-settings",
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
