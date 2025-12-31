import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, TextInput } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTasks } from "@/store/useTasks";
import { useProjects } from "@/store/useProjects";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, Calendar as CalendarIcon } from "lucide-react-native";

export default function TaskDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { tasks, updateTask, contexts, loadContexts } = useTasks();
    const { projects, loadProjects } = useProjects();
    
    // Convert id to number
    const taskId = id ? Number(id) : null;
    const task = tasks.find(t => t.id === taskId);

    const [title, setTitle] = useState("");
    const [projectId, setProjectId] = useState<number | null>(null);
    const [contextId, setContextId] = useState<number | null>(null);
    const [dueDate, setDueDate] = useState(""); // Simplified for MVP (YYYY-MM-DD)

    useEffect(() => {
        loadProjects();
        loadContexts();
    }, []);

    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setProjectId(task.project_id);
            setContextId(task.context_id);
            
            let formattedDate = "";
            if (task.due_date) {
                const d = new Date(task.due_date);
                if (!isNaN(d.getTime())) {
                   formattedDate = d.toISOString().split('T')[0];
                }
            }
            setDueDate(formattedDate);
        }
    }, [task]);

    if (!task) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center">
                <Text>Task not found</Text>
                <Button title="Go Back" onPress={() => router.back()} />
            </SafeAreaView>
        );
    }

    const handleSave = async () => {
        if (taskId) {
            const dateObj = dueDate ? new Date(dueDate) : null;
            await updateTask(taskId, { 
                title, 
                project_id: projectId,
                context_id: contextId,
                due_date: dateObj
            });
            router.back();
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1 p-4">
                <View className="flex-row items-center mb-6">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <ChevronLeft size={24} color="#000" />
                    </TouchableOpacity>
                    <Text className="text-2xl font-bold">Edit Task</Text>
                </View>

                <ScrollView className="flex-1">
                    <View className="mb-6">
                        <Text className="text-sm font-bold text-gray-500 mb-2 uppercase">Title</Text>
                        <TextInput 
                            value={title} 
                            onChangeText={setTitle} 
                            className="bg-white border-2 border-gray-100 p-3 rounded-lg text-lg"
                        />
                    </View>

                    <View className="mb-6">
                        <Text className="text-sm font-bold text-gray-500 mb-2 uppercase">Due Date (YYYY-MM-DD)</Text>
                         <View className="flex-row items-center bg-white border-2 border-gray-100 p-3 rounded-lg">
                            <CalendarIcon size={20} color="#6b7280" className="mr-3"/>
                            <TextInput 
                                value={dueDate} 
                                onChangeText={setDueDate} 
                                placeholder="Optional"
                                className="flex-1 text-lg"
                            />
                        </View>
                    </View>

                    <View className="mb-6">
                        <Text className="text-sm font-bold text-gray-500 mb-2 uppercase">Project</Text>
                        <View className="flex-row flex-wrap gap-2">
                             <TouchableOpacity
                                onPress={() => setProjectId(null)}
                                className={`px-4 py-2 rounded-full border ${
                                    projectId === null 
                                    ? "bg-blue-100 border-blue-500" 
                                    : "bg-gray-50 border-gray-200"
                                }`}
                             >
                                <Text className={projectId === null ? "text-blue-700 font-medium" : "text-gray-600"}>
                                    No Project
                                </Text>
                             </TouchableOpacity>
                            {projects.filter(p => p.status === 'active').map(project => (
                                <TouchableOpacity
                                    key={project.id}
                                    onPress={() => setProjectId(project.id)}
                                    className={`px-4 py-2 rounded-full border ${
                                        projectId === project.id 
                                        ? "bg-blue-100 border-blue-500" 
                                        : "bg-gray-50 border-gray-200"
                                    }`}
                                >
                                    <Text className={projectId === project.id ? "text-blue-700 font-medium" : "text-gray-600"}>
                                        {project.title}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View className="mb-6">
                        <Text className="text-sm font-bold text-gray-500 mb-2 uppercase">Context</Text>
                        <View className="flex-row flex-wrap gap-2">
                             <TouchableOpacity
                                onPress={() => setContextId(null)}
                                className={`px-4 py-2 rounded-full border ${
                                    contextId === null 
                                    ? "bg-purple-100 border-purple-500" 
                                    : "bg-gray-50 border-gray-200"
                                }`}
                             >
                                <Text className={contextId === null ? "text-purple-700 font-medium" : "text-gray-600"}>
                                    None
                                </Text>
                             </TouchableOpacity>
                            {contexts.map(context => (
                                <TouchableOpacity
                                    key={context.id}
                                    onPress={() => setContextId(context.id)}
                                    className={`px-4 py-2 rounded-full border ${
                                        contextId === context.id 
                                        ? "bg-purple-100 border-purple-500" 
                                        : "bg-gray-50 border-gray-200"
                                    }`}
                                    style={contextId === context.id ? {} : { borderColor: context.color || '#e5e7eb' }}
                                >
                                    <View className="flex-row items-center gap-2">
                                        <View className="w-3 h-3 rounded-full" style={{ backgroundColor: context.color || '#ccc'}} />
                                        <Text className={contextId === context.id ? "text-purple-700 font-medium" : "text-gray-600"}>
                                            {context.title}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </ScrollView>

                <Button title="Save Changes" onPress={handleSave} />
            </View>
        </SafeAreaView>
    );
}
