import { View, Text, TouchableOpacity, ScrollView, Switch, Platform, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Sun, Moon, Smartphone, Globe, Bell, Calendar, Clock, MessageSquare, ChevronRight } from "lucide-react-native";
import { useSettings, ThemeMode, Language } from "@/store/useSettings";
import { useTheme } from "@/core/theme/ThemeProvider";
import { changeLanguage } from "@/core/i18n";
import { useEffect, useState } from "react";
import Constants from "expo-constants";
import DateTimePicker from "@react-native-community/datetimepicker";

type ThemeOption = { value: ThemeMode; labelKey: string; icon: React.ReactNode };
type LanguageOption = { value: Language; labelKey: string };

export default function SettingsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { 
    themeMode, language, setThemeMode, setLanguage,
    dailyReminderEnabled, dailyReminderTime, 
    weeklyReminderEnabled, weeklyReminderDay, weeklyReminderTime,
    setDailyReminderEnabled, setDailyReminderTime,
    setWeeklyReminderEnabled, setWeeklyReminderDay, setWeeklyReminderTime
  } = useSettings();
  const { isDark } = useTheme();

  const [showDailyPicker, setShowDailyPicker] = useState(false);
  const [showWeeklyPicker, setShowWeeklyPicker] = useState(false);
  const [showDayPicker, setShowDayPicker] = useState(false);

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

        {/* Notifications Section */}
        <Text className={`text-sm font-semibold uppercase tracking-wider mb-3 ${secondaryText}`}>
          {t("settings.notifications")}
        </Text>
        <View className={`rounded-xl overflow-hidden mb-6 ${cardBg}`}>
          {/* Daily Reminder Toggle */}
          <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700">
            <View className="flex-row items-center flex-1">
              <Bell size={20} color={isDark ? "#fff" : "#374151"} />
              <View className="ml-3">
                <Text className={`text-base ${textColor}`}>{t("settings.dailyReminder")}</Text>
                <Text className={`text-xs ${secondaryText}`}>{t("settings.dailyReminderDesc")}</Text>
              </View>
            </View>
            <Switch
              value={dailyReminderEnabled}
              onValueChange={setDailyReminderEnabled}
              trackColor={{ false: "#767577", true: "#3b82f6" }}
            />
          </View>

          {/* Daily Reminder Time */}
          {dailyReminderEnabled && (
            <TouchableOpacity
              onPress={() => setShowDailyPicker(true)}
              className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700"
            >
              <View className="flex-row items-center">
                <Clock size={20} color={isDark ? "#fff" : "#374151"} />
                <Text className={`ml-3 text-base ${textColor}`}>{t("settings.reminderTime")}</Text>
              </View>
              <Text className={`text-base font-bold text-blue-500`}>{dailyReminderTime}</Text>
            </TouchableOpacity>
          )}

          {/* Weekly Reminder Toggle */}
          <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700">
            <View className="flex-row items-center flex-1">
              <Calendar size={20} color={isDark ? "#fff" : "#374151"} />
              <View className="ml-3">
                <Text className={`text-base ${textColor}`}>{t("settings.weeklyReminder")}</Text>
                <Text className={`text-xs ${secondaryText}`}>{t("settings.weeklyReminderDesc")}</Text>
              </View>
            </View>
            <Switch
              value={weeklyReminderEnabled}
              onValueChange={setWeeklyReminderEnabled}
              trackColor={{ false: "#767577", true: "#3b82f6" }}
            />
          </View>

          {/* Weekly Reminder Day */}
          {weeklyReminderEnabled && (
            <TouchableOpacity
              onPress={() => setShowDayPicker(true)}
              className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700"
            >
              <View className="flex-row items-center">
                <Calendar size={20} color={isDark ? "#fff" : "#374151"} />
                <Text className={`ml-3 text-base ${textColor}`}>{t("settings.reminderDay")}</Text>
              </View>
              <Text className={`text-base font-bold text-blue-500`}>
                {t(`common.days.${weeklyReminderDay}`)}
              </Text>
            </TouchableOpacity>
          )}

          {/* Weekly Reminder Time */}
          {weeklyReminderEnabled && (
            <TouchableOpacity
              onPress={() => setShowWeeklyPicker(true)}
              className="flex-row items-center justify-between px-4 py-4"
            >
              <View className="flex-row items-center">
                <Clock size={20} color={isDark ? "#fff" : "#374151"} />
                <Text className={`ml-3 text-base ${textColor}`}>{t("settings.reminderTime")}</Text>
              </View>
              <Text className={`text-base font-bold text-blue-500`}>{weeklyReminderTime}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Pickers */}
        {showDailyPicker && (
          <DateTimePicker
            mode="time"
            is24Hour={true}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            value={(() => {
              const [h, m] = dailyReminderTime.split(':').map(Number);
              const d = new Date();
              d.setHours(h, m, 0, 0);
              return d;
            })()}
            onChange={(event, date) => {
              setShowDailyPicker(false);
              if (date) {
                const h = date.getHours().toString().padStart(2, '0');
                const m = date.getMinutes().toString().padStart(2, '0');
                setDailyReminderTime(`${h}:${m}`);
              }
            }}
          />
        )}

        {showWeeklyPicker && (
          <DateTimePicker
            mode="time"
            is24Hour={true}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            value={(() => {
              const [h, m] = weeklyReminderTime.split(':').map(Number);
              const d = new Date();
              d.setHours(h, m, 0, 0);
              return d;
            })()}
            onChange={(event, date) => {
              setShowWeeklyPicker(false);
              if (date) {
                const h = date.getHours().toString().padStart(2, '0');
                const m = date.getMinutes().toString().padStart(2, '0');
                setWeeklyReminderTime(`${h}:${m}`);
              }
            }}
          />
        )}

        {showDayPicker && (
           <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 z-50 p-4 border-t border-gray-200 dark:border-gray-700">
              <View className="flex-row justify-between items-center mb-4">
                <Text className={`text-lg font-bold ${textColor}`}>{t("settings.reminderDay")}</Text>
                <TouchableOpacity onPress={() => setShowDayPicker(false)}>
                  <Text className="text-blue-500 font-bold">{t("common.done")}</Text>
                </TouchableOpacity>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                  <TouchableOpacity
                    key={day}
                    onPress={() => {
                      setWeeklyReminderDay(day);
                      // On mobile we might want to keep it open or close it
                    }}
                    className={`px-4 py-2 rounded-full border ${
                      weeklyReminderDay === day 
                        ? "bg-blue-500 border-blue-500" 
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    <Text className={weeklyReminderDay === day ? "text-white" : textColor}>
                      {t(`common.days.${day}`).substring(0, 3)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
           </View>
        )}

        {/* About Section */}
        <Text className={`text-sm font-semibold uppercase tracking-wider mb-3 ${secondaryText}`}>
          {t("settings.about")}
        </Text>
        <View className={`rounded-xl overflow-hidden mb-6 ${cardBg}`}>
          <TouchableOpacity 
            onPress={() => Linking.openURL("https://forms.gle/NWtjT1tEe4TBVu277")}
            className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700"
          >
            <View className="flex-row items-center">
              <MessageSquare size={20} color={isDark ? "#fff" : "#374151"} />
              <View className="ml-3">
                <Text className={`text-base ${textColor}`}>{t("settings.feedback")}</Text>
                <Text className={`text-xs ${secondaryText}`}>{t("settings.reportBug")}</Text>
              </View>
            </View>
            <ChevronRight size={18} color={isDark ? "#4b5563" : "#9ca3af"} />
          </TouchableOpacity>

          <View className="flex-row items-center justify-between px-4 py-4">
            <Text className={`text-base ${textColor}`}>{t("settings.version")}</Text>
            <Text className={secondaryText}>{appVersion}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
