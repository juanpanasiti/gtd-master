import { View, Text, FlatList, SafeAreaView, KeyboardAvoidingView, Platform } from "react-native";
import { useTasks } from "@/store/useTasks";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useRouter } from "expo-router";
import { TaskItem } from "@/components/TaskItem";
import { Inbox as InboxIcon } from "lucide-react-native";

export default function Inbox() {
  const { tasks, loadTasks, addTask, toggleTask, contexts, loadContexts } = useTasks();
  const [newTask, setNewTask] = useState("");
  const router = useRouter();

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

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 p-4">
          <Text className="text-3xl font-bold mb-6 text-gray-900">Inbox</Text>

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
                    <View className="bg-gray-100 p-6 rounded-full mb-4">
                        <InboxIcon size={48} color="#9ca3af" />
                    </View>
                    <Text className="text-xl font-bold text-gray-800 mb-2">Tray Empty</Text>
                    <Text className="text-gray-500 text-center">
                        You have processed all your items.{"\n"}Capture more things or check Engage.
                    </Text>
                </View>
            }
          />

          <View className="mt-4 gap-3">
            <Input
              value={newTask}
              onChangeText={setNewTask}
              placeholder="I need to..."
              returnKeyType="done"
              onSubmitEditing={handleAddTask}
            />
            <Button 
                title="Capture Task" 
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
