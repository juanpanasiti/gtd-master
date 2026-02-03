import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useProjects } from "@/store/useProjects";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Layers, ChevronLeft, GripVertical } from "lucide-react-native";
import { useRouter } from "expo-router";

import { useTheme } from "@/core/theme/ThemeProvider";
import { useTranslation } from "react-i18next";
import DraggableFlatList, { ScaleDecorator, RenderItemParams } from "react-native-draggable-flatlist";

const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#a855f7", "#ec4899", "#6b7280"];

export default function AreasScreen() {
    const { areas, loadAreas, addArea, deleteArea, updateAreasOrder } = useProjects();
    const [title, setTitle] = useState("");
    const [selectedColor, setSelectedColor] = useState(COLORS[7]);
    const router = useRouter();
    const { isDark } = useTheme();
    const { t } = useTranslation();

    const bgColor = isDark ? "bg-slate-950" : "bg-white";
    const cardBg = isDark ? "bg-slate-800" : "bg-gray-50";
    const itemBg = isDark ? "bg-slate-900" : "bg-white";
    const textColor = isDark ? "text-white" : "text-gray-900";
    const secondaryText = isDark ? "text-slate-300" : "text-gray-700";
    const borderColor = isDark ? "border-slate-700" : "border-gray-100";
    const inputBg = isDark ? "bg-slate-900" : "bg-white";

    useEffect(() => {
        loadAreas();
    }, []);

    const handleSubmit = async () => {
        if (!title.trim()) return;
        await addArea(title, selectedColor);
        setTitle("");
        setSelectedColor(COLORS[7]);
    };

    return (
        <SafeAreaView className={`flex-1 ${bgColor}`}>
            <View className="flex-1 p-4">
                 <View className="flex-row items-center mb-6">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <ChevronLeft size={24} color={isDark ? "#fff" : "#000"} />
                    </TouchableOpacity>
                    <Text className={`text-2xl font-bold ${textColor}`}>{t("areas.title")}</Text>
                </View>

                <View className={`mb-6 ${cardBg} p-4 rounded-xl`}>
                    <Text className={`font-bold mb-2 ${secondaryText}`}>
                        {t("common.add")} {t("areas.title")}
                    </Text>
                    <Input 
                        value={title} 
                        onChangeText={setTitle} 
                        placeholder={t("areas.placeholder")}
                        className={`mb-3 ${inputBg} ${textColor}`}
                        placeholderTextColor={isDark ? "#64748b" : "#9ca3af"}
                    />
                    <View className="flex-row gap-2 mb-4 flex-wrap">
                        {COLORS.map(color => (
                            <TouchableOpacity
                                key={color}
                                onPress={() => setSelectedColor(color)}
                                className={`w-8 h-8 rounded-full ${selectedColor === color ? `border-2 ${isDark ? "border-white" : "border-black"}` : ""}`}
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </View>
                    <Button 
                        title={t("common.add")} 
                        onPress={handleSubmit} 
                        disabled={!title.trim()} 
                    />
                </View>

                <Text className={`font-bold mb-4 text-xl ${textColor}`}>Existing Areas</Text>
                <DraggableFlatList
                    data={areas}
                    onDragEnd={({ data }) => {
                        // Optimistic update
                        const updates = data.map((area, index) => ({
                            id: area.id,
                            updates: { sort_order: index }
                        }));
                        updateAreasOrder(updates);
                    }}
                    keyExtractor={item => item.id.toString()}
                    containerStyle={{ flex: 1 }}
                    renderItem={({ item, drag, isActive }: RenderItemParams<any>) => (
                        <ScaleDecorator>
                            <TouchableOpacity 
                                onLongPress={drag}
                                disabled={isActive}
                                className={`flex-row items-center justify-between p-3 mb-2 ${itemBg} border ${borderColor} rounded-lg`}
                                style={{
                                    backgroundColor: isActive ? (isDark ? "#1e293b" : "#f1f5f9") : itemBg
                                }}
                            >
                                <View className="flex-row items-center flex-1">
                                    <TouchableOpacity onPressIn={drag} className="mr-3">
                                        <GripVertical size={20} color={isDark ? "#475569" : "#cbd5e1"} />
                                    </TouchableOpacity>
                                    <View 
                                        className="w-4 h-4 rounded-full mr-3" 
                                        style={{ backgroundColor: item.color }} 
                                    />
                                    <Text className={`text-lg ${secondaryText} flex-1`}>{item.title}</Text>
                                </View>
                                <TouchableOpacity onPress={() => deleteArea(item.id)}>
                                    <Text className="text-red-500 font-bold">{t("common.delete")}</Text>
                                </TouchableOpacity>
                            </TouchableOpacity>
                        </ScaleDecorator>
                    )}
                />
            </View>
        </SafeAreaView>
    );
}
