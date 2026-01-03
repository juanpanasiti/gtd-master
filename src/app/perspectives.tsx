import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTasks } from "@/store/useTasks";
import { useProjects } from "@/store/useProjects";
import { useTheme } from "@/core/theme/ThemeProvider";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { 
    Activity, ArrowLeft, BarChart3, Briefcase, 
    CheckCircle2, Inbox, LayoutGrid, AlertCircle,
    ChevronRight, Sparkles, Download, Upload, Database
} from "lucide-react-native";
import { useMemo, useEffect, useState } from "react";
import { DataService } from "@/core/data/DataService";
import { Alert, ActivityIndicator } from "react-native";

export default function PerspectivesScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { isDark } = useTheme();
    const { tasks, loadTasks } = useTasks();
    const { projects, loadProjects, areas, loadAreas } = useProjects();

    useEffect(() => {
        loadTasks();
        loadProjects();
        loadAreas();
    }, []);

    const metrics = useMemo(() => {
        const activeProjects = projects.filter(p => p.status === "active");
        
        const stalledProjects = activeProjects.filter(p => {
            const hasNextAction = tasks.some(t => t.project_id === p.id && !t.is_completed && t.status === "active");
            return !hasNextAction;
        });

        const inboxCount = tasks.filter(t => !t.is_completed && !t.project_id && !t.context_id).length;

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const completedThisWeek = tasks.filter(t => t.is_completed && t.created_at >= oneWeekAgo).length;

        const areaDistribution = areas.map(area => {
            const count = activeProjects.filter(p => p.area_id === area.id).length;
            return { ...area, count };
        }).filter(a => a.count > 0);

        const noAreaCount = activeProjects.filter(p => !p.area_id).length;

        return {
            totalActive: activeProjects.length,
            stalled: stalledProjects,
            inboxCount,
            completedThisWeek,
            areaDistribution,
            noAreaCount
        };
    }, [tasks, projects, areas]);

    const bgColor = isDark ? "bg-slate-950" : "bg-gray-50";
    const textColor = isDark ? "text-white" : "text-gray-900";
    const secondaryText = isDark ? "text-slate-400" : "text-gray-500";
    const cardBg = isDark ? "bg-slate-900" : "bg-white";
    const borderColor = isDark ? "border-slate-800" : "border-gray-200";

    const [isLoading, setIsLoading] = useState(false);

    const handleExport = async () => {
        setIsLoading(true);
        const success = await DataService.exportData();
        setIsLoading(false);
        if (success) {
            Alert.alert(t("perspectives.title"), t("perspectives.exportSuccess"));
        }
    };

    const handleImport = async () => {
        Alert.alert(
            t("perspectives.dataTitle"),
            t("perspectives.importConfirm"),
            [
                { text: t("common.cancel"), style: "cancel" },
                { 
                    text: t("perspectives.importBackup"), 
                    onPress: async () => {
                        setIsLoading(true);
                        const success = await DataService.importData();
                        setIsLoading(false);
                        if (success) {
                            Alert.alert(t("perspectives.title"), t("perspectives.importSuccess"));
                            loadTasks();
                            loadProjects();
                            loadAreas();
                        } else {
                            Alert.alert(t("perspectives.title"), t("perspectives.importError"));
                        }
                    }
                }
            ]
        );
    };

    const SummaryCard = ({ title, value, icon, color, description }: any) => (
        <View className={`${cardBg} p-5 rounded-3xl border ${borderColor} mb-4 flex-1`}>
            <View className={`w-12 h-12 rounded-2xl bg-${color}-500/10 items-center justify-center mb-3`}>
                {icon}
            </View>
            <View>
                <Text className={`${secondaryText} text-[10px] font-bold uppercase tracking-widest`} numberOfLines={1}>{title}</Text>
                <Text className={`${textColor} text-2xl font-black mt-0.5`}>{value}</Text>
                {description && <Text className={`${secondaryText} text-[10px] mt-1`} numberOfLines={1}>{description}</Text>}
            </View>
        </View>
    );

    return (
        <SafeAreaView className={`flex-1 ${bgColor}`}>
            {/* Header */}
            <View className={`px-4 py-3 border-b ${borderColor} flex-row items-center justify-between`}>
                <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
                    <ArrowLeft size={24} color={isDark ? "#fff" : "#000"} />
                </TouchableOpacity>
                <Text className={`text-lg font-bold ${textColor}`}>{t("perspectives.title")}</Text>
                {isLoading ? <ActivityIndicator size="small" color="#6366f1" /> : <View className="w-10" />}
            </View>

            <ScrollView className="flex-1 px-5 pt-6">
                {/* Momentum Section */}
                <View className="bg-purple-600 p-6 rounded-[32px] mb-6 shadow-xl shadow-purple-500/30 overflow-hidden relative">
                    <View className="z-10">
                        <View className="flex-row justify-between items-center mb-1">
                            <Text className="text-white/70 font-bold uppercase tracking-widest text-[10px]">{t("perspectives.momentum")}</Text>
                            <Sparkles size={16} color="rgba(255,255,255,0.8)" />
                        </View>
                        <View className="flex-row items-baseline">
                            <Text className="text-5xl font-black text-white">{metrics.completedThisWeek}</Text>
                            <Text className="text-white/90 ml-2 font-bold text-lg">{t("perspectives.completedTasks")}</Text>
                        </View>
                    </View>
                    <View className="absolute -right-4 -bottom-4 opacity-20">
                        <Activity size={100} color="white" strokeWidth={3} />
                    </View>
                </View>

                {/* Health Metrics Grid */}
                <View className="flex-row gap-4 mb-2">
                    <SummaryCard 
                        title={t("perspectives.activeProjects")} 
                        value={metrics.totalActive}
                        icon={<Briefcase size={20} color="#3b82f6" />}
                        color="blue"
                    />
                    <SummaryCard 
                        title={t("perspectives.inbox")} 
                        value={metrics.inboxCount}
                        icon={<Inbox size={20} color="#f59e0b" />}
                        color="amber"
                    />
                </View>

                {/* Stalled Projects Section */}
                <View className="mb-6">
                    <View className="flex-row items-center mb-4 px-2">
                        <AlertCircle size={18} color="#ef4444" />
                        <Text className={`ml-2 text-lg font-bold ${textColor}`}>{t("perspectives.stalledProjects")}</Text>
                    </View>
                    
                    {metrics.stalled.length === 0 ? (
                        <View className={`${cardBg} p-6 rounded-3xl border border-dashed ${borderColor} items-center`}>
                           <CheckCircle2 size={32} color="#10b981" />
                           <Text className={`${secondaryText} mt-2 text-center`}>{t("perspectives.noStalled")}</Text>
                        </View>
                    ) : (
                        metrics.stalled.map(project => (
                            <TouchableOpacity 
                                key={project.id}
                                onPress={() => router.push(`/project/${project.id}`)}
                                className={`${cardBg} p-4 rounded-2xl border ${borderColor} mb-2 flex-row items-center justify-between`}
                            >
                                <View className="flex-row items-center flex-1">
                                    <View className="w-2 h-8 rounded-full bg-red-500 mr-3" />
                                    <View className="flex-1">
                                        <Text className={`${textColor} font-bold text-lg`} numberOfLines={1}>{project.title}</Text>
                                        <Text className={`${secondaryText} text-xs`}>{t("perspectives.stalledDesc")}</Text>
                                    </View>
                                </View>
                                <ChevronRight size={18} color={isDark ? "#334155" : "#cbd5e1"} />
                            </TouchableOpacity>
                        ))
                    )}
                </View>

                {/* Area Distribution */}
                <View className="mb-6">
                    <View className="flex-row items-center mb-4 px-2">
                        <LayoutGrid size={18} color="#6366f1" />
                        <Text className={`ml-2 text-lg font-bold ${textColor}`}>{t("perspectives.byArea")}</Text>
                    </View>

                    <View className="flex-row flex-wrap gap-2">
                        {metrics.areaDistribution.map(area => (
                            <View 
                                key={area.id}
                                className={`${cardBg} p-4 rounded-2xl border ${borderColor} flex-row items-center`}
                                style={{ width: '48%' }}
                            >
                                <View className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: area.color }} />
                                <View className="flex-1">
                                    <Text className={`${textColor} font-bold text-lg`}>{area.count}</Text>
                                    <Text className={`${secondaryText} text-xs`} numberOfLines={1}>{area.title}</Text>
                                </View>
                            </View>
                        ))}
                        {metrics.noAreaCount > 0 && (
                            <View 
                                className={`${cardBg} p-4 rounded-2xl border ${borderColor} flex-row items-center`}
                                style={{ width: '48%' }}
                            >
                                <View className="w-3 h-3 rounded-full mr-2 bg-gray-400" />
                                <View className="flex-1">
                                    <Text className={`${textColor} font-bold text-lg`}>{metrics.noAreaCount}</Text>
                                    <Text className={`${secondaryText} text-xs`} numberOfLines={1}>Other</Text>
                                </View>
                            </View>
                        )}
                    </View>
                </View>

                {/* Data Management Section */}
                <View className="mb-10">
                    <View className="flex-row items-center mb-4 px-2">
                        <Database size={18} color="#64748b" />
                        <Text className={`ml-2 text-lg font-bold ${textColor}`}>{t("perspectives.dataTitle")}</Text>
                    </View>

                    <View className="flex-row gap-3">
                        <TouchableOpacity 
                            onPress={handleExport}
                            disabled={isLoading}
                            className={`flex-1 flex-row items-center justify-center p-4 rounded-2xl border ${borderColor} ${cardBg}`}
                        >
                            <Download size={18} color="#3b82f6" />
                            <Text className={`ml-2 font-bold ${textColor}`}>{t("perspectives.exportBackup")}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            onPress={handleImport}
                            disabled={isLoading}
                            className={`flex-1 flex-row items-center justify-center p-4 rounded-2xl border ${borderColor} ${cardBg}`}
                        >
                            <Upload size={18} color="#10b981" />
                            <Text className={`ml-2 font-bold ${textColor}`}>{t("perspectives.importBackup")}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View className="h-10" />
            </ScrollView>
        </SafeAreaView>
    );
}
