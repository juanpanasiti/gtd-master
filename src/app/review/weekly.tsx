import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useState, useEffect, useMemo } from "react";
import { useTasks } from "@/store/useTasks";
import { useProjects } from "@/store/useProjects";
import { useTheme } from "@/core/theme/ThemeProvider";
import { useTranslation } from "react-i18next";
import { 
    ArrowLeft, CheckCircle, Calendar, Clock, 
    Moon, Plus, Sparkles, Folder
} from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { TaskItem } from "@/components/TaskItem";

type ReviewStep = "BRAIN_DUMP" | "CALENDAR" | "WAITING" | "PROJECTS" | "SOMEDAY" | "FINISH";

export default function WeeklyReviewScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { isDark } = useTheme();
    const { tasks, loadTasks, addTask, toggleTask, contexts, loadContexts } = useTasks();
    const { projects, loadProjects } = useProjects();

    const [step, setStep] = useState<ReviewStep>("BRAIN_DUMP");
    const [brainDumpText, setBrainDumpText] = useState("");

    useEffect(() => {
        loadTasks();
        loadProjects();
        loadContexts();
    }, []);

    // Filtered data for steps
    const completedLastWeek = useMemo(() => {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return tasks.filter(task => task.is_completed && task.created_at >= oneWeekAgo);
    }, [tasks]);

    const upcomingWeek = useMemo(() => {
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        return tasks.filter(task => !task.is_completed && task.due_date && task.due_date <= nextWeek);
    }, [tasks]);

    const waitingTasks = useMemo(() => 
        tasks.filter(task => !task.is_completed && task.status === "waiting"), 
    [tasks]);

    const somedayTasks = useMemo(() => 
        tasks.filter(task => !task.is_completed && task.status === "someday"), 
    [tasks]);

    // Projects check: projects without any active (non-completed) tasks
    const projectsHealth = useMemo(() => {
        return projects.map(p => {
            const hasActiveTask = tasks.some(task => task.project_id === p.id && !task.is_completed && task.status === 'active');
            return { ...p, hasActiveTask };
        });
    }, [projects, tasks]);

    const handleAddBrainDump = async () => {
        if (!brainDumpText.trim()) return;
        await addTask(brainDumpText);
        setBrainDumpText("");
    };

    const bgColor = isDark ? "bg-slate-950" : "bg-gray-50";
    const textColor = isDark ? "text-white" : "text-gray-900";
    const secondaryText = isDark ? "text-slate-400" : "text-gray-500";
    const cardBg = isDark ? "bg-slate-900" : "bg-white";
    const borderColor = isDark ? "border-slate-800" : "border-gray-200";

    const renderHeader = (titleKey: string, descKey: string) => (
        <View className="mb-6">
            <Text className={`text-3xl font-extrabold ${textColor} mb-2`}>{t(`weeklyReview.${titleKey}`)}</Text>
            <Text className={`${secondaryText} text-lg leading-6`}>{t(`weeklyReview.${descKey}`)}</Text>
        </View>
    );

    return (
        <SafeAreaView className={`flex-1 ${bgColor}`}>
            <View className={`p-4 border-b ${borderColor} flex-row items-center justify-between`}>
                <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
                    <ArrowLeft size={24} color={isDark ? "#fff" : "#000"} />
                </TouchableOpacity>
                <Text className={`text-lg font-bold ${textColor}`}>{t("weeklyReview.title")}</Text>
                <View className="w-10" />
            </View>

            <ScrollView className="flex-1 px-5 pt-6">
                {step === "BRAIN_DUMP" && (
                    <View>
                        {renderHeader("stepBrainDump", "stepBrainDumpDesc")}
                        <View className={`flex-row items-center bg-white ${isDark ? "bg-slate-900" : "bg-white"} border ${borderColor} rounded-2xl p-2 mb-4`}>
                            <TextInput 
                                value={brainDumpText}
                                onChangeText={setBrainDumpText}
                                placeholder="Capture everything..."
                                placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                                className={`flex-1 p-3 ${textColor} text-lg`}
                                multiline
                            />
                            <TouchableOpacity 
                                onPress={handleAddBrainDump}
                                disabled={!brainDumpText.trim()}
                                className={`p-4 rounded-xl bg-purple-600 ${!brainDumpText.trim() ? "opacity-50" : ""}`}
                            >
                                <Plus size={24} color="white" />
                            </TouchableOpacity>
                        </View>
                        <Button title={t("common.continue")} onPress={() => setStep("CALENDAR")} className="bg-purple-600 mt-4" />
                    </View>
                )}

                {step === "CALENDAR" && (
                    <View>
                        {renderHeader("stepCalendar", "stepCalendarDesc")}
                        
                        <View className="mb-8">
                            <Text className={`text-sm font-bold uppercase mb-4 ${isDark ? "text-slate-500" : "text-gray-400"}`}>Last 7 Days (Completed)</Text>
                            {completedLastWeek.length === 0 ? (
                                <Text className={`${secondaryText} italic`}>No items completed this week.</Text>
                            ) : (
                                completedLastWeek.map(item => (
                                    <View key={item.id} className="flex-row items-center mb-3">
                                        <CheckCircle size={16} color="#10b981" />
                                        <Text className={`ml-3 text-lg ${secondaryText} line-through`}>{item.title}</Text>
                                    </View>
                                ))
                            )}
                        </View>

                        <View className="mb-8">
                            <Text className={`text-sm font-bold uppercase mb-4 ${isDark ? "text-slate-500" : "text-gray-400"}`}>Upcoming 7 Days</Text>
                            {upcomingWeek.length === 0 ? (
                                <Text className={`${secondaryText} italic`}>No commitments scheduled for next week.</Text>
                            ) : (
                                upcomingWeek.map(item => (
                                    <TaskItem key={item.id} task={item} onToggle={toggleTask} context={contexts.find(c => c.id === item.context_id)} />
                                ))
                            )}
                        </View>
                        
                        <Button title={t("common.continue")} onPress={() => setStep("WAITING")} className="bg-purple-600 mb-10" />
                    </View>
                )}

                {step === "WAITING" && (
                    <View>
                        {renderHeader("stepWaiting", "stepWaitingDesc")}
                        <View className="mt-4 mb-8">
                            {waitingTasks.length === 0 ? (
                                <View className={`items-center justify-center p-10 rounded-3xl border border-dashed ${borderColor}`}>
                                    <Clock size={48} color={isDark ? "#334155" : "#e2e8f0"} />
                                    <Text className={`${secondaryText} mt-4 text-center`}>{t("review.waitingEmpty")}</Text>
                                </View>
                            ) : (
                                waitingTasks.map(item => (
                                    <View key={item.id} className="mb-4">
                                        <TaskItem task={item} onToggle={toggleTask} context={contexts.find(c => c.id === item.context_id)} />
                                        <Text className={`ml-12 mt-1 text-sm ${isDark ? "text-cyan-400" : "text-cyan-600"}`}>
                                            ⏳ {t("review.waitingFor", { name: item.delegate_name || "?" })}
                                        </Text>
                                    </View>
                                ))
                            )}
                        </View>
                        <Button title={t("common.continue")} onPress={() => setStep("PROJECTS")} className="bg-purple-600 mb-10" />
                    </View>
                )}

                {step === "PROJECTS" && (
                    <View>
                        {renderHeader("stepProjects", "stepProjectsDesc")}
                        <View className="mt-4 mb-8">
                            {projectsHealth.map(p => (
                                <TouchableOpacity 
                                    key={p.id}
                                    onPress={() => router.push(`/project/${p.id}`)}
                                    className={`p-5 rounded-2xl mb-3 border ${p.hasActiveTask ? borderColor : "border-red-500/50"} ${cardBg} shadow-sm`}
                                >
                                    <View className="flex-row items-center justify-between">
                                        <View className="flex-row items-center flex-1">
                                            <Folder size={20} color={isDark ? "#94a3b8" : "#64748b"} />
                                            <Text className={`ml-3 text-lg font-bold ${textColor}`}>{p.title}</Text>
                                        </View>
                                        {!p.hasActiveTask && (
                                            <View className="bg-red-500/10 px-3 py-1 rounded-full">
                                                <Text className="text-red-500 font-bold text-xs uppercase tracking-tighter">{t("weeklyReview.noNextAction")}</Text>
                                            </View>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <Button title={t("common.continue")} onPress={() => setStep("SOMEDAY")} className="bg-purple-600 mb-10" />
                    </View>
                )}

                {step === "SOMEDAY" && (
                    <View>
                        {renderHeader("stepSomeday", "stepSomedayDesc")}
                        <View className="mt-4 mb-8">
                            {somedayTasks.length === 0 ? (
                                <View className={`items-center justify-center p-10 rounded-3xl border border-dashed ${borderColor}`}>
                                    <Moon size={48} color={isDark ? "#334155" : "#e2e8f0"} />
                                    <Text className={`${secondaryText} mt-4 text-center`}>{t("review.somedayEmpty")}</Text>
                                </View>
                            ) : (
                                somedayTasks.map(item => (
                                    <TaskItem key={item.id} task={item} onToggle={toggleTask} context={contexts.find(c => c.id === item.context_id)} />
                                ))
                            )}
                        </View>
                        <Button title={t("weeklyReview.finish")} onPress={() => setStep("FINISH")} className="bg-purple-600 mb-10" />
                    </View>
                )}

                {step === "FINISH" && (
                    <View className="items-center justify-center py-10">
                        <View className="bg-green-500/10 p-8 rounded-full mb-6">
                            <Sparkles size={80} color="#10b981" />
                        </View>
                        <Text className={`text-4xl font-black ${textColor} text-center mb-4`}>
                            {t("weeklyReview.congrats")}
                        </Text>
                        <Text className={`${secondaryText} text-xl text-center leading-7 px-4`}>
                            {t("weeklyReview.congratsDesc")}
                        </Text>
                        
                        <TouchableOpacity 
                            onPress={() => router.replace("/(tabs)/review")}
                            className="bg-purple-600 px-10 py-5 rounded-3xl mt-12 shadow-xl shadow-purple-500/30"
                        >
                            <Text className="text-white font-black text-xl uppercase tracking-widest">{t("common.done")}</Text>
                        </TouchableOpacity>
                    </View>
                )}
                
                <View className="h-20" />
            </ScrollView>
        </SafeAreaView>
    );
}
