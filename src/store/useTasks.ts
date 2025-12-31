import { create } from "zustand";
import { db } from "@/db/client";
import { tasks } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

interface Task {
    id: number;
    title: string;
    is_completed: boolean;
    project_id: number | null;
    context_id: number | null;
    created_at: Date;
}

interface TasksState {
    tasks: Task[];
    loadTasks: () => Promise<void>;
    addTask: (title: string) => Promise<void>;
    toggleTask: (id: number, currentStatus: boolean) => Promise<void>;
}

export const useTasks = create<TasksState>((set, get) => ({
    tasks: [],
    loadTasks: async () => {
        try {
            const allTasks = await db.select().from(tasks).orderBy(desc(tasks.created_at));
            set({ tasks: allTasks });
        } catch (error) {
            console.error("Failed to load tasks", error);
        }
    },
    addTask: async (title: string) => {
        try {
            if (!title.trim()) return;
            await db.insert(tasks).values({
                title,
                created_at: new Date()
            });
            await get().loadTasks();
        } catch (error) {
            console.error("Failed to add task", error);
        }
    },
    toggleTask: async (id: number, currentStatus: boolean) => {
        try {
            await db.update(tasks)
                .set({ is_completed: !currentStatus })
                .where(eq(tasks.id, id));

            // Update local state optimistically or reload
            // Optimization: Update local state directly
            set({
                tasks: get().tasks.map(t =>
                    t.id === id ? { ...t, is_completed: !currentStatus } : t
                )
            });
        } catch (error) {
            console.error("Failed to toggle task", error);
        }
    }
}));
