import { View, Text, FlatList, TouchableOpacity, TextInput, Alert } from "react-native";
import DraggableFlatList, { ScaleDecorator, RenderItemParams } from "react-native-draggable-flatlist";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Folder, Edit2, Check, X as XIcon, Trash2, Plus, ChevronDown, ChevronUp, RefreshCcw } from "lucide-react-native";
import { useTasks } from "@/store/useTasks";
import { useProjects } from "@/store/useProjects";
import { TaskItem } from "@/components/TaskItem";
import { useTheme } from "@/core/theme/ThemeProvider";
import { useTranslation } from "react-i18next";

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { isDark } = useTheme();

  const { tasks, loadTasks, toggleTask, contexts, loadContexts, addTask, resetProjectRecurringTasks, updateTasksOrder } = useTasks();
  const { projects, loadProjects, updateProject, deleteProject, areas, loadAreas, references, loadReferences, addReference, deleteReference } = useProjects();
  
  const projectId = parseInt(id || "0", 10);
  const projectReferences = references[projectId] || [];

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newReference, setNewReference] = useState("");
  const [activeTab, setActiveTab] = useState<"actions" | "reference">("actions");
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => {
    loadProjects();
    loadTasks();
    loadContexts();
    loadAreas();
    loadReferences(projectId);
  }, []);

  const project = useMemo(
    () => projects.find((p) => p.id === projectId),
    [projects, projectId]
  );

  useEffect(() => {
    if (project) {
        setEditTitle(project.title);
        setSelectedAreaId(project.area_id);
    }
  }, [project]);

  const handleUpdate = async () => {
    if (!editTitle.trim()) return;
    await updateProject(projectId, { title: editTitle, area_id: selectedAreaId });
    setIsEditing(false);
  };

  const handleDelete = () => {
    Alert.alert(
        "Delete Project",
        "Are you sure you want to delete this project? All associated tasks will remain but lose their project assignment.",
        [
            { text: "Cancel", style: "cancel" },
            { 
                text: "Delete", 
                style: "destructive",
                onPress: async () => {
                    await deleteProject(projectId);
                    router.back();
                }
            }
        ]
    );
  };

  const handleQuickAdd = async () => {
    if (!newTaskTitle.trim()) return;
    await addTask(newTaskTitle, null, projectId);
    setNewTaskTitle("");
  };

  const handleAddReference = async () => {
    if (!newReference.trim()) return;
    await addReference(projectId, newReference);
    setNewReference("");
  };

  const availableTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return tasks.filter((t) => {
        if (t.project_id !== projectId || t.is_completed) return false;
        if (!t.start_date) return true;
        const startDate = new Date(t.start_date);
        startDate.setHours(0, 0, 0, 0);
        return startDate <= today;
    });
  }, [tasks, projectId]);

  const futureTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return tasks.filter((t) => {
        if (t.project_id !== projectId || t.is_completed) return false;
        if (!t.start_date) return false;
        const startDate = new Date(t.start_date);
        startDate.setHours(0, 0, 0, 0);
        return startDate > today;
    });
  }, [tasks, projectId]);

  // Combine for FlatList but we might want sections. 
  // For DraggableFlatList, we must provide a flat array.
  // We'll filter only non-completed tasks for dragging, as completed tasks are usually at the bottom and shouldn't interfere with the active backlog order.
  const displayTasks = useMemo(() => {
    return [...availableTasks, ...futureTasks].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  }, [availableTasks, futureTasks]);

  const handleDragEnd = async (data: typeof displayTasks) => {
    const taskOrders = data.map((task, index) => ({
      id: task.id,
      sort_order: index
    }));
    await updateTasksOrder(taskOrders);
  };

  const completedTasks = useMemo(
    () => tasks.filter((t) => t.project_id === projectId && t.is_completed),
    [tasks, projectId]
  );
  
  const hasRecurringTasks = useMemo(
    () => tasks.some(t => t.project_id === projectId && t.is_recurring),
    [tasks, projectId]
  );

  const bgColor = isDark ? "bg-gray-900" : "bg-white";
  const textColor = isDark ? "text-white" : "text-gray-900";
  const secondaryText = isDark ? "text-gray-400" : "text-gray-500";
  const headerBg = isDark ? "bg-gray-800" : "bg-white";
  const borderColor = isDark ? "border-gray-700" : "border-gray-200";

  return (
    <SafeAreaView className={`flex-1 ${bgColor}`}>
      {/* Header */}
      <View className={`flex-row items-center px-4 py-3 border-b ${borderColor} ${headerBg}`}>
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft size={24} color={isDark ? "#fff" : "#374151"} />
        </TouchableOpacity>
        <Folder size={24} color={isDark ? "#9ca3af" : "#4b5563"} className="ml-2" />
        
        {isEditing ? (
            <View className="flex-1 ml-3">
                <View className="flex-row items-center">
                    <TextInput
                        value={editTitle}
                        onChangeText={setEditTitle}
                        className={`flex-1 text-xl font-bold ${textColor} border-b ${borderColor} mr-2`}
                        autoFocus
                    />
                    <TouchableOpacity onPress={handleUpdate} className="p-2">
                        <Check size={20} color={isDark ? "#4ade80" : "#16a34a"} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setIsEditing(false)} className="p-2">
                        <XIcon size={20} color={isDark ? "#f87171" : "#dc2626"} />
                    </TouchableOpacity>
                </View>
                <View className="flex-row items-center mt-2 flex-wrap gap-2">
                    <TouchableOpacity 
                        onPress={() => setSelectedAreaId(null)}
                        className={`px-3 py-1 rounded-full border ${!selectedAreaId ? "bg-slate-500 border-slate-500" : borderColor}`}
                    >
                        <Text className={`text-xs font-bold ${!selectedAreaId ? "text-white" : secondaryText}`}>
                            No Area
                        </Text>
                    </TouchableOpacity>
                    {areas.map(area => (
                        <TouchableOpacity 
                            key={area.id}
                            onPress={() => setSelectedAreaId(area.id)}
                            className={`px-3 py-1 rounded-full border ${selectedAreaId === area.id ? "" : borderColor}`}
                            style={selectedAreaId === area.id ? { backgroundColor: area.color, borderColor: area.color } : {}}
                        >
                            <Text className={`text-xs font-bold ${selectedAreaId === area.id ? "text-white" : secondaryText}`}>
                                {area.title}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        ) : (
            <>
                <View className="flex-1 ml-3">
                    <Text className={`text-xl font-bold ${textColor}`} numberOfLines={1}>
                        {project?.title || "Project"}
                    </Text>
                    {project?.area_id && (
                        <View className="flex-row items-center mt-0.5">
                            <View 
                                className="w-2 h-2 rounded-full mr-1.5" 
                                style={{ backgroundColor: areas.find(a => a.id === project.area_id)?.color || "#ccc" }} 
                            />
                            <Text className={`text-xs font-medium ${secondaryText}`}>
                                {areas.find(a => a.id === project.area_id)?.title}
                            </Text>
                        </View>
                    )}
                </View>
                <TouchableOpacity onPress={() => setIsEditing(true)} className="p-2">
                    <Edit2 size={20} color={isDark ? "#9ca3af" : "#4b5563"} />
                </TouchableOpacity>
            </>
        )}
      </View>

      {/* Tabs */}
      <View className={`flex-row border-b ${borderColor} ${headerBg}`}>
          <TouchableOpacity 
            onPress={() => setActiveTab("actions")}
            className={`flex-1 py-3 items-center border-b-2 ${activeTab === "actions" ? "border-blue-500" : "border-transparent"}`}
          >
              <Text className={`font-bold ${activeTab === "actions" ? "text-blue-500" : secondaryText}`}>
                  {t("projectDetail.actions")}
              </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setActiveTab("reference")}
            className={`flex-1 py-3 items-center border-b-2 ${activeTab === "reference" ? "border-blue-500" : "border-transparent"}`}
          >
              <Text className={`font-bold ${activeTab === "reference" ? "text-blue-500" : secondaryText}`}>
                  {t("projectDetail.reference")}
              </Text>
          </TouchableOpacity>
      </View>

      {activeTab === "actions" ? (
          <>
            {/* Quick Add Task */}
            <View className={`flex-row items-center p-4 border-b ${borderColor} ${headerBg}`}>
                <Plus size={20} color={isDark ? "#9ca3af" : "#6b7280"} />
                <TextInput
                    value={newTaskTitle}
                    onChangeText={setNewTaskTitle}
                    placeholder={t("projectDetail.addTaskPlaceholder")}
                    placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                    className={`flex-1 ml-3 text-base ${textColor}`}
                    onSubmitEditing={handleQuickAdd}
                />
                {newTaskTitle.length > 0 && (
                    <TouchableOpacity onPress={handleQuickAdd}>
                        <Text className="font-bold text-blue-500">{t("common.add")}</Text>
                    </TouchableOpacity>
                )}
            </View>


            <DraggableFlatList
                data={displayTasks}
                onDragEnd={({ data }) => handleDragEnd(data)}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                renderItem={({ item, drag, isActive }: RenderItemParams<any>) => {
                    const isFuture = item.start_date && new Date(item.start_date) > new Date();
                    return (
                        <ScaleDecorator>
                            <View className={isFuture ? "opacity-60" : ""} style={{
                                backgroundColor: isActive ? (isDark ? "#1e293b" : "#f1f5f9") : "transparent",
                                borderRadius: isActive ? 12 : 0
                            }}>
                                {isFuture && displayTasks.indexOf(item) === availableTasks.length && (
                                    <Text className={`text-sm font-semibold uppercase tracking-wider mb-2 mt-4 ${secondaryText}`}>
                                        {t("projectDetail.scheduled")}
                                    </Text>
                                )}
                                <TaskItem
                                    task={item}
                                    onToggle={toggleTask}
                                    drag={drag}
                                    context={contexts.find((c) => c.id === item.context_id)}
                                />
                            </View>
                        </ScaleDecorator>
                    );
                }}
                ListHeaderComponent={
                availableTasks.length > 0 ? (
                    <Text className={`text-sm font-semibold uppercase tracking-wider mb-3 ${secondaryText}`}>
                    {t("projectDetail.activeTasks")} ({availableTasks.length + futureTasks.length})
                    </Text>
                ) : null
                }
                ListEmptyComponent={
                <View className="items-center justify-center p-10 mt-10">
                    <View className={`${isDark ? "bg-gray-800" : "bg-gray-100"} p-6 rounded-full mb-4`}>
                    <Folder size={48} color={isDark ? "#6b7280" : "#9ca3af"} />
                    </View>
                    <Text className={`text-xl font-bold mb-2 ${textColor}`}>{t("projectDetail.noTasks")}</Text>
                    <Text className={`${secondaryText} text-center`}>
                    {t("projectDetail.noTasksDescription")}
                    </Text>
                </View>
                }
                ListFooterComponent={
                completedTasks.length > 0 ? (
                    <View className="mt-6">
                    <TouchableOpacity 
                        onPress={() => setShowCompleted(!showCompleted)}
                        className="flex-row items-center justify-between py-2"
                    >
                        <Text className={`text-sm font-semibold uppercase tracking-wider ${secondaryText}`}>
                            {t("projectDetail.completedTasks")} ({completedTasks.length})
                        </Text>
                        {showCompleted ? (
                            <ChevronUp size={20} color={isDark ? "#9ca3af" : "#6b7280"} />
                        ) : (
                            <ChevronDown size={20} color={isDark ? "#9ca3af" : "#6b7280"} />
                        )}
                    </TouchableOpacity>
                    
                    {showCompleted && (
                        <View className="mt-2">
                            {completedTasks.map((task) => (
                                <TaskItem
                                key={task.id}
                                task={task}
                                onToggle={toggleTask}
                                context={contexts.find((c) => c.id === task.context_id)}
                                />
                            ))}
                        </View>
                    )}
                    </View>
                ) : null
                }
                ListFooterComponentStyle={{ marginTop: 20 }}
            />
          </>
      ) : (
          <>
            {/* Add Reference */}
            <View className={`p-4 border-b ${borderColor} ${headerBg}`}>
                <View className="flex-row items-start mb-2">
                    <TextInput
                        value={newReference}
                        onChangeText={setNewReference}
                        placeholder={t("projectDetail.addReferencePlaceholder")}
                        placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                        className={`flex-1 text-base ${textColor} min-h-[40px]`}
                        multiline
                    />
                </View>
                {newReference.trim().length > 0 && (
                    <TouchableOpacity 
                        onPress={handleAddReference}
                        className="bg-blue-500 self-end px-4 py-2 rounded-lg"
                    >
                        <Text className="font-bold text-white">{t("common.add")}</Text>
                    </TouchableOpacity>
                )}
            </View>

            <FlatList
                data={projectReferences}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                renderItem={({ item }) => (
                    <View className={`p-4 mb-3 rounded-xl ${isDark ? "bg-gray-800" : "bg-gray-50"} border ${borderColor}`}>
                        <View className="flex-row justify-between items-start">
                            <Text className={`text-base flex-1 ${textColor}`}>{item.content}</Text>
                            <TouchableOpacity 
                                onPress={() => deleteReference(item.id, projectId)}
                                className="ml-2"
                            >
                                <Trash2 size={16} color="#ef4444" />
                            </TouchableOpacity>
                        </View>
                        <Text className={`text-xs mt-2 ${secondaryText}`}>
                            {new Date(item.created_at).toLocaleDateString()}
                        </Text>
                    </View>
                )}
                ListEmptyComponent={
                    <View className="items-center justify-center p-10 mt-10">
                        <Text className={`text-lg font-bold mb-2 ${textColor}`}>
                            {t("projectDetail.noReference")}
                        </Text>
                        <Text className={`${secondaryText} text-center`}>
                            {t("projectDetail.noReferenceDescription")}
                        </Text>
                    </View>
                }
            />
          </>
      )}
      
      {/* Footer Delete Action */}
      <View className={`border-t ${borderColor} p-4`}>
        <TouchableOpacity 
            onPress={handleDelete}
            className="flex-row items-center justify-center p-3 rounded-lg bg-red-50 dark:bg-red-900/20"
        >
            <Trash2 size={20} color={isDark ? "#f87171" : "#dc2626"} />
            <Text className={`ml-2 font-semibold ${isDark ? "text-red-400" : "text-red-600"}`}>
                {t("projectDetail.deleteProject")}
            </Text>
        </TouchableOpacity>
      </View>

      {/* Manual Reset FAB */}
      {activeTab === "actions" && hasRecurringTasks && (
          <TouchableOpacity 
              onPress={() => {
                  Alert.alert(
                      t("projectDetail.resetSession"),
                      t("projectDetail.resetSessionConfirm"),
                      [
                          { text: t("common.cancel"), style: "cancel" },
                          { 
                              text: t("common.continue"), 
                              onPress: async () => {
                                  await resetProjectRecurringTasks(projectId);
                              }
                          }
                      ]
                  );
              }}
              style={{
                  position: 'absolute',
                  right: 20,
                  bottom: 110, // Slightly higher to be well above the footer
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: '#3b82f6',
                  alignItems: 'center',
                  justifyContent: 'center',
                  elevation: 8,
                  zIndex: 99,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.30,
                  shadowRadius: 4.65,
              }}
              activeOpacity={0.7}
          >
              <RefreshCcw size={28} color="white" />
          </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}
