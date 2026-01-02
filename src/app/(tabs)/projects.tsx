import { View, Text, FlatList, KeyboardAvoidingView, Platform, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useProjects } from "@/store/useProjects";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Folder } from "lucide-react-native";
import { useTheme } from "@/core/theme/ThemeProvider";
import { useTranslation } from "react-i18next";

export default function ProjectsScreen() {
  const { projects, loadProjects, addProject } = useProjects();
  const [newProject, setNewProject] = useState("");
  const router = useRouter();
  const { isDark } = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    loadProjects();
  }, []);

  const handleAddProject = async () => {
    if (!newProject.trim()) return;
    await addProject(newProject);
    setNewProject("");
  };

  const bgColor = isDark ? "bg-slate-950" : "bg-gray-50";
  const textColor = isDark ? "text-white" : "text-gray-900";
  const secondaryText = isDark ? "text-slate-400" : "text-gray-500";
  const cardBg = isDark ? "bg-slate-800" : "bg-white";
  const borderColor = isDark ? "border-slate-700" : "border-gray-200";

  return (
    <SafeAreaView className={`flex-1 ${bgColor}`}>
      <KeyboardAvoidingView 
              behavior="padding"
              keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 40}
              className="flex-1"
            >
        <View className="flex-1 p-4">
          <View className="flex-row justify-between items-center mb-6">
              <TouchableOpacity onPress={() => router.push("/organize/contexts")}>
                  <Text className="text-blue-500 font-medium">{t("projects.manageContexts")}</Text>
              </TouchableOpacity>
          </View>

          <FlatList
            data={projects.filter(p => p.status === 'active')}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingBottom: 100 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => router.push(`/project/${item.id}`)}
                className={`p-4 mb-3 rounded-xl ${cardBg} border ${borderColor} shadow-sm flex-row items-center gap-3`}
              >
                <Folder size={24} color={isDark ? "#9ca3af" : "#4B5563"} />
                <View className="flex-1">
                    <Text className={`text-lg font-semibold ${textColor}`}>{item.title}</Text>
                    <Text className={secondaryText}>{item.status}</Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
                <View className="items-center justify-center p-10">
                    <Text className={`${secondaryText} text-center`}>{t("projects.emptyList")}</Text>
                </View>
            }
          />

          <View className="mt-4 gap-3">
            <Input
              value={newProject}
              onChangeText={setNewProject}
              placeholder={t("projects.placeholder")}
              returnKeyType="done"
              onSubmitEditing={handleAddProject}
            />
            <Button 
                title={t("projects.addProject")} 
                onPress={handleAddProject} 
                disabled={!newProject.trim()}
                className={!newProject.trim() ? "opacity-50" : ""}
            />
          </View>
        </View>
        </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
