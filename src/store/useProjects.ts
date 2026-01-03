import { create } from "zustand";
import { db } from "@/db/client";
import { areas, projects, projectReferences } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export interface Area {
    id: number;
    title: string;
    color: string;
}

export interface ProjectReference {
    id: number;
    project_id: number;
    content: string;
    created_at: Date;
}

export interface Project {
    id: number;
    title: string;
    status: "active" | "completed" | "archived";
    area_id: number | null;
    created_at: Date;
}

interface ProjectsState {
    projects: Project[];
    areas: Area[];
    references: Record<number, ProjectReference[]>;
    loadProjects: () => Promise<void>;
    addProject: (title: string, area_id?: number | null) => Promise<number | undefined>;
    updateProject: (id: number, updates: Partial<Project>) => Promise<void>;
    deleteProject: (id: number) => Promise<void>;
    updateProjectStatus: (id: number, status: Project["status"]) => Promise<void>;

    // Area Actions
    loadAreas: () => Promise<void>;
    addArea: (title: string, color: string) => Promise<void>;
    deleteArea: (id: number) => Promise<void>;

    // Reference Actions
    loadReferences: (projectId: number) => Promise<void>;
    loadAllReferences: () => Promise<void>;
    addReference: (projectId: number, content: string) => Promise<void>;
    deleteReference: (id: number, projectId: number) => Promise<void>;
}

export const useProjects = create<ProjectsState>((set, get) => ({
    projects: [],
    areas: [],
    references: {},
    loadProjects: async () => {
        try {
            const allProjects = await db.select().from(projects).orderBy(desc(projects.created_at));
            // @ts-ignore
            set({ projects: allProjects });
        } catch (error) {
            console.error("Failed to load projects", error);
        }
    },
    addProject: async (title, area_id = null) => {
        try {
            if (!title.trim()) return;
            const result = await db.insert(projects).values({
                title,
                area_id,
                created_at: new Date()
            }).returning({ insertedId: projects.id });

            await get().loadProjects();
            return result[0]?.insertedId;
        } catch (error) {
            console.error("Failed to add project", error);
        }
    },
    updateProject: async (id: number, updates: Partial<Project>) => {
        try {
            await db.update(projects).set(updates).where(eq(projects.id, id));
            await get().loadProjects();
        } catch (error) {
            console.error("Failed to update project", error);
        }
    },
    deleteProject: async (id: number) => {
        try {
            await db.delete(projects).where(eq(projects.id, id));
            await get().loadProjects();
        } catch (error) {
            console.error("Failed to delete project", error);
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
    },

    loadAreas: async () => {
        try {
            const allAreas = await db.select().from(areas).orderBy(desc(areas.id));
            // @ts-ignore
            set({ areas: allAreas });
        } catch (error) {
            console.error("Failed to load areas", error);
        }
    },
    addArea: async (title, color) => {
        try {
            await db.insert(areas).values({ title, color });
            await get().loadAreas();
        } catch (error) {
            console.error("Failed to add area", error);
        }
    },
    deleteArea: async (id) => {
        try {
            await db.delete(areas).where(eq(areas.id, id));
            await get().loadAreas();
        } catch (error) {
            console.error("Failed to delete area", error);
        }
    },

    loadReferences: async (projectId) => {
        try {
            const allRefs = await db.select().from(projectReferences)
                .where(eq(projectReferences.project_id, projectId))
                .orderBy(desc(projectReferences.created_at));

            set({
                references: {
                    ...get().references,
                    [projectId]: allRefs as unknown as ProjectReference[]
                }
            });
        } catch (error) {
            console.error("Failed to load references", error);
        }
    },
    loadAllReferences: async () => {
        try {
            const allRefs = await db.select().from(projectReferences).orderBy(desc(projectReferences.created_at));
            // Group by project_id for the existing store structure
            const grouped = allRefs.reduce((acc, ref) => {
                if (!acc[ref.project_id]) acc[ref.project_id] = [];
                // @ts-ignore
                acc[ref.project_id].push(ref);
                return acc;
            }, {} as Record<number, ProjectReference[]>);

            set({ references: grouped });
        } catch (error) {
            console.error("Failed to load all references", error);
        }
    },
    addReference: async (projectId, content) => {
        try {
            await db.insert(projectReferences).values({
                project_id: projectId,
                content,
                created_at: new Date()
            });
            await get().loadReferences(projectId);
        } catch (error) {
            console.error("Failed to add reference", error);
        }
    },
    deleteReference: async (id, projectId) => {
        try {
            await db.delete(projectReferences).where(eq(projectReferences.id, id));
            await get().loadReferences(projectId);
        } catch (error) {
            console.error("Failed to delete reference", error);
        }
    }
}));
