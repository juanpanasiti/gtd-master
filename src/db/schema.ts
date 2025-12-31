import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const tasks = sqliteTable("tasks", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    is_completed: integer("is_completed", { mode: "boolean" }).notNull().default(false),
    project_id: integer("project_id"),
    context_id: integer("context_id"),
    created_at: integer("created_at", { mode: "timestamp" }).notNull().default(new Date()),
});

export const projects = sqliteTable("projects", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    status: text("status", { enum: ["active", "completed", "archived"] }).notNull().default("active"),
    created_at: integer("created_at", { mode: "timestamp" }).notNull().default(new Date()),
});

export const appMigrations = sqliteTable("_app_migrations", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    version: integer("version").notNull(),
});
