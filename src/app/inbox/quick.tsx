import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect, useRef } from "react";
import { useTasks } from "@/store/useTasks";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { useTheme } from "@/core/theme/ThemeProvider";
import { Send, X, Zap } from "lucide-react-native";
import * as Haptics from "expo-haptics";

export default function QuickCaptureScreen() {
    const [title, setTitle] = useState("");
    const { addTask } = useTasks();
    const { t } = useTranslation();
    const router = useRouter();
    const { isDark } = useTheme();
    const inputRef = useRef<TextInput>(null);

    useEffect(() => {
        // Focus the input immediately on mount
        const timer = setTimeout(() => {
            inputRef.current?.focus();
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    const handleCapture = async () => {
        if (!title.trim()) return;
        
        try {
            await addTask(title.trim());
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setTitle("");
            router.back();
        } catch (error) {
            console.error("Capture error:", error);
        }
    };

    const bgColor = isDark ? "bg-slate-950" : "bg-gray-50";
    const textColor = isDark ? "text-white" : "text-gray-900";
    const cardBg = isDark ? "bg-slate-900" : "bg-white";
    const borderColor = isDark ? "border-slate-800" : "border-gray-200";

    return (
        <SafeAreaView className={`flex-1 ${bgColor}`}>
            <View className={`p-4 flex-row items-center justify-between border-b ${borderColor}`}>
                <View className="flex-row items-center">
                    <View className="bg-purple-600/10 p-2 rounded-lg">
                        <Zap size={20} color="#a855f7" />
                    </View>
                    <Text className={`ml-3 text-xl font-bold ${textColor}`}>
                        {t("inbox.quickCapture")}
                    </Text>
                </View>
                <TouchableOpacity onPress={() => router.back()} className="p-2">
                    <X size={24} color={isDark ? "#94a3b8" : "#64748b"} />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1 justify-center px-6"
            >
                <View className={`${cardBg} p-6 rounded-3xl shadow-xl border ${borderColor}`}>
                    <TextInput
                        ref={inputRef}
                        value={title}
                        onChangeText={setTitle}
                        placeholder={t("inbox.capturePlaceholder")}
                        placeholderTextColor={isDark ? "#475569" : "#94a3b8"}
                        className={`text-2xl font-bold ${textColor} mb-8`}
                        multiline
                        maxLength={200}
                        onSubmitEditing={handleCapture}
                        blurOnSubmit={false}
                    />

                    <TouchableOpacity 
                        onPress={handleCapture}
                        disabled={!title.trim()}
                        className={`flex-row items-center justify-center p-5 rounded-2xl bg-purple-600 ${!title.trim() ? "opacity-50" : ""}`}
                    >
                        <Send size={20} color="white" />
                        <Text className="text-white font-extrabold text-lg ml-3 uppercase tracking-widest">
                            {t("common.add")}
                        </Text>
                    </TouchableOpacity>
                </View>
                <View className="h-20" />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
