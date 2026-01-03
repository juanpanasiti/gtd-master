import { 
    View, Text, TouchableOpacity, TextInput, ScrollView, 
    Alert, LayoutAnimation, Platform, UIManager 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useState, useMemo, useEffect } from "react";
import { useTasks } from "@/store/useTasks";
import { useProjects } from "@/store/useProjects";
import { useTheme } from "@/core/theme/ThemeProvider";
import { useTranslation } from "react-i18next";
import { 
    ArrowLeft, Trash2, Calendar, User, FolderPlus, 
    CheckCircle, Tag, Archive, FastForward, PlayCircle, 
    X, ArrowRightCircle 
} from "lucide-react-native";
import { Button } from "@/components/ui/Button";

type WizardStep = "ACTIONABLE" | "NON_ACTIONABLE" | "MULTI_STEP" | "TWO_MINUTES" | "ORGANIZE" | "DELEGATE";

export default function ProcessInboxScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { isDark } = useTheme();
    const { tasks, updateTask, deleteTask, toggleTask, contexts, loadContexts } = useTasks();
    const { projects, loadProjects, addProject, areas, loadAreas, addReference } = useProjects();

    const inboxTasks = useMemo(() => 
        tasks.filter(t => !t.is_completed && !t.project_id && !t.context_id), 
    [tasks]);

    const [currentIndex, setCurrentIndexState] = useState(0);
    const [step, setStepState] = useState<WizardStep>("ACTIONABLE");

    const setStep = (newStep: WizardStep) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setStepState(newStep);
    };

    const setCurrentIndex = (index: number | ((prev: number) => number)) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
        if (typeof index === 'function') {
            setCurrentIndexState(prev => index(prev));
        } else {
            setCurrentIndexState(index);
        }
    };
    const [delegateName, setDelegateName] = useState("");
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
    const [selectedContextId, setSelectedContextId] = useState<number | null>(null);

    const currentTask = inboxTasks[currentIndex];

    useEffect(() => {
        loadProjects();
        loadAreas();
        loadContexts();
    }, []);

    // Reset wizard for new task
    useEffect(() => {
        setStep("ACTIONABLE");
        setDelegateName("");
        setSelectedProjectId(null);
        setSelectedContextId(null);
    }, [currentIndex]);

    if (!currentTask) {
        return (
            <SafeAreaView className={`flex-1 items-center justify-center ${isDark ? "bg-slate-950" : "bg-gray-50"}`}>
                <CheckCircle size={64} color="#10b981" />
                <Text className={`text-2xl font-bold mt-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                    {t("wizard.inboxEmpty")}
                </Text>
                <TouchableOpacity 
                    onPress={() => router.back()}
                    className="mt-6 bg-blue-500 px-8 py-3 rounded-full"
                >
                    <Text className="text-white font-bold text-lg">{t("common.done")}</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const nextTask = () => {
        if (currentIndex < inboxTasks.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            // All done (or at least all processed)
            router.back();
        }
    };

    const handleActionable = (isActionable: boolean) => {
        if (isActionable) setStep("MULTI_STEP");
        else setStep("NON_ACTIONABLE");
    };

    const handleMultiStep = (isMulti: boolean) => {
        if (isMulti) {
            Alert.alert(
                t("wizard.createProject"),
                `"${currentTask.title}"`,
                [
                    { text: t("common.cancel"), style: "cancel" },
                    { 
                        text: t("wizard.createProject"), 
                        onPress: async () => {
                            await addProject(currentTask.title);
                            await deleteTask(currentTask.id);
                            nextTask();
                        }
                    }
                ]
            );
        } else {
            setStep("TWO_MINUTES");
        }
    };

    const handleTwoMinutes = (isQuick: boolean) => {
        if (isQuick) {
            Alert.alert(
                t("wizard.doItNow"),
                `"${currentTask.title}"`,
                [
                    { text: t("common.cancel"), style: "cancel" },
                    { 
                        text: t("common.complete"), 
                        onPress: async () => {
                            await toggleTask(currentTask.id, false);
                            nextTask();
                        }
                    }
                ]
            );
        } else {
            setStep("ORGANIZE");
        }
    };

    const handleTrash = async () => {
        await deleteTask(currentTask.id);
        nextTask();
    };

    const handleSomeday = async () => {
        await updateTask(currentTask.id, { status: "someday" });
        nextTask();
    };

    const handleReference = async () => {
        // Find or let user pick project? For now, we need at least one reference table.
        // Simplified: Create a "Global" reference or just delete and notify.
        // Better: Reference material implementation in stage 3 used project_id. 
        // We'll ask to create a project first if they want it as reference, or just skip.
        Alert.alert("Reference Material", "Reference material needs to be tied to a project. Convert this to a project first?");
    };

    const handleFinishOrganize = async () => {
        await updateTask(currentTask.id, {
            project_id: selectedProjectId,
            context_id: selectedContextId,
            status: "active"
        });
        nextTask();
    };

    const handleDelegate = async () => {
        if (!delegateName.trim()) return;
        await updateTask(currentTask.id, {
            delegate_name: delegateName,
            status: "waiting",
            context_id: contexts.find(c => c.title.toLowerCase().includes("waiting"))?.id || null
        });
        nextTask();
    };

    const bgColor = isDark ? "bg-slate-950" : "bg-gray-50";
    const textColor = isDark ? "text-white" : "text-gray-900";
    const cardBg = isDark ? "bg-slate-900" : "bg-white";
    const borderColor = isDark ? "border-slate-800" : "border-gray-200";

    return (
        <SafeAreaView className={`flex-1 ${bgColor}`}>
            <View className={`p-4 border-b ${borderColor} flex-row items-center justify-between`}>
                <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
                    <ArrowLeft size={24} color={isDark ? "#fff" : "#000"} />
                </TouchableOpacity>
                <Text className={`text-lg font-bold ${textColor}`}>{t("wizard.title")}</Text>
                <Text className={`text-blue-500 font-bold`}>{currentIndex + 1} / {inboxTasks.length}</Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }}>
                {/* Task Header */}
                <View className={`p-6 rounded-3xl mb-8 ${cardBg} shadow-sm border ${borderColor}`}>
                    <Text className={`text-2xl font-bold ${textColor} text-center`}>
                        {currentTask.title}
                    </Text>
                </View>

                {/* Step Content */}
                {step === "ACTIONABLE" && (
                    <View className="gap-4">
                        <Text className={`text-xl font-medium mb-2 text-center ${textColor}`}>
                            {t("wizard.questionActionable")}
                        </Text>
                        <TouchableOpacity 
                            onPress={() => handleActionable(true)}
                            className="bg-blue-500 p-5 rounded-2xl flex-row items-center justify-center"
                        >
                            <PlayCircle size={24} color="white" />
                            <Text className="text-white font-bold text-xl ml-3">{t("wizard.yes")}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={() => handleActionable(false)}
                            className="bg-red-500/10 border border-red-500/20 p-5 rounded-2xl flex-row items-center justify-center"
                        >
                            <X size={24} color="#ef4444" />
                            <Text className="text-red-500 font-bold text-xl ml-3">{t("wizard.no")}</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {step === "NON_ACTIONABLE" && (
                    <View className="gap-4">
                        <TouchableOpacity 
                            onPress={handleTrash}
                            className={`p-5 rounded-2xl flex-row items-center border ${borderColor} ${cardBg}`}
                        >
                            <Trash2 size={24} color="#ef4444" />
                            <Text className={`font-bold text-lg ml-3 ${textColor}`}>{t("wizard.trash")}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={handleSomeday}
                            className={`p-5 rounded-2xl flex-row items-center border ${borderColor} ${cardBg}`}
                        >
                            <Calendar size={24} color="#3b82f6" />
                            <Text className={`font-bold text-lg ml-3 ${textColor}`}>{t("wizard.someday")}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={handleReference}
                            className={`p-5 rounded-2xl flex-row items-center border ${borderColor} ${cardBg}`}
                        >
                            <Archive size={24} color="#10b981" />
                            <Text className={`font-bold text-lg ml-3 ${textColor}`}>{t("wizard.reference")}</Text>
                        </TouchableOpacity>
                        <Button title={t("wizard.back")} onPress={() => setStep("ACTIONABLE")} className="mt-4 bg-transparent border border-blue-500" textClassName="text-blue-500" />
                    </View>
                )}

                {step === "MULTI_STEP" && (
                    <View className="gap-4">
                        <Text className={`text-xl font-medium mb-2 text-center ${textColor}`}>
                            {t("wizard.questionMultiStep")}
                        </Text>
                        <TouchableOpacity 
                            onPress={() => handleMultiStep(true)}
                            className="bg-blue-500 p-5 rounded-2xl flex-row items-center justify-center"
                        >
                            <FolderPlus size={24} color="white" />
                            <Text className="text-white font-bold text-xl ml-3">{t("wizard.createProject")}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={() => handleMultiStep(false)}
                            className={`p-5 rounded-2xl flex-row items-center justify-center border ${borderColor} ${cardBg}`}
                        >
                            <FastForward size={24} color="#6366f1" />
                            <Text className={`font-bold text-xl ml-3 ${textColor}`}>{t("wizard.oneStep")}</Text>
                        </TouchableOpacity>
                        <Button title={t("wizard.back")} onPress={() => setStep("ACTIONABLE")} className="mt-4 bg-transparent border border-blue-500" textClassName="text-blue-500" />
                    </View>
                )}

                {step === "TWO_MINUTES" && (
                    <View className="gap-4">
                        <Text className={`text-xl font-medium mb-2 text-center ${textColor}`}>
                            {t("wizard.questionTwoMinutes")}
                        </Text>
                        <TouchableOpacity 
                            onPress={() => handleTwoMinutes(true)}
                            className="bg-green-500 p-5 rounded-2xl flex-row items-center justify-center"
                        >
                            <CheckCircle size={24} color="white" />
                            <Text className="text-white font-bold text-xl ml-3">{t("wizard.doItNow")}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={() => handleTwoMinutes(false)}
                            className="bg-blue-500 p-5 rounded-2xl flex-row items-center justify-center"
                        >
                            <ArrowRightCircle size={24} color="white" />
                            <Text className="text-white font-bold text-xl ml-3">{t("wizard.delegateOrDefer")}</Text>
                        </TouchableOpacity>
                        <Button title={t("wizard.back")} onPress={() => setStep("MULTI_STEP")} className="mt-4 bg-transparent border border-blue-500" textClassName="text-blue-500" />
                    </View>
                )}

                {step === "ORGANIZE" && (
                    <View className="gap-6">
                        <View>
                            <Text className={`text-sm font-bold uppercase mb-3 ${isDark ? "text-slate-500" : "text-gray-400"}`}>
                                {t("wizard.selectContext")}
                            </Text>
                            <View className="flex-row flex-wrap gap-2">
                                {contexts.map(c => (
                                    <TouchableOpacity 
                                        key={c.id}
                                        onPress={() => setSelectedContextId(c.id)}
                                        className={`px-4 py-2 rounded-full border ${selectedContextId === c.id ? "bg-blue-500 border-blue-500" : borderColor}`}
                                    >
                                        <Text className={`${selectedContextId === c.id ? "text-white font-bold" : textColor}`}>{c.title}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View>
                            <Text className={`text-sm font-bold uppercase mb-3 ${isDark ? "text-slate-500" : "text-gray-400"}`}>
                                {t("wizard.selectProject")}
                            </Text>
                            <View className="gap-2">
                                <TouchableOpacity 
                                    onPress={() => setSelectedProjectId(null)}
                                    className={`p-3 rounded-lg border ${selectedProjectId === null ? "bg-blue-500/10 border-blue-500" : borderColor}`}
                                >
                                    <Text className={`font-medium ${selectedProjectId === null ? "text-blue-500" : textColor}`}>Single Actions</Text>
                                </TouchableOpacity>
                                {projects.filter(p => p.status === 'active').map(p => (
                                    <TouchableOpacity 
                                        key={p.id}
                                        onPress={() => setSelectedProjectId(p.id)}
                                        className={`p-3 rounded-lg border ${selectedProjectId === p.id ? "bg-blue-500/10 border-blue-500" : borderColor}`}
                                    >
                                        <Text className={`font-medium ${selectedProjectId === p.id ? "text-blue-500" : textColor}`}>{p.title}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View className="flex-row gap-3">
                            <TouchableOpacity 
                                onPress={() => setStep("DELEGATE")}
                                className={`flex-1 p-4 rounded-xl border border-blue-500 items-center justify-center`}
                            >
                                <User size={20} color="#3b82f6" />
                                <Text className="text-blue-500 font-bold mt-1">{t("wizard.delegate")}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                onPress={handleFinishOrganize}
                                disabled={!selectedContextId}
                                className={`flex-2 p-4 rounded-xl bg-blue-500 items-center justify-center ${!selectedContextId ? "opacity-50" : ""}`}
                            >
                                <Text className="text-white font-bold text-lg">{t("wizard.organize")}</Text>
                            </TouchableOpacity>
                        </View>
                        <Button title={t("wizard.back")} onPress={() => setStep("TWO_MINUTES")} className="bg-transparent border border-blue-500" textClassName="text-blue-500" />
                    </View>
                )}

                {step === "DELEGATE" && (
                    <View className="gap-4">
                        <Text className={`text-xl font-medium mb-2 text-center ${textColor}`}>
                            {t("wizard.delegateTo")}
                        </Text>
                        <TextInput 
                            value={delegateName}
                            onChangeText={setDelegateName}
                            placeholder="Person name..."
                            placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                            autoFocus
                            className={`p-4 rounded-xl border ${borderColor} ${textColor} text-lg ${cardBg}`}
                        />
                        <TouchableOpacity 
                            onPress={handleDelegate}
                            disabled={!delegateName.trim()}
                            className={`bg-blue-500 p-5 rounded-2xl items-center justify-center ${!delegateName.trim() ? "opacity-50" : ""}`}
                        >
                            <Text className="text-white font-bold text-xl">{t("wizard.delegate")}</Text>
                        </TouchableOpacity>
                        <Button title={t("wizard.back")} onPress={() => setStep("ORGANIZE")} className="bg-transparent border border-blue-500" textClassName="text-blue-500" />
                    </View>
                )}

            </ScrollView>

            <View className={`p-6 border-t ${borderColor}`}>
                <TouchableOpacity onPress={() => nextTask()} className="items-center">
                    <Text className="text-blue-500 font-bold">{t("wizard.skip")}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
