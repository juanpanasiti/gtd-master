import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

interface TaskItemProps {
    task: {
        id: number;
        title: string;
        is_completed: boolean;
        context_id?: number | null;
    };
    onToggle: (id: number, currentStatus: boolean) => void;
    context?: { id: number; title: string; color: string | null } | undefined;
}

export const TaskItem = ({ task, onToggle, context }: TaskItemProps) => {
    const router = useRouter();

    return (
        <TouchableOpacity
            onPress={() => router.push(`/task/${task.id}`)}
            className={`p-4 mb-3 rounded-xl border ${
                task.is_completed 
                ? "bg-gray-50 border-gray-100" 
                : "bg-white border-gray-200 shadow-sm"
            }`}
        >
            <View className="flex-row items-center gap-3">
                <TouchableOpacity onPress={() => onToggle(task.id, task.is_completed)}>
                    <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                        task.is_completed ? "bg-green-500 border-green-500" : "border-gray-300"
                    }`}>
                        {task.is_completed && <Text className="text-white text-xs">✓</Text>}
                    </View>
                </TouchableOpacity>
                <View className="flex-1">
                    <Text className={`text-lg ${
                        task.is_completed ? "text-gray-400 line-through" : "text-gray-800"
                    }`}>
                        {task.title}
                    </Text>
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
