import { create } from "zustand";
import { db } from "@/db/client";
import { tasks, contexts } from "@/db/schema";
import { eq, desc, and, inArray } from "drizzle-orm";
import * as Haptics from "expo-haptics";
import * as NotificationService from "@/core/notifications/NotificationService";

export interface Task {
    id: number;
    title: string;
    is_completed: boolean;
    project_id: number | null;
    context_id: number | null;
    due_date: Date | null;
    status: "active" | "someday" | "waiting";
    delegate_name: string | null;
    description: string | null;
    start_date: Date | null;
    is_recurring: boolean;
    recurrence_type: "daily" | "weekly" | "monthly" | null;
    recurrence_interval: number;
    recurrence_days: string | null;
    recurrence_time: string | null;
    recurrence_day_of_month: number | null;
    last_reset_at: Date | null;
    sort_order: number;
    created_at: Date;
}

interface Context {
    id: number;
    title: string;
    icon: string | null;
    color: string | null;
}

interface TasksState {
    tasks: Task[];
    contexts: Context[];
    loadTasks: () => Promise<void>;
    loadContexts: () => Promise<void>;
    addTask: (title: string, due_date?: Date | null, project_id?: number | null) => Promise<void>;
    addContext: (title: string, icon?: string, color?: string) => Promise<void>;
    updateContext: (id: number, updates: Partial<Context>) => Promise<void>;
    deleteContext: (id: number) => Promise<void>;
    toggleTask: (id: number, currentStatus: boolean) => Promise<void>;
    updateTask: (id: number, updates: Partial<Task>) => Promise<void>;
    deleteTask: (id: number) => Promise<void>;
    getTodayBriefing: () => { dueCount: number, startCount: number };
    processRecurrenceResets: () => Promise<void>;
    resetProjectRecurringTasks: (projectId: number) => Promise<void>;
    updateTasksOrder: (taskOrders: { id: number, sort_order: number }[]) => Promise<void>;
}

