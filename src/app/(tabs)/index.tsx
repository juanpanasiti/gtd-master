import { View, Text, FlatList, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTasks } from "@/store/useTasks";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useRouter } from "expo-router";
import { TaskItem } from "@/components/TaskItem";
import { Inbox as InboxIcon } from "lucide-react-native";
import { useTheme } from "@/core/theme/ThemeProvider";
import { useTranslation } from "react-i18next";

export default function Inbox() {
  const { tasks, loadTasks, addTask, toggleTask, contexts, loadContexts } = useTasks();
  const [newTask, setNewTask] = useState("");
  const router = useRouter();
  const { isDark } = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    loadTasks();
    loadContexts();
  }, []);

  const handleAddTask = async () => {
    if (!newTask.trim()) return;
    await addTask(newTask);
    setNewTask("");
  };

  // Inbox Logic: Active tasks with no Project and no Context
  const inboxTasks = tasks.filter(t => !t.is_completed && !t.project_id && !t.context_id);

  const bgColor = isDark ? "bg-slate-950" : "bg-gray-50";
  const textColor = isDark ? "text-white" : "text-gray-900";
  const secondaryText = isDark ? "text-slate-400" : "text-gray-500";
  const emptyBg = isDark ? "bg-slate-800" : "bg-gray-100";

  return (
    <SafeAreaView className={`flex-1 ${bgColor}`}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 p-4">
          <FlatList
            data={inboxTasks}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingBottom: 100 }}
            renderItem={({ item }) => (
                <TaskItem 
                    task={item} 
                    onToggle={toggleTask}
                    context={contexts.find(c => c.id === item.context_id)} 
                />
            )}
            ListEmptyComponent={
                <View className="items-center justify-center p-10 mt-10">
                    <View className={`${emptyBg} p-6 rounded-full mb-4`}>
                        <InboxIcon size={48} color={isDark ? "#6b7280" : "#9ca3af"} />
                    </View>
                    <Text className={`text-xl font-bold mb-2 ${textColor}`}>
                        {t("inbox.emptyTitle")}
                    </Text>
                    <Text className={`${secondaryText} text-center`}>
                        {t("inbox.emptyDescription")}
                    </Text>
                </View>
            }
          />

          <View className="mt-4 gap-3">
            <Input
              value={newTask}
              onChangeText={setNewTask}
              placeholder={t("inbox.placeholder")}
              returnKeyType="done"
              onSubmitEditing={handleAddTask}
            />
            <Button 
                title={t("inbox.captureTask")} 
                onPress={handleAddTask} 
                disabled={!newTask.trim()}
                className={!newTask.trim() ? "opacity-50" : ""}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
