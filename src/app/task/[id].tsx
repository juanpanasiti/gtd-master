import { View, Text, SafeAreaView, TouchableOpacity, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTasks } from "@/store/useTasks";
import { useProjects } from "@/store/useProjects";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ChevronLeft } from "lucide-react-native";

export default function TaskDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { tasks, updateTask } = useTasks(); // We need to add updateTask to store
    const { projects, loadProjects } = useProjects();
    
    // Convert id to number
    const taskId = id ? Number(id) : null;
    const task = tasks.find(t => t.id === taskId);

    const [title, setTitle] = useState("");
    const [projectId, setProjectId] = useState<number | null>(null);

    useEffect(() => {
        loadProjects();
    }, []);

    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setProjectId(task.project_id);
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
            await updateTask(taskId, { title, project_id: projectId });
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
                        <Input 
                            value={title} 
                            onChangeText={setTitle} 
                            className="bg-white border-2 border-gray-100"
                        />
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
                </ScrollView>

                <Button title="Save Changes" onPress={handleSave} />
            </View>
        </SafeAreaView>
    );
}
