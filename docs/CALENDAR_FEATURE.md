# Calendar Feature

## Description

GTD Master now allows you to add tasks with due dates or start dates to your phone's native calendar. This feature facilitates the management of important tasks that have specific deadlines or scheduled start times.

## Features

### 1. **Native Calendar Integration**
- When pressing the calendar button, **the device's calendar application opens**.
- The event is pre-loaded with:
  - **Title**: Prefix "📋", "🚀" or "⏰" + task title
  - **Dates**: Configured based on whether it is a Start Date or Due Date
  - **Notes**: Task description
- The user can **edit all details** (title, exact time, alarms, location) before saving the event.

### 2. **Start Date and Due Date Support**
- Independent buttons for each date:
  - **Start Date**: Small blue button next to the start date.
  - **Due Date**: Small red button next to the due date.
- Small and discreet icons integrated into the interface.

### 3. **Calendar Permissions**
- The application automatically requests calendar permissions when creating an event for the first time.
- If no calendar is configured, the user is alerted.

## Usage

### From the Task Edit Screen

1. Open an existing task or create a new one.
2. Configure a **Start Date** or a **Due Date**.
3. You will see a small calendar icon appear next to the date label (Blue for Start, Red for Due).
4. Press the button.
5. Confirm the action in the dialog box.
6. The calendar app will open with the event details ready to be saved.

## Technical Implementation

### Main Files

- **`src/core/calendar/CalendarService.ts`**: Main service for handling calendar integration (Permissions and Intents).
- **`src/app/task/[id].tsx`**: Task detail screen with calendar buttons.
- **`app.json`**: Calendar permission configuration.

### Translations

The following translation keys are available:

**Spanish (`es.json`):**
- `task.addToCalendar`: "Agregar al Calendario"
- `task.addedToCalendar`: "¡Tarea agregada al calendario!"
- `task.calendarPermissionRequired`: "Se necesita permiso para acceder al calendario"
- `task.noDueDate`: "Esta tarea no tiene fecha de vencimiento"

**English (`en.json`):**
- `task.addToCalendar`: "Add to Calendar"
- `task.addedToCalendar`: "Task added to calendar!"
- `task.calendarPermissionRequired`: "Calendar permission is required"
- `task.noDueDate`: "This task has no due date"

## Dependencies

- `expo-calendar`: Expo package for native calendar permissions.
- `expo-intent-launcher`: Used on Android to launch the specific "Insert Event" intent.
- `Linking`: Fallback for iOS.

## Important Notes

1. **Native Intent**: On Android, we use `android.intent.action.INSERT` to ensure the correct calendar app opens with edit capabilities.
2. **One-way Sync**: Synchronization is one-way (App -> Calendar). Modifying the task in GTD Master does not update the calendar event automatically, and vice-versa.
3. **Duplicates**: The feature does not check if the task was already added to the calendar previously.

## Future Improvements

- [ ] Two-way synchronization between GTD Master and the calendar
- [ ] Automatic event updates when the task is modified
- [ ] Removing calendar events when the task is deleted
- [ ] Visual indicator if a task has already been added to the calendar
