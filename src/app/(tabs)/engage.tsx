import { View, Text, SectionList, SafeAreaView } from "react-native";
import { useTasks } from "@/store/useTasks";
import { useEffect, useMemo } from "react";
import { TaskItem } from "@/components/TaskItem";
import { CheckCircle } from "lucide-react-native";

export default function EngageScreen() {
    const { tasks, loadTasks, toggleTask, contexts, loadContexts } = useTasks();

    useEffect(() => {
        loadTasks();
        loadContexts();
    }, []);

    const sections = useMemo(() => {
        // 1. Get active tasks with contexts
        const activeTasks = tasks.filter(t => !t.is_completed && t.context_id);
        
        // 2. Group by context
        const grouped = activeTasks.reduce((acc, task) => {
            const ctxId = task.context_id!;
            if (!acc[ctxId]) {
                const ctx = contexts.find(c => c.id === ctxId);
                acc[ctxId] = {
                    title: ctx?.title || "Unknown Context",
                    color: ctx?.color || "#9ca3af",
                    data: []
                };
            }
            acc[ctxId].data.push(task);
            return acc;
        }, {} as Record<number, { title: string, color: string, data: typeof tasks }>);

        // 3. Convert to array
        return Object.values(grouped);
    }, [tasks, contexts]);

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1 p-4">
                <Text className="text-3xl font-bold mb-6 text-gray-900">Engage</Text>

                <SectionList
                    sections={sections}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <TaskItem 
                            task={item} 
                            onToggle={toggleTask}
                            context={contexts.find(c => c.id === item.context_id)}
                        />
                    )}
                    renderSectionHeader={({ section: { title, color } }) => (
                        <View className="flex-row items-center py-2 bg-white/95 backdrop-blur-sm mt-4 mb-2">
                             <View 
                                className="w-3 h-3 rounded-full mr-2" 
                                style={{ backgroundColor: color }} 
                            />
                            <Text className="text-lg font-bold text-gray-700 uppercase tracking-wider">
                                {title}
                            </Text>
                        </View>
                    )}
                    ListEmptyComponent={
                        <View className="items-center justify-center p-10 mt-10">
                            <View className="bg-blue-50 p-6 rounded-full mb-4">
                                <CheckCircle size={48} color="#3b82f6" />
                            </View>
                            <Text className="text-xl font-bold text-gray-800 mb-2">Ready to Engage?</Text>
                            <Text className="text-gray-500 text-center">
                                No contextual next actions found.{"\n"}Check your Inbox to categorize tasks.
                            </Text>
                        </View>
                    }
                    contentContainerStyle={{ paddingBottom: 100 }}
                />
            </View>
        </SafeAreaView>
    );
}
