import { create } from "zustand";
import { db } from "@/db/client";
import { tasks, contexts } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

interface Task {
    id: number;
    title: string;
    is_completed: boolean;
    project_id: number | null;
    context_id: number | null;
    due_date: Date | null;
    status: "active" | "someday" | "waiting";
    delegate_name: string | null;
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
}

export const useTasks = create<TasksState>((set, get) => ({
    tasks: [],
    contexts: [],
    loadTasks: async () => {
        try {
            const allTasks = await db.select().from(tasks).orderBy(desc(tasks.created_at));
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
            await db.insert(tasks).values({
                title,
                created_at: new Date(),
                due_date,
                project_id
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
            await db.update(tasks)
                .set({ is_completed: !currentStatus })
                .where(eq(tasks.id, id));

            set({
                tasks: get().tasks.map(t =>
                    t.id === id ? { ...t, is_completed: !currentStatus } : t
                )
            });
        } catch (error) {
            console.error("Failed to toggle task", error);
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
            await db.delete(tasks).where(eq(tasks.id, id));
            // Optimistic update
            set({
                tasks: get().tasks.filter(t => t.id !== id)
            });
        } catch (error) {
            console.error("Failed to delete task", error);
        }
    }
}));
