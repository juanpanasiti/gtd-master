import { View, Text, SectionList, KeyboardAvoidingView, Platform, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useProjects } from "@/store/useProjects";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Folder, ListTodo, Search as SearchIcon, Settings } from "lucide-react-native";
import { useTheme } from "@/core/theme/ThemeProvider";
import { useTranslation } from "react-i18next";

export default function ProjectsScreen() {
  const { projects, loadProjects, addProject, areas, loadAreas } = useProjects();
  const [newProject, setNewProject] = useState("");
  const router = useRouter();
  const { isDark } = useTheme();
  const { t } = useTranslation();
 
  useEffect(() => {
    loadProjects();
    loadAreas();
  }, []);
 
  const sections = useMemo(() => {
    const activeProjects = projects.filter(p => p.status === 'active');
    
    const groups = activeProjects.reduce((acc, p) => {
        const areaId = p.area_id;
        if (!areaId) {
            if (!acc['null']) {
                acc['null'] = { title: t("projects.noArea"), color: "#9ca3af", data: [] };
            }
            acc['null'].data.push(p);
        } else {
            if (!acc[areaId]) {
                const area = areas.find(a => a.id === areaId);
                acc[areaId] = { 
                    title: area?.title || "Unknown Area", 
                    color: area?.color || "#9ca3af", 
                    data: [] 
                };
            }
            acc[areaId].data.push(p);
        }
        return acc;
    }, {} as Record<string, { title: string, color: string, data: typeof projects }>);

    return Object.values(groups).sort((a, b) => {
        if (a.title === t("projects.noArea")) return 1;
        if (b.title === t("projects.noArea")) return -1;
        return a.title.localeCompare(b.title);
    });
  }, [projects, areas, t]);

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
          <View className="flex-row items-center justify-between mb-6 px-2">
            <View className="flex-row items-center">
              <View className="bg-blue-500/10 p-2 rounded-lg">
                <Folder size={24} color="#3b82f6" />
              </View>
              <Text className={`ml-3 text-2xl font-bold ${textColor}`}>
                {t("projects.title")}
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
                <TouchableOpacity 
                    onPress={() => router.push("/search")}
                    className={`${isDark ? "bg-slate-800" : "bg-gray-100"} p-2.5 rounded-xl`}
                >
                    <SearchIcon size={20} color={isDark ? "#94a3b8" : "#64748b"} />
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={() => router.push("/settings")}
                    className={`${isDark ? "bg-slate-800" : "bg-gray-100"} p-2.5 rounded-xl`}
                >
                    <Settings size={20} color={isDark ? "#94a3b8" : "#64748b"} />
                </TouchableOpacity>
            </View>
          </View>

          <View className="flex-row gap-2 mb-4 px-2">
            <TouchableOpacity 
                onPress={() => router.push("/organize/areas")}
                className="flex-1 bg-blue-500/10 py-2.5 rounded-xl border border-blue-500/20 items-center justify-center flex-row gap-2"
            >
                <Folder size={16} color="#3b82f6" />
                <Text className="text-blue-500 font-bold text-xs uppercase tracking-tight">{t("projects.manageAreas")}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                onPress={() => router.push("/organize/contexts")}
                className="flex-1 bg-blue-500/10 py-2.5 rounded-xl border border-blue-500/20 items-center justify-center flex-row gap-2"
            >
                <ListTodo size={16} color="#3b82f6" />
                <Text className="text-blue-500 font-bold text-xs uppercase tracking-tight">{t("projects.manageContexts")}</Text>
            </TouchableOpacity>
          </View>

          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingBottom: 100 }}
            renderSectionHeader={({ section: { title, color } }) => (
                <View className="flex-row items-center py-2 mt-4 mb-2">
                    <View 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: color }} 
                    />
                    <Text className={`text-lg font-bold uppercase tracking-wider ${textColor === "text-white" ? "text-slate-300" : "text-gray-700"}`}>
                        {title}
                    </Text>
                </View>
            )}
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
            ListHeaderComponent={
                <TouchableOpacity
                    onPress={() => router.push("/project/single")}
                    className={`p-4 mb-3 rounded-xl ${cardBg} border ${borderColor} shadow-sm flex-row items-center gap-3`}
                >
                    <ListTodo size={24} color={isDark ? "#60a5fa" : "#2563eb"} />
                    <View className="flex-1">
                        <Text className={`text-lg font-semibold ${textColor}`}>Single Actions</Text>
                        <Text className={secondaryText}>Tasks without a project</Text>
                    </View>
                </TouchableOpacity>
            }
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
