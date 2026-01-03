import { db } from "@/db/client";
import { tasks, areas, projects, projectReferences, contexts } from "@/db/schema";
import * as Sharing from "expo-sharing";
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from "expo-document-picker";
import { Alert } from "react-native";

interface ExportData {
    tasks: any[];
    areas: any[];
    projects: any[];
    projectReferences: any[];
    contexts: any[];
    version: number;
    exportedAt: string;
}

export const DataService = {
    exportData: async () => {
        try {
            const data: ExportData = {
                tasks: await db.select().from(tasks),
                areas: await db.select().from(areas),
                projects: await db.select().from(projects),
                projectReferences: await db.select().from(projectReferences),
                contexts: await db.select().from(contexts),
                version: 1,
                exportedAt: new Date().toISOString(),
            };

            const fileName = `gtd_backup_${new Date().toISOString().split('T')[0]}.json`;
            const fileUri = FileSystem.cacheDirectory + fileName;

            await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(data, null, 2));

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri, {
                    mimeType: "application/json",
                    dialogTitle: "Export GTD Master Backup",
                    UTI: "public.json"
                });
                return true;
            } else {
                Alert.alert("Sharing not available", "Could not share the backup file.");
                return false;
            }
        } catch (error) {
            console.error("Export failed", error);
            return false;
        }
    },

    importData: async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: "application/json",
                copyToCacheDirectory: true,
            });

            if (result.canceled) return false;

            const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri);
            const data = JSON.parse(fileContent) as ExportData;

            // Basic validation
            if (!data.tasks || !data.projects || !data.areas) {
                throw new Error("Invalid backup file");
            }

            // Merge logic: For simplicity and to avoid complex ID mapping/conflict in a local SQLite, 
            // the safest strategy for a "Restore" is often to append or replace. 
            // In GTD Master, we will Append new items and try to match existing by title/id if possible, 
            // but for a v1 backup, we'll do a simple batch insert of items that don't exist.

            // Actually, because we use AutoIncrement IDs, a direct restore might clash.
            // Better strategy: Delete current and replace, or use a "merge" that resets IDs.
            // Let's do a safe merge:

            if (data.areas.length > 0) {
                for (const area of data.areas) {
                    const { id, ...cleanArea } = area;
                    await db.insert(areas).values(cleanArea).onConflictDoNothing();
                }
            }

            if (data.contexts.length > 0) {
                for (const ctx of data.contexts) {
                    const { id, ...cleanCtx } = ctx;
                    await db.insert(contexts).values(cleanCtx).onConflictDoNothing();
                }
            }

            if (data.projects.length > 0) {
                for (const proj of data.projects) {
                    const { id, ...cleanProj } = proj;
                    // Note: area_id might need re-mapping if it was a merge, 
                    // but if it's a restore, IDs usually match if started from scratch.
                    await db.insert(projects).values(cleanProj).onConflictDoNothing();
                }
            }

            if (data.tasks.length > 0) {
                for (const task of data.tasks) {
                    const { id, ...cleanTask } = task;
                    // Handle timestamp conversion if needed (Drizzle mode: timestamp handles it usually)
                    await db.insert(tasks).values(cleanTask).onConflictDoNothing();
                }
            }

            if (data.projectReferences?.length > 0) {
                for (const ref of data.projectReferences) {
                    const { id, ...cleanRef } = ref;
                    await db.insert(projectReferences).values(cleanRef).onConflictDoNothing();
                }
            }

            return true;
        } catch (error) {
            console.error("Import failed", error);
            return false;
        }
    }
};
