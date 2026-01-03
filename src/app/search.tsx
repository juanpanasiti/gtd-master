import { View, Text, TextInput, FlatList, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect, useMemo } from "react";
import { useTasks } from "@/store/useTasks";
import { useProjects } from "@/store/useProjects";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { useTheme } from "@/core/theme/ThemeProvider";
import { Search as SearchIcon, X, ChevronRight, Briefcase, CheckCircle2, FileText, LayoutGrid } from "lucide-react-native";

export default function SearchScreen() {
    const [query, setQuery] = useState("");
    const { tasks, loadTasks } = useTasks();
    const { projects, loadProjects, references, loadAllReferences } = useProjects();
    const { t } = useTranslation();
    const router = useRouter();
    const { isDark } = useTheme();

    useEffect(() => {
        loadTasks();
        loadProjects();
        loadAllReferences();
    }, []);

    const filteredResults = useMemo(() => {
        if (!query.trim() || query.length < 2) return { tasks: [], projects: [], references: [] };

        const q = query.toLowerCase();

        // Flatten references for easier searching
        const allRefs = Object.values(references).flat();

        return {
            tasks: tasks.filter(task => 
                task.title.toLowerCase().includes(q) || 
                (task.description && task.description.toLowerCase().includes(q))
            ),
            projects: projects.filter(project => 
                project.title.toLowerCase().includes(q)
            ),
            references: allRefs.filter(ref => 
                ref.content.toLowerCase().includes(q)
            )
        };
    }, [query, tasks, projects, references]);

    const hasResults = filteredResults.tasks.length > 0 || filteredResults.projects.length > 0 || filteredResults.references.length > 0;

    const bgColor = isDark ? "bg-slate-950" : "bg-gray-50";
    const textColor = isDark ? "text-white" : "text-gray-900";
    const secondaryText = isDark ? "text-slate-400" : "text-gray-500";
    const cardBg = isDark ? "bg-slate-900" : "bg-white";
    const borderColor = isDark ? "border-slate-800" : "border-gray-200";

    const renderHeader = (title: string, icon: any) => (
        <View className="flex-row items-center px-4 py-3 mt-4">
            {icon}
            <Text className={`ml-2 text-sm font-bold uppercase tracking-widest ${secondaryText}`}>
                {title}
            </Text>
        </View>
    );

    return (
        <SafeAreaView className={`flex-1 ${bgColor}`}>
            {/* Header / Search Bar */}
            <View className={`px-4 py-3 border-b ${borderColor} flex-row items-center`}>
                <TouchableOpacity onPress={() => router.back()} className="mr-3">
                    <X size={24} color={isDark ? "#94a3b8" : "#64748b"} />
                </TouchableOpacity>
                <View className={`flex-1 flex-row items-center ${isDark ? "bg-slate-900" : "bg-white"} px-4 py-2 rounded-2xl border ${borderColor}`}>
                    <SearchIcon size={20} color={isDark ? "#475569" : "#94a3b8"} />
                    <TextInput
                        autoFocus
                        value={query}
                        onChangeText={setQuery}
                        placeholder={t("search.placeholder")}
                        placeholderTextColor={isDark ? "#475569" : "#94a3b8"}
                        className={`flex-1 ml-3 text-lg ${textColor}`}
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={() => setQuery("")}>
                            <X size={18} color={isDark ? "#475569" : "#94a3b8"} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Results */}
            <ScrollView className="flex-1">
                {query.length >= 2 && !hasResults && (
                    <View className="items-center justify-center p-20">
                        <Text className={`text-center ${secondaryText}`}>
                            {t("search.noResults", { query })}
                        </Text>
                    </View>
                )}

                {filteredResults.projects.length > 0 && (
                    <>
                        {renderHeader(t("search.categories.projects"), <Briefcase size={16} color={isDark ? "#94a3b8" : "#64748b"} />)}
                        {filteredResults.projects.map(project => (
                            <TouchableOpacity 
                                key={`proj-${project.id}`}
                                onPress={() => router.push(`/project/${project.id}`)}
                                className={`mx-4 mb-2 p-4 rounded-2xl ${cardBg} border ${borderColor} flex-row items-center justify-between`}
                            >
                                <View className="flex-row items-center flex-1">
                                    <View className="bg-blue-500/10 p-2 rounded-lg">
                                        <LayoutGrid size={20} color="#3b82f6" />
                                    </View>
                                    <Text className={`ml-3 text-lg font-semibold ${textColor} flex-1`} numberOfLines={1}>
                                        {project.title}
                                    </Text>
                                </View>
                                <ChevronRight size={20} color={isDark ? "#334155" : "#cbd5e1"} />
                            </TouchableOpacity>
                        ))}
                    </>
                )}

                {filteredResults.tasks.length > 0 && (
                    <>
                        {renderHeader(t("search.categories.tasks"), <CheckCircle2 size={16} color={isDark ? "#94a3b8" : "#64748b"} />)}
                        {filteredResults.tasks.map(task => (
                            <TouchableOpacity 
                                key={`task-${task.id}`}
                                onPress={() => router.push(`/task/${task.id}`)}
                                className={`mx-4 mb-2 p-4 rounded-2xl ${cardBg} border ${borderColor} flex-row items-center justify-between`}
                            >
                                <View className="flex-1">
                                    <View className="flex-row items-center">
                                        <View className={`${task.is_completed ? "bg-green-500/10" : "bg-slate-500/10"} p-2 rounded-lg`}>
                                            <CheckCircle2 size={20} color={task.is_completed ? "#22c55e" : "#64748b"} />
                                        </View>
                                        <Text className={`ml-3 text-lg font-semibold ${textColor} ${task.is_completed ? "line-through opacity-50" : ""} flex-1`} numberOfLines={1}>
                                            {task.title}
                                        </Text>
                                    </View>
                                    {task.description && (
                                        <Text className={`ml-12 mt-1 ${secondaryText} text-sm`} numberOfLines={1}>
                                            {task.description}
                                        </Text>
                                    )}
                                </View>
                                <ChevronRight size={20} color={isDark ? "#334155" : "#cbd5e1"} />
                            </TouchableOpacity>
                        ))}
                    </>
                )}
                
                {filteredResults.references.length > 0 && (
                    <>
                        {renderHeader(t("search.categories.references"), <FileText size={16} color={isDark ? "#94a3b8" : "#64748b"} />)}
                        {filteredResults.references.map(ref => (
                            <TouchableOpacity 
                                key={`ref-${ref.id}`}
                                onPress={() => router.push(`/project/${ref.project_id}`)}
                                className={`mx-4 mb-2 p-4 rounded-2xl ${cardBg} border ${borderColor} flex-row items-center justify-between`}
                            >
                                <View className="flex-1">
                                    <View className="flex-row items-center">
                                        <View className="bg-amber-500/10 p-2 rounded-lg">
                                            <FileText size={20} color="#f59e0b" />
                                        </View>
                                        <Text className={`ml-3 text-lg font-semibold ${textColor} flex-1`} numberOfLines={1}>
                                            {ref.content}
                                        </Text>
                                    </View>
                                    <Text className={`ml-12 mt-1 ${secondaryText} text-sm`}>
                                        {projects.find(p => p.id === ref.project_id)?.title || ""}
                                    </Text>
                                </View>
                                <ChevronRight size={20} color={isDark ? "#334155" : "#cbd5e1"} />
                            </TouchableOpacity>
                        ))}
                    </>
                )}

                <View className="h-10" />
            </ScrollView>
        </SafeAreaView>
    );
}
