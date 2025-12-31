import { View, Text, FlatList, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform } from "react-native";
import { useTasks } from "@/store/useTasks";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useRouter } from "expo-router";

export default function Inbox() {
  const { tasks, loadTasks, addTask, toggleTask } = useTasks();
  const [newTask, setNewTask] = useState("");
  const router = useRouter();

  useEffect(() => {
    loadTasks();
  }, []);

  const handleAddTask = async () => {
    if (!newTask.trim()) return;
    await addTask(newTask);
    setNewTask("");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 p-4">
          <Text className="text-3xl font-bold mb-6 text-gray-900">Inbox</Text>

          <FlatList
            data={tasks}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingBottom: 100 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => router.push(`/task/${item.id}`)}
                className={`p-4 mb-3 rounded-xl border ${
                  item.is_completed 
                    ? "bg-gray-50 border-gray-100" 
                    : "bg-white border-gray-200 shadow-sm"
                }`}
              >
                <View className="flex-row items-center gap-3">
                   <TouchableOpacity onPress={() => toggleTask(item.id, item.is_completed)}>
                       <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                           item.is_completed ? "bg-green-500 border-green-500" : "border-gray-300"
                       }`}>
                           {item.is_completed && <Text className="text-white text-xs">✓</Text>}
                       </View>
                   </TouchableOpacity>
                   <Text className={`text-lg flex-1 ${
                       item.is_completed ? "text-gray-400 line-through" : "text-gray-800"
                   }`}>
                       {item.title}
                   </Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
                <View className="items-center justify-center p-10">
                    <Text className="text-gray-400 text-center">No tasks in Inbox</Text>
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
