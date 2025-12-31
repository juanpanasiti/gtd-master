import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Sun, Moon, Smartphone, Globe } from "lucide-react-native";
import { useSettings, ThemeMode, Language } from "@/store/useSettings";
import { useTheme } from "@/core/theme/ThemeProvider";
import { changeLanguage } from "@/core/i18n";
import { useEffect } from "react";
import Constants from "expo-constants";

type ThemeOption = { value: ThemeMode; labelKey: string; icon: React.ReactNode };
type LanguageOption = { value: Language; labelKey: string };

export default function SettingsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { themeMode, language, setThemeMode, setLanguage } = useSettings();
  const { isDark } = useTheme();

  const bgColor = isDark ? "bg-gray-900" : "bg-white";
  const textColor = isDark ? "text-white" : "text-gray-900";
  const secondaryText = isDark ? "text-gray-400" : "text-gray-500";
  const cardBg = isDark ? "bg-gray-800" : "bg-gray-100";
  const activeBg = isDark ? "bg-blue-600" : "bg-blue-500";

  // Sync language change with i18n
  useEffect(() => {
    changeLanguage(language);
  }, [language]);

  const themeOptions: ThemeOption[] = [
    { value: "light", labelKey: "settings.light", icon: <Sun size={20} color={isDark ? "#fff" : "#374151"} /> },
    { value: "dark", labelKey: "settings.dark", icon: <Moon size={20} color={isDark ? "#fff" : "#374151"} /> },
    { value: "system", labelKey: "settings.system", icon: <Smartphone size={20} color={isDark ? "#fff" : "#374151"} /> },
  ];

  const languageOptions: LanguageOption[] = [
    { value: "en", labelKey: "settings.english" },
    { value: "es", labelKey: "settings.spanish" },
    { value: "system", labelKey: "settings.system" },
  ];

  const appVersion = Constants.expoConfig?.version || "1.0.0";

  return (
    <SafeAreaView className={`flex-1 ${bgColor}`}>
      <View className="flex-row items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft size={24} color={isDark ? "#fff" : "#374151"} />
        </TouchableOpacity>
        <Text className={`text-xl font-bold ml-2 ${textColor}`}>{t("settings.title")}</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Appearance Section */}
        <Text className={`text-sm font-semibold uppercase tracking-wider mb-3 ${secondaryText}`}>
          {t("settings.appearance")}
        </Text>
        <View className={`rounded-xl overflow-hidden mb-6 ${cardBg}`}>
          {themeOptions.map((option, index) => (
            <TouchableOpacity
              key={option.value}
              onPress={() => setThemeMode(option.value)}
              className={`flex-row items-center justify-between px-4 py-4 ${
                index < themeOptions.length - 1 ? "border-b border-gray-200 dark:border-gray-700" : ""
              }`}
            >
              <View className="flex-row items-center">
                {option.icon}
                <Text className={`ml-3 text-base ${textColor}`}>{t(option.labelKey)}</Text>
              </View>
              {themeMode === option.value && (
                <View className={`w-5 h-5 rounded-full ${activeBg}`} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Language Section */}
        <Text className={`text-sm font-semibold uppercase tracking-wider mb-3 ${secondaryText}`}>
          {t("settings.language")}
        </Text>
        <View className={`rounded-xl overflow-hidden mb-6 ${cardBg}`}>
          {languageOptions.map((option, index) => (
            <TouchableOpacity
              key={option.value}
              onPress={() => setLanguage(option.value)}
              className={`flex-row items-center justify-between px-4 py-4 ${
                index < languageOptions.length - 1 ? "border-b border-gray-200 dark:border-gray-700" : ""
              }`}
            >
              <View className="flex-row items-center">
                <Globe size={20} color={isDark ? "#fff" : "#374151"} />
                <Text className={`ml-3 text-base ${textColor}`}>{t(option.labelKey)}</Text>
              </View>
              {language === option.value && (
                <View className={`w-5 h-5 rounded-full ${activeBg}`} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* About Section */}
        <Text className={`text-sm font-semibold uppercase tracking-wider mb-3 ${secondaryText}`}>
          {t("settings.about")}
        </Text>
        <View className={`rounded-xl px-4 py-4 ${cardBg}`}>
          <View className="flex-row items-center justify-between">
            <Text className={`text-base ${textColor}`}>{t("settings.version")}</Text>
            <Text className={secondaryText}>{appVersion}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
