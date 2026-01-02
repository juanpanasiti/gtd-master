import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTasks } from "@/store/useTasks";
import { useEffect, useMemo, useState } from "react";
import { TaskItem } from "@/components/TaskItem";
import { Calendar, Clock, Moon, ChevronDown, ChevronRight } from "lucide-react-native";
import { useTheme } from "@/core/theme/ThemeProvider";
import { useTranslation } from "react-i18next";

export default function ReviewScreen() {
    const { tasks, loadTasks, toggleTask, contexts, loadContexts } = useTasks();
    const { isDark } = useTheme();
    const { t } = useTranslation();
    const [somedayExpanded, setSomedayExpanded] = useState(false);

    useEffect(() => {
        loadTasks();
        loadContexts();
    }, []);

    // Get tasks with due dates, sorted chronologically (soonest first)
    const upcomingTasks = useMemo(() => {
        return tasks
            .filter(task => !task.is_completed && task.status === "active" && task.due_date)
            .sort((a, b) => {
                const dateA = new Date(a.due_date!).getTime();
                const dateB = new Date(b.due_date!).getTime();
                return dateA - dateB;
            });
    }, [tasks]);

    // Get waiting tasks
    const waitingTasks = useMemo(() => {
        return tasks.filter(task => !task.is_completed && task.status === "waiting");
    }, [tasks]);

    const cardBg = isDark ? "bg-slate-800" : "bg-white";
    const borderColor = isDark ? "border-slate-700" : "border-gray-200";
    // Get someday tasks
    const somedayTasks = useMemo(() => {
        return tasks.filter(task => !task.is_completed && task.status === "someday");
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
            return { text: d.toLocaleDateString(undefined, { weekday: 'long' }), color: isDark ? "text-blue-400" : "text-blue-600" };
        }
        
        return { text: d.toLocaleDateString(), color: secondaryText };
    };

    return (
        <SafeAreaView className={`flex-1 ${bgColor}`}>
            <View className="flex-1">
                <FlatList
                    data={upcomingTasks}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    ListHeaderComponent={
                        <View className="px-4 pt-4 pb-2">
                            <View className="flex-row items-center mb-3">
                                <Calendar size={20} color={isDark ? "#94a3b8" : "#6b7280"} />
                                <Text className={`ml-2 text-xl font-bold ${textColor}`}>
                                    Agenda
                                </Text>
                            </View>
                        </View>
                    }
                    renderItem={({ item }) => {
                        const dueDateInfo = formatDueDate(item.due_date!);
                        return (
                            <View className="px-4">
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

                    ListFooterComponent={
                        <View className="px-4 mt-6">
                            {/* Waiting Section */}
                            <View className="mb-6">
                                <View className="flex-row items-center mb-3">
                                    <Clock size={20} color={isDark ? "#22d3ee" : "#06b6d4"} />
                                    <Text className={`ml-2 text-xl font-bold ${textColor}`}>
                                        En Espera
                                    </Text>
                                    <View className={`ml-2 px-2 py-0.5 rounded-full ${isDark ? "bg-cyan-900/30" : "bg-cyan-100"}`}>
                                        <Text className={`text-xs font-bold ${isDark ? "text-cyan-400" : "text-cyan-700"}`}>
                                            {waitingTasks.length}
                                        </Text>
                                    </View>
                                </View>
                                {waitingTasks.length === 0 ? (
                                    <View className={`${cardBg} p-4 rounded-lg border ${borderColor}`}>
                                        <Text className={`${secondaryText} text-center`}>
                                            No tasks waiting for others
                                        </Text>
                                    </View>
                                ) : (
                                    waitingTasks.map(task => (
                                        <View key={task.id} className="mb-2">
                                            <TaskItem 
                                                task={task} 
                                                onToggle={toggleTask}
                                                context={contexts.find(c => c.id === task.context_id)}
                                            />
                                            {task.delegate_name && (
                                                <Text className={`ml-12 mt-1 text-sm ${isDark ? "text-cyan-400" : "text-cyan-600"}`}>
                                                    ⏳ Esperando a: {task.delegate_name}
                                                </Text>
                                            )}
                                        </View>
                                    ))
                                )}
                            </View>

                            {/* Someday/Maybe Section */}
                            <View className="mb-6">
                                <TouchableOpacity 
                                    onPress={() => setSomedayExpanded(!somedayExpanded)}
                                    className="flex-row items-center mb-3"
                                >
                                    {somedayExpanded ? (
                                        <ChevronDown size={20} color={isDark ? "#fbbf24" : "#f59e0b"} />
                                    ) : (
                                        <ChevronRight size={20} color={isDark ? "#fbbf24" : "#f59e0b"} />
                                    )}
                                    <Moon size={20} color={isDark ? "#fbbf24" : "#f59e0b"} className="ml-1" />
                                    <Text className={`ml-2 text-xl font-bold ${textColor}`}>
                                        Algún día / Tal vez
                                    </Text>
                                    <View className={`ml-2 px-2 py-0.5 rounded-full ${isDark ? "bg-amber-900/30" : "bg-amber-100"}`}>
                                        <Text className={`text-xs font-bold ${isDark ? "text-amber-400" : "text-amber-700"}`}>
                                            {somedayTasks.length}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                                
                                {somedayExpanded && (
                                    somedayTasks.length === 0 ? (
                                        <View className={`${cardBg} p-4 rounded-lg border ${borderColor}`}>
                                            <Text className={`${secondaryText} text-center`}>
                                                No someday/maybe tasks
                                            </Text>
                                        </View>
                                    ) : (
                                        somedayTasks.map(task => (
                                            <TaskItem 
                                                key={task.id}
                                                task={task} 
                                                onToggle={toggleTask}
                                                context={contexts.find(c => c.id === task.context_id)}
                                            />
                                        ))
                                    )
                                )}
                            </View>
                        </View>
                    }
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
