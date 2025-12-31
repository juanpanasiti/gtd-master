import React, { createContext, useContext, useEffect, useMemo } from "react";
import { useColorScheme as useRNColorScheme } from "react-native";
import { useSettings, ThemeMode } from "@/store/useSettings";

type EffectiveTheme = "light" | "dark";

interface ThemeContextType {
  theme: EffectiveTheme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useRNColorScheme();
  const { themeMode, setThemeMode } = useSettings();

  const theme: EffectiveTheme = useMemo(() => {
    if (themeMode === "system") {
      return systemColorScheme === "dark" ? "dark" : "light";
    }
    return themeMode;
  }, [themeMode, systemColorScheme]);

  const isDark = theme === "dark";

  const value = useMemo(
    () => ({
      theme,
      themeMode,
      setThemeMode,
      isDark,
    }),
    [theme, themeMode, setThemeMode, isDark]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
