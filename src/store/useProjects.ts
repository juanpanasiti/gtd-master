import { create } from "zustand";
import { db } from "@/db/client";
import { projects } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

interface Project {
    id: number;
    title: string;
    status: "active" | "completed" | "archived";
    created_at: Date;
}

interface ProjectsState {
    projects: Project[];
    loadProjects: () => Promise<void>;
    addProject: (title: string) => Promise<number | undefined>;
    updateProjectStatus: (id: number, status: Project["status"]) => Promise<void>;
}

export const useProjects = create<ProjectsState>((set, get) => ({
    projects: [],
    loadProjects: async () => {
        try {
            const allProjects = await db.select().from(projects).orderBy(desc(projects.created_at));
            // @ts-ignore
            set({ projects: allProjects });
        } catch (error) {
            console.error("Failed to load projects", error);
        }
    },
    addProject: async (title: string) => {
        try {
            if (!title.trim()) return;
            const result = await db.insert(projects).values({
                title,
                created_at: new Date()
            }).returning({ insertedId: projects.id });

            await get().loadProjects();
            return result[0]?.insertedId;
        } catch (error) {
            console.error("Failed to add project", error);
        }
    },
    updateProjectStatus: async (id: number, status) => {
        try {
            await db.update(projects)
                .set({ status })
                .where(eq(projects.id, id));

            set({
                projects: get().projects.map(p =>
                    p.id === id ? { ...p, status } : p
                )
            });
        } catch (error) {
            console.error("Failed to update project", error);
        }
    }
}));
