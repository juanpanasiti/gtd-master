import { View, Text, FlatList, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTasks } from "@/store/useTasks";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Tag, ChevronLeft } from "lucide-react-native";
import { useRouter } from "expo-router";

const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#a855f7", "#ec4899", "#6b7280"];

export default function ContextsScreen() {
    const { contexts, loadContexts, addContext } = useTasks();
    const [title, setTitle] = useState("");
    const [selectedColor, setSelectedColor] = useState(COLORS[7]);
    const router = useRouter();

    useEffect(() => {
        loadContexts();
    }, []);

    const handleAdd = async () => {
        if (!title.trim()) return;
        await addContext(title, "tag", selectedColor);
        setTitle("");
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1 p-4">
                 <View className="flex-row items-center mb-6">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <ChevronLeft size={24} color="#000" />
                    </TouchableOpacity>
                    <Text className="text-2xl font-bold">Manage Contexts</Text>
                </View>

                <View className="mb-6 bg-gray-50 p-4 rounded-xl">
                    <Text className="font-bold mb-2 text-gray-700">New Context</Text>
                    <Input 
                        value={title} 
                        onChangeText={setTitle} 
                        placeholder="Context Name (e.g. @home)" 
                        className="mb-3 bg-white"
                    />
                    <View className="flex-row gap-2 mb-4 flex-wrap">
                        {COLORS.map(color => (
                            <TouchableOpacity
                                key={color}
                                onPress={() => setSelectedColor(color)}
                                className={`w-8 h-8 rounded-full ${selectedColor === color ? "border-2 border-black" : ""}`}
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </View>
                    <Button title="Add Context" onPress={handleAdd} disabled={!title.trim()} />
                </View>

                <Text className="font-bold mb-4 text-xl text-gray-800">Existing Contexts</Text>
                <FlatList
                    data={contexts}
                    keyExtractor={item => item.id.toString()}
                    renderItem={({ item }) => (
                        <View className="flex-row items-center p-3 mb-2 bg-white border border-gray-100 rounded-lg">
                            <View 
                                className="w-4 h-4 rounded-full mr-3" 
                                style={{ backgroundColor: item.color || "#ccc" }} 
                            />
                            <Text className="text-lg text-gray-700">{item.title}</Text>
                        </View>
                    )}
                />
            </View>
        </SafeAreaView>
    );
}
