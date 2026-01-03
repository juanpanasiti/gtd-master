import { View, Text, SectionList, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTasks } from "@/store/useTasks";
import { useEffect, useMemo } from "react";
import { TaskItem } from "@/components/TaskItem";
import { ListTodo, Search as SearchIcon, Settings } from "lucide-react-native";
import { useTheme } from "@/core/theme/ThemeProvider";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";

export default function EngageScreen() {
    const { tasks, loadTasks, toggleTask, contexts, loadContexts } = useTasks();
    const { isDark } = useTheme();
    const { t } = useTranslation();
    const router = useRouter();

    useEffect(() => {
        loadTasks();
        loadContexts();
    }, []);

    const engageTasks = useMemo(() => {
        return tasks.filter(t => !t.is_completed && t.status === "active" && t.due_date);
    }, [tasks]);

    const sections = useMemo(() => {
        const contextsMap = contexts.reduce((acc, c) => ({ ...acc, [c.id]: c }), {} as any);
        const groups = engageTasks.reduce((acc, t) => {
            const contextId = t.context_id || "no-context";
            if (!acc[contextId]) acc[contextId] = [];
            acc[contextId].push(t);
            return acc;
        }, {} as Record<string, typeof engageTasks>);

        return Object.entries(groups).map(([contextId, data]) => ({
            title: contextId === "no-context" ? t("common.noContext") : contextsMap[contextId]?.title || "Unknown",
            color: contextsMap[contextId]?.color || "#64748b",
            data
        }));
    }, [engageTasks, contexts, t]);

    const bgColor = isDark ? "bg-slate-950" : "bg-gray-50";
    const textColor = isDark ? "text-white" : "text-gray-900";
    const secondaryText = isDark ? "text-slate-400" : "text-gray-500";
    const sectionHeaderBg = isDark ? "rgba(15, 23, 42, 0.8)" : "rgba(255, 255, 255, 0.8)";

    return (
        <SafeAreaView className={`flex-1 ${bgColor}`}>
            <View className="flex-1 p-4">
                <View className="flex-row items-center justify-between mb-6 px-2">
                    <View className="flex-row items-center">
                        <View className="bg-green-500/10 p-2 rounded-lg">
                            <ListTodo size={24} color="#22c55e" />
                        </View>
                        <Text className={`ml-3 text-2xl font-bold ${textColor}`}>
                            {t("engage.title")}
                        </Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                        <TouchableOpacity 
                            onPress={() => router.push("/search")}
                            className={`${isDark ? "bg-slate-800" : "bg-gray-100"} p-2 rounded-lg`}
                        >
                            <SearchIcon size={24} color={isDark ? "#94a3b8" : "#64748b"} />
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={() => router.push("/settings")}
                            className="p-2"
                        >
                            <Settings size={24} color={isDark ? "#94a3b8" : "#64748b"} />
                        </TouchableOpacity>
                    </View>
                </View>

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
                        <View className={`flex flex-row items-center py-2 backdrop-blur-sm mt-4 mb-2 ${sectionHeaderBg} rounded-lg px-2`}>
                            <View className="w-2 h-4 rounded-full mr-3" style={{ backgroundColor: color }} />
                            <Text className={`text-lg font-bold ${textColor} uppercase tracking-wider`}>
                                {title}
                            </Text>
                        </View>
                    )}
                    ListEmptyComponent={
                        <View className="items-center justify-center p-10 mt-10">
                            <View className={`${isDark ? "bg-slate-800" : "bg-gray-100"} p-6 rounded-full mb-4`}>
                                <ListTodo size={48} color={isDark ? "#60a5fa" : "#3b82f6"} />
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
