import { View, Text, SectionList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTasks } from "@/store/useTasks";
import { useEffect, useMemo } from "react";
import { TaskItem } from "@/components/TaskItem";
import { CheckCircle } from "lucide-react-native";
import { useTheme } from "@/core/theme/ThemeProvider";
import { useTranslation } from "react-i18next";

export default function EngageScreen() {
    const { tasks, loadTasks, toggleTask, contexts, loadContexts } = useTasks();
    const { isDark } = useTheme();
    const { t } = useTranslation();

    useEffect(() => {
        loadTasks();
        loadContexts();
    }, []);

    const sections = useMemo(() => {
        // 1. Get active tasks with contexts (excluding someday and waiting)
        const activeTasks = tasks.filter(t => !t.is_completed && t.context_id && t.status === "active");
        
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

    const bgColor = isDark ? "bg-slate-950" : "bg-gray-50";
    const textColor = isDark ? "text-white" : "text-gray-900";
    const secondaryText = isDark ? "text-slate-400" : "text-gray-500";
    const sectionHeaderBg = isDark ? "bg-slate-950/95" : "bg-gray-50/95";
    const sectionHeaderText = isDark ? "text-slate-300" : "text-gray-700";
    const emptyBg = isDark ? "bg-slate-800" : "bg-blue-50";

    return (
        <SafeAreaView className={`flex-1 ${bgColor}`}>
            <View className="flex-1 p-4">
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
                        <View className={`flex-row items-center py-2 ${sectionHeaderBg} backdrop-blur-sm mt-4 mb-2`}>
                             <View 
                                className="w-3 h-3 rounded-full mr-2" 
                                style={{ backgroundColor: color }} 
                            />
                            <Text className={`text-lg font-bold ${sectionHeaderText} uppercase tracking-wider`}>
                                {title}
                            </Text>
                        </View>
                    )}
                    ListEmptyComponent={
                        <View className="items-center justify-center p-10 mt-10">
                            <View className={`${emptyBg} p-6 rounded-full mb-4`}>
                                <CheckCircle size={48} color={isDark ? "#60a5fa" : "#3b82f6"} />
                            </View>
                            <Text className={`text-xl font-bold mb-2 ${textColor}`}>
                                {t("engage.emptyTitle")}
                            </Text>
                            <Text className={`${secondaryText} text-center`}>
                                {t("engage.emptyDescription")}
                            </Text>
                        </View>
                    }
                    contentContainerStyle={{ paddingBottom: 100 }}
                />
            </View>
        </SafeAreaView>
    );
}
