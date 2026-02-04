import * as Calendar from 'expo-calendar';
import { Platform, Alert, Linking } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';

export interface CalendarEventData {
    title: string;
    startDate: Date;
    endDate: Date;
    notes?: string;
    location?: string;
}

class CalendarService {
    /**
     * Request calendar permissions
     */
    async requestPermissions(): Promise<boolean> {
        try {
            const { status } = await Calendar.requestCalendarPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Permiso requerido',
                    'Se necesita permiso para acceder al calendario. Por favor, habilita los permisos en la configuración de tu dispositivo.'
                );
                return false;
            }
            return true;
        } catch (error) {
            console.error('Error requesting calendar permissions:', error);
            return false;
        }
    }

    /**
     * Open the native calendar app with pre-filled event data (Intent)
     */
    async openCalendarIntent(eventData: CalendarEventData): Promise<boolean> {
        if (Platform.OS === 'android') {
            try {
                const { title, startDate, endDate, notes, location } = eventData;
                
                // Use native Android Intent for inserting an event
                // This is much more robust than Linking.openURL
                await IntentLauncher.startActivityAsync('android.intent.action.INSERT', {
                    data: 'content://com.android.calendar/events',
                    extra: {
                        'title': title,
                        'description': notes || '',
                        'eventLocation': location || '',
                        'beginTime': startDate.getTime(),
                        'endTime': endDate.getTime(),
                    }
                });
                return true;
            } catch (error) {
                console.error("Error launching calendar intent:", error);
                
                // Fallback to Linking if IntentLauncher fails
                try {
                     const beginTime = eventData.startDate.getTime();
                     const endTime = eventData.endDate.getTime();
                     const url = `content://com.android.calendar/events/insert?title=${encodeURIComponent(eventData.title)}&description=${encodeURIComponent(eventData.notes || '')}&eventLocation=${encodeURIComponent(eventData.location || '')}&beginTime=${beginTime}&endTime=${endTime}`;
                     await Linking.openURL(url);
                     return true;
                } catch (fallbackError) {
                    Alert.alert("Error", "No se pudo abrir la aplicación de calendario.");
                    return false;
                }
            }
        } else {
            // iOS Fallback: Create and then open
            // iOS doesn't support a direct "Insert Intent" URL scheme nicely
            return this.createAndOpenEventIOS(eventData);
        }
    }

    /**
     * iOS specific handler: Create event then open it
     */
    private async createAndOpenEventIOS(eventData: CalendarEventData): Promise<boolean> {
        try {
            const hasPermission = await this.requestPermissions();
            if (!hasPermission) return false;

            const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
            const defaultCalendar = calendars.find(
                cal => (cal.isPrimary || cal.allowsModifications) && cal.allowsModifications
            ) || calendars[0];

            if (!defaultCalendar) {
                Alert.alert('Error', 'No se encontró un calendario disponible en iOS.');
                return false;
            }

            const eventId = await Calendar.createEventAsync(defaultCalendar.id, {
                title: eventData.title,
                startDate: eventData.startDate,
                endDate: eventData.endDate,
                notes: eventData.notes,
                location: eventData.location,
                timeZone: 'default',
            });

            if (eventId) {
                await Calendar.openEventInCalendar(eventId);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error creating iOS event:', error);
            return false;
        }
    }

    /**
     * Create a calendar event for a task with start date
     */
    async createStartDateEvent(
        taskTitle: string,
        startDate: Date,
        description?: string
    ): Promise<boolean> {
        const eventStart = new Date(startDate);
        eventStart.setHours(9, 0, 0, 0); 
        
        const eventEnd = new Date(eventStart);
        eventEnd.setHours(10, 0, 0, 0); 

        return this.openCalendarIntent({
            title: `🚀 ${taskTitle}`,
            startDate: eventStart,
            endDate: eventEnd,
            notes: description ? `GTD Master - Inicio\n\n${description}` : 'GTD Master - Inicio',
        });
    }

    /**
     * Create a calendar event for a task with due date
     */
    async createDueDateEvent(
        taskTitle: string,
        dueDate: Date,
        description?: string
    ): Promise<boolean> {
        const eventEnd = new Date(dueDate);
        eventEnd.setHours(17, 0, 0, 0); 
        
        const eventStart = new Date(eventEnd);
        eventStart.setHours(16, 0, 0, 0); 

        return this.openCalendarIntent({
            title: `⏰ ${taskTitle}`,
            startDate: eventStart,
            endDate: eventEnd,
            notes: description ? `GTD Master - Vencimiento\n\n${description}` : 'GTD Master - Vencimiento',
        });
    }

    /**
     * Check if a date is valid for calendar
     */
    isValidDate(date: Date | null): boolean {
        return date !== null && date instanceof Date && !isNaN(date.getTime());
    }
}

export const calendarService = new CalendarService();

