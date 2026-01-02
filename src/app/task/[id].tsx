import { View, Text, TouchableOpacity, ScrollView, TextInput, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTasks } from "@/store/useTasks";
import { useProjects } from "@/store/useProjects";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, Calendar as CalendarIcon, X, FolderPlus } from "lucide-react-native";
import { useTheme } from "@/core/theme/ThemeProvider";
import { useTranslation } from "react-i18next";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function TaskDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { tasks, updateTask, contexts, loadContexts } = useTasks();
    const { projects, loadProjects, addProject } = useProjects();
    const { isDark } = useTheme();
    const { t } = useTranslation();
    
    const taskId = id ? Number(id) : null;
    const task = tasks.find(t => t.id === taskId);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
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
            setDescription(task.description || "");
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
                description,
                project_id: projectId,
                status,
                delegate_name: status === "waiting" ? delegateName : null,
                context_id: contextId,
                due_date: dueDate
            });
            router.back();
        }
    };

    const handleConvertToProject = () => {
        if (!title.trim()) {
            Alert.alert("Error", "Task must have a title to convert to project");
            return;
        }

        Alert.alert(
            "Convert to Project",
            `Create project "${title}" and move this task into it?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Convert",
                    onPress: async () => {
                        const newProjectId = await addProject(title);
                        if (newProjectId) {
                            setProjectId(newProjectId);
                            setTitle(""); // Clear title for the next action
                            Alert.alert("Success", "Project created! Now define the first Next Action for this project.");
                        }
                    }
                }
            ]
        );
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

                {/* Convert to Project Action */}
                <TouchableOpacity 
                    onPress={handleConvertToProject}
                    className="flex-row items-center mb-6 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800"
                >
                    <FolderPlus size={20} color={isDark ? "#60a5fa" : "#2563eb"} />
                    <View className="ml-3 flex-1">
                        <Text className={`font-semibold ${isDark ? "text-blue-400" : "text-blue-700"}`}>
                            Convert to Project
                        </Text>
                        <Text className={`text-xs ${isDark ? "text-blue-300" : "text-blue-600"}`}>
                            Promotes this task to a project and asks for next action
                        </Text>
                    </View>
                </TouchableOpacity>

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

                    {/* Description (Notes) */}
                    <View className="mb-6">
                        <Text className={`text-sm font-bold ${secondaryText} mb-2 uppercase`}>Notes</Text>
                        <TextInput 
                            value={description} 
                            onChangeText={setDescription} 
                            className={`${inputBg} border-2 ${borderColor} p-3 rounded-lg text-base ${textColor}`}
                            placeholder="Add details, notes, or sub-steps..."
                            placeholderTextColor={isDark ? "#64748b" : "#9ca3af"}
                            multiline
                            textAlignVertical="top"
                            style={{ minHeight: 120 }}
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
                        </View>
                    </View>

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

                </ScrollView>

                <Button title={t("common.save")} onPress={handleSave} />
            </View>
        </SafeAreaView>
    );
}
