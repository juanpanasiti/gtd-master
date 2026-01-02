import { View, Text, FlatList, TouchableOpacity, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Folder, Edit2, Check, X as XIcon, Trash2 } from "lucide-react-native";
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
  const { projects, loadProjects, updateProject, deleteProject } = useProjects();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");

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

  useEffect(() => {
    if (project) {
        setEditTitle(project.title);
    }
  }, [project]);

  const handleUpdate = async () => {
    if (!editTitle.trim()) return;
    await updateProject(projectId, { title: editTitle });
    setIsEditing(false);
  };

  const handleDelete = () => {
    Alert.alert(
        "Delete Project",
        "Are you sure you want to delete this project? All associated tasks will remain but lose their project assignment.",
        [
            { text: "Cancel", style: "cancel" },
            { 
                text: "Delete", 
                style: "destructive",
                onPress: async () => {
                    await deleteProject(projectId);
                    router.back();
                }
            }
        ]
    );
  };

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
        
        {isEditing ? (
            <View className="flex-1 flex-row items-center ml-3">
                <TextInput
                    value={editTitle}
                    onChangeText={setEditTitle}
                    className={`flex-1 text-xl font-bold ${textColor} border-b ${borderColor} mr-2`}
                    autoFocus
                />
                <TouchableOpacity onPress={handleUpdate} className="p-2">
                    <Check size={20} color={isDark ? "#4ade80" : "#16a34a"} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsEditing(false)} className="p-2">
                    <XIcon size={20} color={isDark ? "#f87171" : "#dc2626"} />
                </TouchableOpacity>
            </View>
        ) : (
            <>
                <Text className={`text-xl font-bold ml-3 flex-1 ${textColor}`} numberOfLines={1}>
                    {project?.title || "Project"}
                </Text>
                <TouchableOpacity onPress={() => setIsEditing(true)} className="p-2">
                    <Edit2 size={20} color={isDark ? "#9ca3af" : "#4b5563"} />
                </TouchableOpacity>
            </>
        )}
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
        ListFooterComponentStyle={{ marginTop: 20 }}
      />
      
      {/* Footer Delete Action */}
      <View className={`border-t ${borderColor} p-4`}>
        <TouchableOpacity 
            onPress={handleDelete}
            className="flex-row items-center justify-center p-3 rounded-lg bg-red-50 dark:bg-red-900/20"
        >
            <Trash2 size={20} color={isDark ? "#f87171" : "#dc2626"} />
            <Text className={`ml-2 font-semibold ${isDark ? "text-red-400" : "text-red-600"}`}>
                Delete Project
            </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
