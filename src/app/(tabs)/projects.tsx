import { View, Text, FlatList, TouchableOpacity, SafeAreaView } from "react-native";
import { useProjects } from "@/store/useProjects";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Folder } from "lucide-react-native";

export default function ProjectsScreen() {
  const { projects, loadProjects, addProject } = useProjects();
  const [newProject, setNewProject] = useState("");
  const router = useRouter();

  useEffect(() => {
    loadProjects();
  }, []);

  const handleAddProject = async () => {
    if (!newProject.trim()) return;
    await addProject(newProject);
    setNewProject("");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 p-4">
          <View className="flex-row justify-between items-center mb-6">
              <Text className="text-3xl font-bold text-gray-900">Projects</Text>
              <TouchableOpacity onPress={() => router.push("/organize/contexts")}>
                  <Text className="text-blue-600 font-medium">Contexts</Text>
              </TouchableOpacity>
          </View>

          <FlatList
            data={projects.filter(p => p.status === 'active')}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingBottom: 100 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => router.push(`/project/${item.id}`)}
                className="p-4 mb-3 rounded-xl bg-white border border-gray-200 shadow-sm flex-row items-center gap-3"
              >
                <Folder size={24} color="#4B5563" />
                <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-800">{item.title}</Text>
                    <Text className="text-sm text-gray-500">{item.status}</Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
                <View className="items-center justify-center p-10">
                    <Text className="text-gray-400 text-center">No active projects.</Text>
                </View>
            }
          />

          <View className="mt-4 gap-3">
            <Input
              value={newProject}
              onChangeText={setNewProject}
              placeholder="New Project Name"
              returnKeyType="done"
              onSubmitEditing={handleAddProject}
            />
            <Button 
                title="Create Project" 
                onPress={handleAddProject} 
                disabled={!newProject.trim()}
                className={!newProject.trim() ? "opacity-50" : ""}
            />
          </View>
        </View>
    </SafeAreaView>
  );
}
