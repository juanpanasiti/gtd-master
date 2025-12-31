import { View, Text, FlatList, SafeAreaView } from "react-native";
import { useTasks } from "@/store/useTasks";
import { useEffect, useMemo } from "react";
import { TaskItem } from "@/components/TaskItem";
import { Calendar } from "lucide-react-native";
import { useTheme } from "@/core/theme/ThemeProvider";
import { useTranslation } from "react-i18next";

export default function ReviewScreen() {
    const { tasks, loadTasks, toggleTask, contexts, loadContexts } = useTasks();
    const { isDark } = useTheme();
    const { t } = useTranslation();

    useEffect(() => {
        loadTasks();
        loadContexts();
    }, []);

    // Get tasks with due dates, sorted chronologically (soonest first)
    const upcomingTasks = useMemo(() => {
        return tasks
            .filter(task => !task.is_completed && task.due_date)
            .sort((a, b) => {
                const dateA = new Date(a.due_date!).getTime();
                const dateB = new Date(b.due_date!).getTime();
                return dateA - dateB;
            });
    }, [tasks]);

    const bgColor = isDark ? "bg-slate-950" : "bg-gray-50";
    const textColor = isDark ? "text-white" : "text-gray-900";
    const secondaryText = isDark ? "text-slate-400" : "text-gray-500";
    const emptyBg = isDark ? "bg-slate-800" : "bg-gray-100";

    const formatDueDate = (date: Date | string) => {
        const d = new Date(date);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (d.toDateString() === today.toDateString()) {
            return { text: "Today", color: isDark ? "text-red-400" : "text-red-600" };
        }
        if (d.toDateString() === tomorrow.toDateString()) {
            return { text: "Tomorrow", color: isDark ? "text-orange-400" : "text-orange-600" };
        }
        
        const diffTime = d.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
            return { text: `${Math.abs(diffDays)} days overdue`, color: isDark ? "text-red-400" : "text-red-600" };
        }
        if (diffDays <= 7) {
            return { text: d.toLocaleDateString(undefined, { weekday: 'long' }), color: isDark ? "text-yellow-400" : "text-yellow-600" };
        }
        
        return { 
            text: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), 
            color: secondaryText 
        };
    };

    return (
        <SafeAreaView className={`flex-1 ${bgColor}`}>
            <View className="flex-1 p-4">
                <FlatList
                    data={upcomingTasks}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    renderItem={({ item }) => {
                        const dueDateInfo = formatDueDate(item.due_date!);
                        return (
                            <View>
                                <View className="flex-row items-center mb-1 ml-1">
                                    <Calendar size={14} color={isDark ? "#94a3b8" : "#6b7280"} />
                                    <Text className={`ml-2 text-sm font-semibold ${dueDateInfo.color}`}>
                                        {dueDateInfo.text}
                                    </Text>
                                </View>
                                <TaskItem 
                                    task={item} 
                                    onToggle={toggleTask}
                                    context={contexts.find(c => c.id === item.context_id)}
                                />
                            </View>
                        );
                    }}
                    ListEmptyComponent={
                        <View className="items-center justify-center p-10 mt-10">
                            <View className={`${emptyBg} p-6 rounded-full mb-4`}>
                                <Calendar size={48} color={isDark ? "#6b7280" : "#9ca3af"} />
                            </View>
                            <Text className={`text-xl font-bold mb-2 ${textColor}`}>
                                No Upcoming Reviews
                            </Text>
                            <Text className={`${secondaryText} text-center`}>
                                Tasks with due dates will appear here.{"\n"}
                                Add dates to your tasks to plan ahead.
                            </Text>
                        </View>
                    }
                />
            </View>
        </SafeAreaView>
    );
}
