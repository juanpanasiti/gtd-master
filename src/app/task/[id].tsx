import { View, Text, TouchableOpacity, ScrollView, TextInput, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTasks } from "@/store/useTasks";
import { useProjects } from "@/store/useProjects";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, Calendar as CalendarIcon, X } from "lucide-react-native";
import { useTheme } from "@/core/theme/ThemeProvider";
import { useTranslation } from "react-i18next";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function TaskDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { tasks, updateTask, contexts, loadContexts } = useTasks();
    const { projects, loadProjects } = useProjects();
    const { isDark } = useTheme();
    const { t } = useTranslation();
    
    const taskId = id ? Number(id) : null;
    const task = tasks.find(t => t.id === taskId);

    const [title, setTitle] = useState("");
    const [projectId, setProjectId] = useState<number | null>(null);
    const [contextId, setContextId] = useState<number | null>(null);
    const [dueDate, setDueDate] = useState<Date | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [status, setStatus] = useState<"active" | "someday" | "waiting">("active");
    const [delegateName, setDelegateName] = useState("");

    useEffect(() => {
        loadProjects();
        loadContexts();
    }, []);

    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setProjectId(task.project_id);
            setContextId(task.context_id);
            setStatus(task.status || "active");
            setDelegateName(task.delegate_name || "");
            
            if (task.due_date) {
                const d = new Date(task.due_date);
                if (!isNaN(d.getTime())) {
                    setDueDate(d);
                }
            } else {
                setDueDate(null);
            }
        }
    }, [task]);

    const bgColor = isDark ? "bg-slate-950" : "bg-gray-50";
    const cardBg = isDark ? "bg-slate-800" : "bg-white";
    const textColor = isDark ? "text-white" : "text-gray-900";
    const secondaryText = isDark ? "text-slate-400" : "text-gray-500";
    const borderColor = isDark ? "border-slate-700" : "border-gray-200";
    const inputBg = isDark ? "bg-slate-800" : "bg-white";
    const chipBg = isDark ? "bg-slate-700" : "bg-gray-50";
    const chipActiveBg = isDark ? "bg-blue-900" : "bg-blue-100";
    const chipActiveText = isDark ? "text-blue-300" : "text-blue-700";
    const chipText = isDark ? "text-slate-300" : "text-gray-600";

    if (!task) {
        return (
            <SafeAreaView className={`flex-1 ${bgColor} items-center justify-center`}>
                <Text className={textColor}>Task not found</Text>
                <Button title="Go Back" onPress={() => router.back()} />
            </SafeAreaView>
        );
    }

    const handleSave = async () => {
        if (taskId) {
            await updateTask(taskId, { 
                title, 
                project_id: proje,
                status,
                delegate_name: status === "waiting" ? delegateName : nullctId,
                context_id: contextId,
                due_date: dueDate
            });
            router.back();
        }
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString(undefined, { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }
        if (selectedDate) {
            setDueDate(selectedDate);
        }
    };

    return (
        <SafeAreaView className={`flex-1 ${bgColor}`}>
            <View className="flex-1 p-4">
                <View className="flex-row items-center mb-6">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <ChevronLeft size={24} color={isDark ? "#fff" : "#000"} />
                    </TouchableOpacity>
                    <Text className={`text-2xl font-bold ${textColor}`}>Edit Task</Text>
                </View>

                <ScrollView className="flex-1">
                    {/* Title */}
                    <View className="mb-6">
                        <Text className={`text-sm font-bold ${secondaryText} mb-2 uppercase`}>Title</Text>
                        <TextInput 
                            value={title} 
                            onChangeText={setTitle} 
                            className={`${inputBg} border-2 ${borderColor} p-3 rounded-lg text-lg ${textColor}`}
                            placeholderTextColor={isDark ? "#64748b" : "#9ca3af"}
                        />
                    </View>

                    {/* Due Date with DatePicker */}
                    <View className="mb-6">
                        <Text className={`text-sm font-bold ${secondaryText} mb-2 uppercase`}>Due Date</Text>
                        <TouchableOpacity 
                            onPress={() => setShowDatePicker(true)}
                            className={`flex-row items-center justify-between ${inputBg} border-2 ${borderColor} p-3 rounded-lg`}
                        >
                            <View className="flex-row items-center">
                                <CalendarIcon size={20} color={isDark ? "#9ca3af" : "#6b7280"} />
                                <Text className={`ml-3 text-lg ${dueDate ? textColor : secondaryText}`}>
                                    {dueDate ? formatDate(dueDate) : "Select Date"}
                                </Text>
                            </View>
                            {dueDate && (
                                <TouchableOpacity onPress={() => setDueDate(null)}>
                                    <X size={20} color={isDark ? "#9ca3af" : "#6b7280"} />
                                </TouchableOpacity>
                            )}
                        </TouchableOpacity>
                        
                        {showDatePicker && (
                            <View className={`mt-2 ${Platform.OS === 'ios' ? `${cardBg} rounded-lg p-2` : ''}`}>
                                <DateTimePicker
                                    value={dueDate || new Date()}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'inline' : 'default'}
                                    onChange={handleDateChange}
                                    themeVariant={isDark ? 'dark' : 'light'}
                                />
                                {Platform.OS === 'ios' && (
                                    <TouchableOpacity 
                                        onPress={() => setShowDatePicker(false)}
                                        className="bg-blue-500 p-3 rounded-lg mt-2"
                                    >
                                        <Text className="text-white text-center font-bold">Done</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                    </View>

                    {/* Project */}
                    <View className="mb-6">
                        <Text className={`text-sm font-bold ${secondaryText} mb-2 uppercase`}>Project</Text>
                        <View className="flex-row flex-wrap gap-2">
                             <TouchableOpacity
                                onPress={() => setProjectId(null)}
                                className={`px-4 py-2 rounded-full border ${
                                    projectId === null 
                                    ? `${chipActiveBg} border-blue-500` 
                                    : `${chipBg} ${borderColor}`
                                }`}
                             >
                                <Text className={projectId === null ? chipActiveText : chipText}>
                                    No Project
                                </Text>
                             </TouchableOpacity>
                            {projects.filter(p => p.status === 'active').map(project => (
                                <TouchableOpacity
                                    key={project.id}
                                    onPress={() => setProjectId(project.id)}
                                    className={`px-4 py-2 rounded-full border ${
                                        projectId === project.id 
                                        ? `${chipActiveBg} border-blue-500` 
                                        : `${chipBg} ${borderColor}`
                                    }`}
                                >
                                    <Text className={projectId === project.id ? chipActiveText : chipText}>
                                        {project.title}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Context */}
                    <View className="mb-6">
                        <Text className={`text-sm font-bold ${secondaryText} mb-2 uppercase`}>Context</Text>
                        <View className="flex-row flex-wrap gap-2">
                             <TouchableOpacity
                                onPress={() => setContextId(null)}
                                className={`px-4 py-2 rounded-full border ${
                                    contextId === null 
                                    ? "bg-purple-900/30 border-purple-500" 
                                    : `${chipBg} ${borderColor}`
                                }`}
                             >
                                <Text className={contextId === null ? "text-purple-400" : chipText}>
                                    None
                                </Text>
                             </TouchableOpacity>
                            {contexts.map(context => (
                                <TouchableOpacity
                                    key={context.id}
                                    onPress={() => setContextId(context.id)}
                                    className={`px-4 py-2 rounded-full border ${
                                        contextId === context.id 
                                        ? "bg-purple-900/30 border-purple-500" 
                                        : `${chipBg} ${borderColor}`
                                    }`}
                                    style={contextId === context.id ? {} : { borderColor: context.color || (isDark ? '#475569' : '#e5e7eb') }}
                                >
                                    <View className="flex-row items-center gap-2">
                                        <View className="w-3 h-3 rounded-full" style={{ backgroundColor: context.color || '#ccc'}} />
                                        <Text className={contextId === context.id ? "text-purple-400" : chipText}>
                                            {context.title}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}

                    {/* Status */}
                    <View className="mb-6">
                        <Text className={`text-sm font-bold ${secondaryText} mb-2 uppercase`}>Status</Text>
                        <View className="flex-row flex-wrap gap-2">
                            <TouchableOpacity
                                onPress={() => setStatus("active")}
                                className={`px-4 py-2 rounded-full border ${
                                    status === "active" 
                                    ? "bg-green-900/30 border-green-500" 
                                    : `${chipBg} ${borderColor}`
                                }`}
                            >
                                <Text className={status === "active" ? "text-green-400" : chipText}>
                                    Accionable
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setStatus("someday")}
                                className={`px-4 py-2 rounded-full border ${
                                    status === "someday" 
                                    ? "bg-amber-900/30 border-amber-500" 
                                    : `${chipBg} ${borderColor}`
                                }`}
                            >
                                <Text className={status === "someday" ? "text-amber-400" : chipText}>
                                    Algún día
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setStatus("waiting")}
                                className={`px-4 py-2 rounded-full border ${
                                    status === "waiting" 
                                    ? "bg-cyan-900/30 border-cyan-500" 
                                    : `${chipBg} ${borderColor}`
                                }`}
                            >
                                <Text className={status === "waiting" ? "text-cyan-400" : chipText}>
                                    En espera
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Waiting For (only visible when status is waiting) */}
                    {status === "waiting" && (
                        <View className="mb-6">
                            <Text className={`text-sm font-bold ${secondaryText} mb-2 uppercase`}>Waiting For</Text>
                            <TextInput 
                                value={delegateName} 
                                onChangeText={setDelegateName} 
                                placeholder="Name of person/entity"
                                className={`${inputBg} border-2 ${borderColor} p-3 rounded-lg text-lg ${textColor}`}
                                placeholderTextColor={isDark ? "#64748b" : "#9ca3af"}
                            />
                        </View>
                    )}
                        </View>
                    </View>
                </ScrollView>

                <Button title={t("common.save")} onPress={handleSave} />
            </View>
        </SafeAreaView>
    );
}
