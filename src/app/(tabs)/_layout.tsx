import { Tabs, useRouter } from "expo-router";
import { Inbox, Folder, CheckCircle, Calendar, Settings } from "lucide-react-native";
import { TouchableOpacity } from "react-native";
import { useTheme } from "@/core/theme/ThemeProvider";
import { useTranslation } from "react-i18next";

export default function TabLayout() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { t } = useTranslation();

  const bgColor = isDark ? "#111827" : "#ffffff"; // gray-900 : white
  const activeTint = "#2563eb"; // blue-600
  const inactiveTint = isDark ? "#6b7280" : "#9ca3af"; // gray-500 : gray-400
  const headerBg = isDark ? "#1f2937" : "#ffffff"; // gray-800 : white
  const headerText = isDark ? "#ffffff" : "#111827"; // white : gray-900

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: headerBg },
        headerTintColor: headerText,
        headerRight: () => (
          <TouchableOpacity onPress={() => router.push("/settings")} className="mr-4">
            <Settings size={24} color={inactiveTint} />
          </TouchableOpacity>
        ),
        tabBarActiveTintColor: activeTint,
        tabBarInactiveTintColor: inactiveTint,
        tabBarStyle: { backgroundColor: bgColor },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.inbox"),
          tabBarIcon: ({ color }) => <Inbox size={24} color={color} />,
          href: "/",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: t("tabs.organize"),
          tabBarIcon: ({ color }) => <Folder size={24} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="engage"
        options={{
          title: t("tabs.engage"),
          tabBarIcon: ({ color }) => <CheckCircle size={24} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="review"
        options={{
          title: t("tabs.review"),
          tabBarIcon: ({ color }) => <Calendar size={24} color={color} />,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
