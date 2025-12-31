import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo } from "react";
import { ArrowLeft, Folder } from "lucide-react-native";
import { useTasks } from "@/store/useTasks";
import { useProjects } from "@/store/useProjects";
import { TaskItem } from "@/components/TaskItem";
import { useTheme } from "@/core/theme/ThemeProvider";
import { useTranslation } from "react-i18next";

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { isDark } = useTheme();

  const { tasks, loadTasks, toggleTask, contexts, loadContexts } = useTasks();
  const { projects, loadProjects } = useProjects();

  const projectId = parseInt(id || "0", 10);

  useEffect(() => {
    loadProjects();
    loadTasks();
    loadContexts();
  }, []);

  const project = useMemo(
    () => projects.find((p) => p.id === projectId),
    [projects, projectId]
  );

  const projectTasks = useMemo(
    () => tasks.filter((t) => t.project_id === projectId && !t.is_completed),
    [tasks, projectId]
  );

  const completedTasks = useMemo(
    () => tasks.filter((t) => t.project_id === projectId && t.is_completed),
    [tasks, projectId]
  );

  const bgColor = isDark ? "bg-gray-900" : "bg-white";
  const textColor = isDark ? "text-white" : "text-gray-900";
  const secondaryText = isDark ? "text-gray-400" : "text-gray-500";
  const headerBg = isDark ? "bg-gray-800" : "bg-white";
  const borderColor = isDark ? "border-gray-700" : "border-gray-200";

  return (
    <SafeAreaView className={`flex-1 ${bgColor}`}>
      {/* Header */}
      <View className={`flex-row items-center px-4 py-3 border-b ${borderColor} ${headerBg}`}>
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft size={24} color={isDark ? "#fff" : "#374151"} />
        </TouchableOpacity>
        <Folder size={24} color={isDark ? "#9ca3af" : "#4b5563"} className="ml-2" />
        <Text className={`text-xl font-bold ml-3 ${textColor}`}>
          {project?.title || "Project"}
        </Text>
      </View>

      <FlatList
        data={projectTasks}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <TaskItem
            task={item}
            onToggle={toggleTask}
            context={contexts.find((c) => c.id === item.context_id)}
          />
        )}
        ListHeaderComponent={
          projectTasks.length > 0 ? (
            <Text className={`text-sm font-semibold uppercase tracking-wider mb-3 ${secondaryText}`}>
              Active Tasks ({projectTasks.length})
            </Text>
          ) : null
        }
        ListEmptyComponent={
          <View className="items-center justify-center p-10 mt-10">
            <View className={`${isDark ? "bg-gray-800" : "bg-gray-100"} p-6 rounded-full mb-4`}>
              <Folder size={48} color={isDark ? "#6b7280" : "#9ca3af"} />
            </View>
            <Text className={`text-xl font-bold mb-2 ${textColor}`}>No Tasks</Text>
            <Text className={`${secondaryText} text-center`}>
              No active tasks in this project.{"\n"}
              Assign tasks from the Inbox.
            </Text>
          </View>
        }
        ListFooterComponent={
          completedTasks.length > 0 ? (
            <View className="mt-6">
              <Text className={`text-sm font-semibold uppercase tracking-wider mb-3 ${secondaryText}`}>
                Completed ({completedTasks.length})
              </Text>
              {completedTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={toggleTask}
                  context={contexts.find((c) => c.id === task.context_id)}
                />
              ))}
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