export const useTasks = create<TasksState>((set, get) => ({
    tasks: [],
    contexts: [],
    loadTasks: async () => {
        try {
            const allTasks = await db.select().from(tasks).orderBy(tasks.sort_order, desc(tasks.created_at));
            // @ts-ignore
            set({ tasks: allTasks });
        } catch (error) {
            console.error("Failed to load tasks", error);
        }
    },
    loadContexts: async () => {
        try {
            const allContexts = await db.select().from(contexts);
            // @ts-ignore
            set({ contexts: allContexts });
        } catch (error) {
            console.error("Failed to load contexts", error);
        }
    },
    addTask: async (title: string, due_date = null, project_id = null) => {
        try {
            if (!title.trim()) return;
            const maxOrder = get().tasks.reduce((max, t) => Math.max(max, t.sort_order || 0), 0);
            await db.insert(tasks).values({
                title,
                created_at: new Date(),
                due_date,
                project_id,
                sort_order: maxOrder + 1
            });
            await get().loadTasks();
        } catch (error) {
            console.error("Failed to add task", error);
        }
    },
    addContext: async (title: string, icon = "tag", color = "#6b7280") => {
        try {
            if (!title.trim()) return;
            await db.insert(contexts).values({ title, icon, color });
            await get().loadContexts();
        } catch (error) {
            console.error("Failed to add context", error);
        }
    },
    updateContext: async (id: number, updates: Partial<Context>) => {
        try {
            await db.update(contexts).set(updates).where(eq(contexts.id, id));
            await get().loadContexts();
        } catch (error) {
            console.error("Failed to update context", error);
        }
    },
    deleteContext: async (id: number) => {
        try {
            await db.delete(contexts).where(eq(contexts.id, id));
            await get().loadContexts();
        } catch (error) {
            console.error("Failed to delete context", error);
        }
    },
    toggleTask: async (id: number, currentStatus: boolean) => {
        try {
            const newStatus = !currentStatus;
            await db.update(tasks).set({ is_completed: newStatus }).where(eq(tasks.id, id));
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            await get().loadTasks();

            // Handle notifications
            const task = get().tasks.find(t => t.id === id);
            if (task?.is_recurring) {
                if (newStatus) {
                    await NotificationService.scheduleRecurrenceReminder(task);
                } else {
                    await NotificationService.cancelRecurrenceReminder(id);
                }
            }
        } catch (error) {
            console.error("Failed to update task status", error);
        }
    },
    updateTask: async (id: number, updates: Partial<Task>) => {
        try {
            await db.update(tasks).set(updates).where(eq(tasks.id, id));
            await get().loadTasks();
        } catch (error) {
            console.error("Failed to update task", error);
        }
    },
    deleteTask: async (id: number) => {
        try {
            await NotificationService.cancelRecurrenceReminder(id);
            await db.delete(tasks).where(eq(tasks.id, id));
            await get().loadTasks();
        } catch (error) {
            console.error("Failed to delete task", error);
        }
    },
    getTodayBriefing: () => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);

        const tasksList = get().tasks;
        const dueCount = tasksList.filter(t =>
            !t.is_completed &&
            t.due_date &&
            new Date(t.due_date) <= endOfDay
        ).length;

        const startCount = tasksList.filter(t =>
            !t.is_completed &&
            t.start_date &&
            new Date(t.start_date) >= now &&
            new Date(t.start_date) <= endOfDay
        ).length;

        return { dueCount, startCount };
    },
    processRecurrenceResets: async () => {
        console.log("[DEBUG] processRecurrenceResets: Starting check...");
        const { tasks: allTasks, updateTask } = get();
        const now = new Date();

        // Dynamic import to avoid circular dependencies if any
        const { RecurrenceService } = await import("@/core/tasks/RecurrenceService");

        let resetCount = 0;
        for (const task of allTasks) {
            if (task.is_recurring && task.is_completed) {
                const shouldReset = RecurrenceService.shouldResetTask(task, now);
                console.log(`[DEBUG] Task ${task.id} (${task.title}): is_recurring=true, is_completed=true. Should reset? ${shouldReset}`);

                if (shouldReset) {
                    const shouldClearDueDate = task.due_date && new Date(task.due_date) < now;
                    await updateTask(task.id, {
                        is_completed: false,
                        last_reset_at: now,
                        due_date: shouldClearDueDate ? null : task.due_date
                    });
                    resetCount++;
                    console.log(`[DEBUG] Task ${task.id} reset successfully.`);
                }
            }
        }
        console.log(`[DEBUG] processRecurrenceResets: Check complete. Reset ${resetCount} tasks.`);
    },
    resetProjectRecurringTasks: async (projectId: number) => {
        console.log(`[DEBUG] resetProjectRecurringTasks called for projectId: ${projectId}`);
        try {
            const now = new Date();
            const state = get();

            // Find exactly the tasks we want to reset based on current state
            const tasksToReset = state.tasks.filter(
                t => t.project_id === projectId && t.is_recurring
            );

            console.log(`[DEBUG] Found ${tasksToReset.length} recurring tasks in project`);

            if (tasksToReset.length === 0) {
                console.log("[DEBUG] No recurring tasks found to reset.");
                return;
            }

            const ids = tasksToReset.map(t => t.id);
            console.log(`[DEBUG] Resetting task IDs: ${ids.join(", ")}`);

            // Use Promise.all with individual ID updates to be 100% precise
            await Promise.all(tasksToReset.map(task => {
                const shouldClearDueDate = task.due_date && new Date(task.due_date) < now;
                return db.update(tasks)
                    .set({
                        is_completed: false,
                        last_reset_at: now,
                        due_date: shouldClearDueDate ? null : task.due_date
                    })
                    .where(eq(tasks.id, task.id));
            }));

            console.log("[DEBUG] DB Update complete, reloading tasks... Rose scheduling notifications...");

            // Cancel any pending notifications for these tasks since they are manualy reset
            await Promise.all(tasksToReset.map(t => NotificationService.cancelRecurrenceReminder(t.id)));

            await state.loadTasks();
            console.log("[DEBUG] State reloaded successfully");
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error) {
            console.error("[DEBUG] Failed to reset project tasks", error);
        }
    },
    updateTasksOrder: async (taskOrders: { id: number, sort_order: number }[]) => {
        try {
            await Promise.all(taskOrders.map(to =>
                db.update(tasks).set({ sort_order: to.sort_order }).where(eq(tasks.id, to.id))
            ));
            await get().loadTasks();
        } catch (error) {
            console.error("Failed to update tasks order", error);
        }
    }
}));
