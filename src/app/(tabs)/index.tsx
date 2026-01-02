import { View, Text, FlatList, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTasks } from "@/store/useTasks";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useRouter } from "expo-router";
import { TaskItem } from "@/components/TaskItem";
import { Inbox as InboxIcon, Zap } from "lucide-react-native";
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

  const handleTwoMinuteRule = async (taskId: number, taskTitle: string) => {
    Alert.alert(
      t("inbox.twoMinuteRule"),
      t("inbox.completeTaskConfirm", { taskTitle }),
      [
        { text: t("common.cancel"), style: "cancel" },
        { 
          text: t("common.complete"), 
          onPress: async () => {
            await toggleTask(taskId, false);
            Alert.alert(t("common.done"), t("inbox.twoMinuteRuleApplied"));
          }
        }
      ]
    );
  };

  // Inbox Logic: Active tasks with no Project and no Context
  const inboxTasks = tasks.filter(t => !t.is_completed && !t.project_id && !t.context_id);

  const bgColor = isDark ? "bg-slate-950" : "bg-gray-50";
  const textColor = isDark ? "text-white" : "text-gray-900";
  const secondaryText = isDark ? "text-slate-400" : "text-gray-500";
  const emptyBg = isDark ? "bg-slate-800" : "bg-gray-100";
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
          <FlatList
            data={inboxTasks}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
                <View className="relative">
                    <TaskItem 
                        task={item} 
                        onToggle={toggleTask}
                        context={contexts.find(c => c.id === item.context_id)} 
                    />
                    {/* 2-Minute Rule Button */}
                    <TouchableOpacity
                        onPress={() => handleTwoMinuteRule(item.id, item.title)}
                        className={`absolute right-0 top-0 ${cardBg} border ${borderColor} p-3 rounded-lg shadow-lg`}
                        style={{ transform: [{ translateY: 8 }, { translateX: -8 }] }}
                    >
                        <Zap size={20} color={isDark ? "#fbbf24" : "#f59e0b"} fill={isDark ? "#fbbf24" : "#f59e0b"} />
                    </TouchableOpacity>
                </View>
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
