import { Tabs } from "expo-router";
import { Inbox, Folder, CheckCircle, Calendar } from "lucide-react-native";
import { useColorScheme } from "nativewind"; // Assuming simple dark mode support if needed

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563eb', // blue-600
        tabBarInactiveTintColor: '#9ca3af', // gray-400
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Inbox",
          tabBarIcon: ({ color }) => <Inbox size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: "Organize",
          tabBarIcon: ({ color }) => <Folder size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="engage"
        options={{
          title: "Engage",
          tabBarIcon: ({ color }) => <CheckCircle size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="review"
        options={{
          title: "Review",
          tabBarIcon: ({ color }) => <Calendar size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
