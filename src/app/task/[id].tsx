import { View, Text, TouchableOpacity, ScrollView, TextInput, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTasks } from "@/store/useTasks";
import { useProjects } from "@/store/useProjects";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, Calendar as CalendarIcon, X, FolderPlus, RefreshCcw, Clock } from "lucide-react-native";
import { Switch } from "react-native";
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
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [status, setStatus] = useState<"active" | "someday" | "waiting">("active");
    const [delegateName, setDelegateName] = useState("");
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurrenceType, setRecurrenceType] = useState<"daily" | "weekly" | "monthly">("daily");
    const [recurrenceInterval, setRecurrenceInterval] = useState(1);
    const [recurrenceDays, setRecurrenceDays] = useState<string>("");
    const [recurrenceTime, setRecurrenceTime] = useState<Date | null>(null);
    const [recurrenceDayOfMonth, setRecurrenceDayOfMonth] = useState<number>(1);
    const [showTimePicker, setShowTimePicker] = useState(false);

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
            setIsRecurring(task.is_recurring || false);
            setRecurrenceType(task.recurrence_type || "daily");
            setRecurrenceInterval(task.recurrence_interval || 1);
            setRecurrenceDays(task.recurrence_days || "");
            setRecurrenceDayOfMonth(task.recurrence_day_of_month || 1);
            
            if (task.recurrence_time) {
                const [hours, minutes] = task.recurrence_time.split(':').map(Number);
                const timeDate = new Date();
                timeDate.setHours(hours, minutes, 0, 0);
                setRecurrenceTime(timeDate);
            } else {
                setRecurrenceTime(null);
            }
            
            if (task.due_date) {
                const d = new Date(task.due_date);
                if (!isNaN(d.getTime())) {
                    setDueDate(d);
                }
            } else {
                setDueDate(null);
            }

            if (task.start_date) {
                const d = new Date(task.start_date);
                if (!isNaN(d.getTime())) {
                    setStartDate(d);
                }
            } else {
                setStartDate(null);
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
                due_date: dueDate,
                start_date: startDate,
                is_recurring: isRecurring,
                recurrence_type: isRecurring ? recurrenceType : null,
                recurrence_interval: isRecurring ? recurrenceInterval : 1,
                recurrence_days: isRecurring && recurrenceType === "weekly" ? recurrenceDays : null,
                recurrence_time: isRecurring && recurrenceTime ? `${recurrenceTime.getHours().toString().padStart(2, '0')}:${recurrenceTime.getMinutes().toString().padStart(2, '0')}` : null,
                recurrence_day_of_month: isRecurring && recurrenceType === "monthly" ? recurrenceDayOfMonth : null
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

    const handleStartDateChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowStartDatePicker(false);
        }
        if (selectedDate) {
            setStartDate(selectedDate);
        }
    };

    const handleTimeChange = (event: any, selectedTime?: Date) => {
        if (Platform.OS === 'android') {
            setShowTimePicker(false);
        }
        if (selectedTime) {
            setRecurrenceTime(selectedTime);
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

                    {/* Dates Section */}
                    <View className="mb-6">
                        <Text className={`text-sm font-bold ${secondaryText} mb-2 uppercase`}>Dates</Text>
                        
                        {/* Start Date */}
                        <View className="mb-3">
                            <Text className={`text-xs ${secondaryText} mb-1`}>Start Date (Hide untill)</Text>
                            <TouchableOpacity 
                                onPress={() => setShowStartDatePicker(true)}
                                className={`flex-row items-center justify-between ${inputBg} border-2 ${borderColor} p-3 rounded-lg`}
                            >
                                <View className="flex-row items-center">
                                    <CalendarIcon size={20} color={isDark ? "#9ca3af" : "#6b7280"} />
                                    <Text className={`ml-3 text-lg ${startDate ? textColor : secondaryText}`}>
                                        {startDate ? formatDate(startDate) : "None (Active Now)"}
                                    </Text>
                                </View>
                                {startDate && (
                                    <TouchableOpacity onPress={() => setStartDate(null)}>
                                        <X size={20} color={isDark ? "#9ca3af" : "#6b7280"} />
                                    </TouchableOpacity>
                                )}
                            </TouchableOpacity>
                           
                           {showStartDatePicker && (
                                <View className={`mt-2 ${Platform.OS === 'ios' ? `${cardBg} rounded-lg p-2` : ''}`}>
                                    <DateTimePicker
                                        value={startDate || new Date()}
                                        mode="date"
                                        display={Platform.OS === 'ios' ? 'inline' : 'default'}
                                        onChange={handleStartDateChange}
                                        themeVariant={isDark ? 'dark' : 'light'}
                                    />
                                    {Platform.OS === 'ios' && (
                                        <TouchableOpacity 
                                            onPress={() => setShowStartDatePicker(false)}
                                            className="bg-blue-500 p-3 rounded-lg mt-2"
                                        >
                                            <Text className="text-white text-center font-bold">Done</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )}
                        </View>

                        {/* Due Date */}
                        <View>
                            <Text className={`text-xs ${secondaryText} mb-1`}>Due Date (Deadline)</Text>
                             <TouchableOpacity 
                                onPress={() => setShowDatePicker(true)}
                                className={`flex-row items-center justify-between ${inputBg} border-2 ${borderColor} p-3 rounded-lg`}
                            >
                                <View className="flex-row items-center">
                                    <CalendarIcon size={20} color={isDark ? "#f87171" : "#ef4444"} />
                                    <Text className={`ml-3 text-lg ${dueDate ? textColor : secondaryText}`}>
                                        {dueDate ? formatDate(dueDate) : "None"}
                                    </Text>
                                </View>
                                {dueDate && (
                                    <TouchableOpacity onPress={() => setDueDate(null)}>
                                        <X size={20} color={isDark ? "#9ca3af" : "#6b7280"} />
                                    </TouchableOpacity>
                                )}
                            </TouchableOpacity>
                        </View>
                        
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

                    {/* Recurrence */}
                    <View className="mb-6">
                        <View className="flex-row items-center justify-between mb-2">
                            <Text className={`text-sm font-bold ${secondaryText} uppercase`}>{t("task.recurrence")}</Text>
                            <Switch 
                                value={isRecurring} 
                                onValueChange={setIsRecurring}
                                trackColor={{ false: "#767577", true: "#3b82f6" }}
                            />
                        </View>

                        {isRecurring && (
                            <View className={`${cardBg} p-4 rounded-xl border ${borderColor} gap-4`}>
                                <View className="flex-row items-center gap-3">
                                    <RefreshCcw size={20} color={isDark ? "#60a5fa" : "#2563eb"} />
                                    <View className="flex-1 flex-row gap-2">
                                        {(["daily", "weekly", "monthly"] as const).map(type => (
                                            <TouchableOpacity 
                                                key={type}
                                                onPress={() => setRecurrenceType(type)}
                                                className={`px-3 py-1 rounded-full border ${
                                                    recurrenceType === type 
                                                    ? "bg-blue-500 border-blue-500" 
                                                    : `${chipBg} ${borderColor}`
                                                }`}
                                            >
                                                <Text className={`text-xs ${recurrenceType === type ? "text-white" : chipText}`}>
                                                    {t(`task.recurrence_${type}`)}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                <View className="flex-row items-center justify-between">
                                    <Text className={textColor}>{t("task.every")}</Text>
                                    <View className="flex-row items-center gap-2">
                                        <TouchableOpacity 
                                            onPress={() => setRecurrenceInterval(Math.max(1, recurrenceInterval - 1))}
                                            className={`${chipBg} w-8 h-8 items-center justify-center rounded-lg border ${borderColor}`}
                                        >
                                            <Text className={textColor}>-</Text>
                                        </TouchableOpacity>
                                        <Text className={`text-lg font-bold ${textColor} w-8 text-center`}>{recurrenceInterval}</Text>
                                        <TouchableOpacity 
                                            onPress={() => setRecurrenceInterval(recurrenceInterval + 1)}
                                            className={`${chipBg} w-8 h-8 items-center justify-center rounded-lg border ${borderColor}`}
                                        >
                                            <Text className={textColor}>+</Text>
                                        </TouchableOpacity>
                                        <Text className={secondaryText}>
                                            {recurrenceType === "daily" ? t("common.days_unit") : recurrenceType === "weekly" ? t("common.weeks_unit") : t("common.months_unit")}
                                        </Text>
                                    </View>
                                </View>

                                {recurrenceType === "weekly" && (
                                    <View>
                                        <Text className={`text-xs ${secondaryText} mb-2`}>{t("task.onDays")}</Text>
                                        <View className="flex-row justify-between">
                                            {[0, 1, 2, 3, 4, 5, 6].map(day => {
                                                const dayNames = ["S", "M", "T", "W", "T", "F", "S"];
                                                const days = recurrenceDays.split(",").filter(d => d !== "");
                                                const isSelected = days.includes(day.toString());
                                                return (
                                                    <TouchableOpacity 
                                                        key={day}
                                                        onPress={() => {
                                                            let newDays = isSelected 
                                                                ? days.filter(d => d !== day.toString())
                                                                : [...days, day.toString()];
                                                            setRecurrenceDays(newDays.join(","));
                                                        }}
                                                        className={`w-8 h-8 rounded-full items-center justify-center ${
                                                            isSelected ? "bg-blue-500" : chipBg
                                                        }`}
                                                    >
                                                        <Text className={`text-xs font-bold ${isSelected ? "text-white" : textColor}`}>
                                                            {dayNames[day]}
                                                        </Text>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    </View>
                                )}

                                {recurrenceType === "monthly" && (
                                    <View>
                                        <Text className={`text-xs ${secondaryText} mb-2`}>{t("task.onDayOfMonth")}</Text>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                                            {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                                <TouchableOpacity 
                                                    key={day}
                                                    onPress={() => setRecurrenceDayOfMonth(day)}
                                                    className={`w-10 h-10 rounded-lg items-center justify-center mr-2 border ${
                                                        recurrenceDayOfMonth === day 
                                                        ? "bg-blue-500 border-blue-500" 
                                                        : `${chipBg} ${borderColor}`
                                                    }`}
                                                >
                                                    <Text className={`font-bold ${recurrenceDayOfMonth === day ? "text-white" : textColor}`}>
                                                        {day}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>
                                )}

                                <View className="border-t border-slate-700/50 pt-4">
                                    <Text className={`text-xs ${secondaryText} mb-2 uppercase font-bold`}>{t("task.resetTime")}</Text>
                                    <TouchableOpacity 
                                        onPress={() => setShowTimePicker(true)}
                                        className={`flex-row items-center justify-between ${inputBg} border-2 ${borderColor} p-3 rounded-lg`}
                                    >
                                        <View className="flex-row items-center">
                                            <Clock size={20} color={isDark ? "#9ca3af" : "#6b7280"} />
                                            <Text className={`ml-3 text-lg ${recurrenceTime ? textColor : secondaryText}`}>
                                                {recurrenceTime 
                                                    ? recurrenceTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                                                    : "00:00 (Always)"}
                                            </Text>
                                        </View>
                                        {recurrenceTime && (
                                            <TouchableOpacity onPress={() => setRecurrenceTime(null)}>
                                                <X size={20} color={isDark ? "#9ca3af" : "#6b7280"} />
                                            </TouchableOpacity>
                                        )}
                                    </TouchableOpacity>

                                    {showTimePicker && (
                                        <View className={`mt-2 ${Platform.OS === 'ios' ? `${cardBg} rounded-lg p-2` : ''}`}>
                                            <DateTimePicker
                                                value={recurrenceTime || new Date(new Date().setHours(0,0,0,0))}
                                                mode="time"
                                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                                onChange={handleTimeChange}
                                                themeVariant={isDark ? 'dark' : 'light'}
                                            />
                                            {Platform.OS === 'ios' && (
                                                <TouchableOpacity 
                                                    onPress={() => setShowTimePicker(false)}
                                                    className="bg-blue-500 p-3 rounded-lg mt-2"
                                                >
                                                    <Text className="text-white text-center font-bold">Done</Text>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    )}
                                </View>
                            </View>
                        )}
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
