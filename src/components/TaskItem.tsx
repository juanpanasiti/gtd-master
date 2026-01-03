import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/core/theme/ThemeProvider";
import { RefreshCcw } from "lucide-react-native";

interface TaskItemProps {
    task: {
        id: number;
        title: string;
        is_completed: boolean;
        context_id?: number | null;
        is_recurring?: boolean;
    };
    onToggle: (id: number, currentStatus: boolean) => void;
    context?: { id: number; title: string; color: string | null } | undefined;
}

export const TaskItem = ({ task, onToggle, context }: TaskItemProps) => {
    const router = useRouter();
    const { isDark } = useTheme();

    const cardBg = task.is_completed 
        ? (isDark ? "bg-slate-800/50" : "bg-gray-50")
        : (isDark ? "bg-slate-800" : "bg-white");
    
    const borderColor = task.is_completed
        ? (isDark ? "border-slate-700" : "border-gray-100")
        : (isDark ? "border-slate-700" : "border-gray-200");

    const textColor = task.is_completed
        ? (isDark ? "text-slate-500" : "text-gray-400")
        : (isDark ? "text-slate-100" : "text-gray-800");

    return (
        <TouchableOpacity
            onPress={() => router.push(`/task/${task.id}`)}
            className={`p-4 mb-3 rounded-xl border ${cardBg} ${borderColor} ${!task.is_completed ? "shadow-sm" : ""}`}
        >
            <View className="flex-row items-center gap-3">
                <TouchableOpacity onPress={() => onToggle(task.id, task.is_completed)}>
                    <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                        task.is_completed 
                            ? "bg-green-500 border-green-500" 
                            : (isDark ? "border-slate-500" : "border-gray-300")
                    }`}>
                        {task.is_completed && <Text className="text-white text-xs">✓</Text>}
                    </View>
                </TouchableOpacity>
                <View className="flex-1">
                    <View className="flex-row items-center">
                        <Text className={`text-lg ${textColor} ${task.is_completed ? "line-through" : ""} flex-1`}>
                            {task.title}
                        </Text>
                        {task.is_recurring && (
                            <RefreshCcw size={14} color={isDark ? "#94a3b8" : "#64748b"} className="ml-2" />
                        )}
                    </View>
                    {context && (
                        <View className="flex-row mt-1">
                            <View 
                                className="px-2 py-0.5 rounded-full flex-row items-center"
                                style={{ backgroundColor: (context.color || '#ccc') + '20' }}
                            >
                                <View 
                                    className="w-2 h-2 rounded-full mr-1" 
                                    style={{ backgroundColor: context.color || '#ccc' }} 
                                />
                                <Text 
                                    className="text-xs font-medium"
                                    style={{ color: context.color || '#ccc' }}
                                >
                                    {context.title}
                                </Text>
                            </View>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};
