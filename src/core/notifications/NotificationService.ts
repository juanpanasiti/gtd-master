import * as Device from 'expo-device';
import { Platform } from 'react-native';
import i18next from 'i18next';
import Constants, { ExecutionEnvironment } from 'expo-constants';

// Only set handler if NOT in Expo Go (where it crashes) or at least try-catch it
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// We delay importing expo-notifications until needed and ONLY if not in Expo Go
// to avoid the fatal crash on Android
const getNotifications = () => {
    if (isExpoGo) return null;
    return require('expo-notifications');
};

try {
    const Notifications = getNotifications();
    if (Notifications) {
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: true,
                shouldPlaySound: true,
                shouldSetBadge: true,
                shouldShowBanner: true,
                shouldShowList: true,
            }),
        });
    }
} catch (e) {
    console.warn('NotificationService: Failed to set notification handler', e);
}

export const requestPermissions = async () => {
    if (isExpoGo) {
        console.warn('NotificationService: Permissions skipped in Expo Go');
        return false;
    }

    const Notifications = getNotifications();
    if (!Notifications) return false;

    if (!Device.isDevice) {
        console.log('Must use physical device for push notifications');
        return false;
    }

    try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return false;
        }

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        return true;
    } catch (e) {
        console.warn('NotificationService: requestPermissions failed', e);
        return false;
    }
};

export const scheduleDailyReviewReminder = async (
    dueCount: number = 0,
    startCount: number = 0,
    hour: number = 9,
    minute: number = 0
) => {
    if (isExpoGo) return;
    const Notifications = getNotifications();
    if (!Notifications) return;

    try {
        const { status } = await Notifications.getPermissionsAsync();
        if (status !== 'granted') return;

        let body = i18next.t('notifications.dailyBody');
        if (dueCount > 0 || startCount > 0) {
            body = i18next.t('notifications.dailyBodyBriefing', { due: dueCount, start: startCount });
        }

        await Notifications.scheduleNotificationAsync({
            identifier: 'daily-review',
            content: {
                title: i18next.t('notifications.dailyTitle'),
                body,
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
                hour,
                minute,
                repeats: true,
            },
        });
    } catch (e) {
        console.warn('NotificationService: scheduleDailyReviewReminder failed', e);
    }
};

export const scheduleWeeklyReviewReminder = async (
    hour: number = 10,
    minute: number = 0,
    weekday: number = 1
) => {
    if (isExpoGo) return;
    const Notifications = getNotifications();
    if (!Notifications) return;

    try {
        const { status } = await Notifications.getPermissionsAsync();
        if (status !== 'granted') return;

        await Notifications.scheduleNotificationAsync({
            identifier: 'weekly-review',
            content: {
                title: i18next.t('notifications.weeklyTitle'),
                body: i18next.t('notifications.weeklyBody'),
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
                hour,
                minute,
                weekday,
                repeats: true,
            },
        });
    } catch (e) {
        console.warn('NotificationService: scheduleWeeklyReviewReminder failed', e);
    }
};

export const cancelAllReminders = async () => {
    if (isExpoGo) return;
    const Notifications = getNotifications();
    if (!Notifications) return;

    try {
        await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (e) {
        console.warn('NotificationService: cancelAllReminders failed', e);
    }
};
