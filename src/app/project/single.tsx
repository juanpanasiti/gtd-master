import { View, Text, FlatList, TouchableOpacity, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ListTodo, Plus, ChevronDown, ChevronUp } from "lucide-react-native";
import { useTasks } from "@/store/useTasks";
import { TaskItem } from "@/components/TaskItem";
import { useTheme } from "@/core/theme/ThemeProvider";
import { useTranslation } from "react-i18next";

export default function SingleActionsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { isDark } = useTheme();

  const { tasks, loadTasks, toggleTask, contexts, loadContexts, addTask } = useTasks();
  
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => {
    loadTasks();
    loadContexts();
  }, []);

  const handleQuickAdd = async () => {
    if (!newTaskTitle.trim()) return;
    // Add task with no project (goes to Inbox until context is assigned)
    await addTask(newTaskTitle, null, null);
    setNewTaskTitle("");
  };

  const activeSingleActions = useMemo(
    () => tasks.filter((t) => !t.project_id && t.context_id && t.status === "active" && !t.is_completed),
    [tasks]
  );

  const completedSingleActions = useMemo(
    () => tasks.filter((t) => !t.project_id && t.context_id && t.status === "active" && t.is_completed),
    [tasks]
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
        <ListTodo size={24} color={isDark ? "#60a5fa" : "#2563eb"} className="ml-2" />
        <Text className={`text-xl font-bold ml-3 flex-1 ${textColor}`}>
          Single Actions
        </Text>
      </View>

      {/* Quick Add Task */}
      <View className={`flex-row items-center p-4 border-b ${borderColor} ${headerBg}`}>
          <Plus size={20} color={isDark ? "#9ca3af" : "#6b7280"} />
          <TextInput
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              placeholder="Add task to Inbox..."
              placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
              className={`flex-1 ml-3 text-base ${textColor}`}
              onSubmitEditing={handleQuickAdd}
          />
          {newTaskTitle.length > 0 && (
              <TouchableOpacity onPress={handleQuickAdd}>
                  <Text className="font-bold text-blue-500">Add</Text>
              </TouchableOpacity>
          )}
      </View>
      {newTaskTitle.length === 0 && (
         <Text className={`px-4 pt-1 text-xs ${secondaryText} italic`}>New tasks added here go to Inbox until a context is assigned.</Text>
      )}

      <FlatList
        data={activeSingleActions}
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
          activeSingleActions.length > 0 ? (
            <Text className={`text-sm font-semibold uppercase tracking-wider mb-3 ${secondaryText}`}>
              Active ({activeSingleActions.length})
            </Text>
          ) : null
        }
        ListEmptyComponent={
          <View className="items-center justify-center p-10 mt-10">
            <View className={`${isDark ? "bg-gray-800" : "bg-gray-100"} p-6 rounded-full mb-4`}>
              <ListTodo size={48} color={isDark ? "#6b7280" : "#9ca3af"} />
            </View>
            <Text className={`text-xl font-bold mb-2 ${textColor}`}>No Actions</Text>
            <Text className={`${secondaryText} text-center`}>
              No single actions found.
            </Text>
          </View>
        }
        ListFooterComponent={
          completedSingleActions.length > 0 ? (
            <View className="mt-6">
              <TouchableOpacity 
                onPress={() => setShowCompleted(!showCompleted)}
                className="flex-row items-center justify-between py-2"
              >
                  <Text className={`text-sm font-semibold uppercase tracking-wider ${secondaryText}`}>
                    Completed ({completedSingleActions.length})
                  </Text>
                  {showCompleted ? (
                      <ChevronUp size={20} color={isDark ? "#9ca3af" : "#6b7280"} />
                  ) : (
                      <ChevronDown size={20} color={isDark ? "#9ca3af" : "#6b7280"} />
                  )}
              </TouchableOpacity>
              
              {showCompleted && (
                  <View className="mt-2">
                      {completedSingleActions.map((task) => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          onToggle={toggleTask}
                          context={contexts.find((c) => c.id === task.context_id)}
                        />
                      ))}
                  </View>
              )}
            </View>
          ) : null
        }
        ListFooterComponentStyle={{ marginTop: 20 }}
      />
    </SafeAreaView>
  );
}
