import { View, Text, Animated as RNAnimated, I18nManager } from "react-native";
import { RectButton } from "react-native-gesture-handler";
import Swipeable from "react-native-gesture-handler/Swipeable";
import Reanimated, { FadeInDown, FadeOutLeft } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Check, Trash2 } from "lucide-react-native";
import { TaskItem } from "./TaskItem";

interface SwipeableTaskRowProps {
    task: {
        id: number;
        title: string;
        is_completed: boolean;
        context_id?: number | null;
    };
    onToggle: (id: number, currentStatus: boolean) => void;
    onDelete: (id: number) => void;
    context?: { id: number; title: string; color: string | null } | undefined;
}

export const SwipeableTaskRow = ({ task, onToggle, onDelete, context }: SwipeableTaskRowProps) => {

    const renderRightActions = (progress: RNAnimated.AnimatedInterpolation<number>, drag: RNAnimated.AnimatedInterpolation<number>) => {
        const trans = drag.interpolate({
            inputRange: [-64, 0],
            outputRange: [1, 0],
            extrapolate: 'clamp',
        });
        
        return (
            <View className="w-16 h-full bg-red-500 rounded-xl items-center justify-center -ml-4" style={{ transform: [{ translateX: 0 }] }}>
               <View className="items-center justify-center w-full h-full">
                    <Trash2 color="white" size={24} />
               </View>
            </View>
        );
    };

    const renderLeftActions = (progress: RNAnimated.AnimatedInterpolation<number>, drag: RNAnimated.AnimatedInterpolation<number>) => {
        const trans = drag.interpolate({
            inputRange: [0, 64],
            outputRange: [0, 1],
            extrapolate: 'clamp',
        });

        return (
             <View className="w-16 h-full bg-green-500 rounded-xl items-center justify-center -mr-4" style={{ transform: [{ translateX: 0 }] }}>
                 <View className="items-center justify-center w-full h-full">
                    <Check color="white" size={24} />
                 </View>
             </View>
        );
    };

    const handleSwipeLeft = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onToggle(task.id, task.is_completed);
    };
    
    const handleSwipeRight = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onDelete(task.id);
    };

    return (
        <Reanimated.View 
            entering={FadeInDown} 
            exiting={FadeOutLeft}
            className="mb-3"
        >
            <Swipeable
                friction={2}
                enableTrackpadThumbInteraction
                renderLeftActions={renderLeftActions}
                renderRightActions={renderRightActions}
                onSwipeableOpen={(direction) => {
                     if (direction === 'left') {
                         handleSwipeLeft();
                     } else if (direction === 'right') {
                         handleSwipeRight();
                     }
                }}
            >
                <TaskItem task={task} onToggle={onToggle} context={context} />
            </Swipeable>
        </Reanimated.View>
    );
};
