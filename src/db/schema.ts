import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const tasks = sqliteTable("tasks", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    is_completed: integer("is_completed", { mode: "boolean" }).notNull().default(false),
    project_id: integer("project_id"),
    context_id: integer("context_id"),
    due_date: integer("due_date", { mode: "timestamp" }),
    status: text("status", { enum: ["active", "someday", "waiting"] }).notNull().default("active"),
    delegate_name: text("delegate_name"),
    description: text("description"),
    start_date: integer("start_date", { mode: "timestamp" }),
    is_recurring: integer("is_recurring", { mode: "boolean" }).notNull().default(false),
    recurrence_type: text("recurrence_type"), // daily, weekly, monthly
    recurrence_interval: integer("recurrence_interval").default(1),
    recurrence_days: text("recurrence_days"), // comma-separated days for weekly
    recurrence_time: text("recurrence_time"), // HH:mm format
    recurrence_day_of_month: integer("recurrence_day_of_month"),
    last_reset_at: integer("last_reset_at", { mode: "timestamp" }),
    sort_order: integer("sort_order").default(0),
    created_at: integer("created_at", { mode: "timestamp" }).notNull().default(new Date()),
});

export const areas = sqliteTable("areas", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    color: text("color").notNull(),
});

export const projects = sqliteTable("projects", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    status: text("status", { enum: ["active", "completed", "archived"] }).notNull().default("active"),
    area_id: integer("area_id"),
    sort_order: integer("sort_order").default(0),
    created_at: integer("created_at", { mode: "timestamp" }).notNull().default(new Date()),
});

export const projectReferences = sqliteTable("project_references", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    project_id: integer("project_id").notNull(),
    content: text("content").notNull(),
    created_at: integer("created_at", { mode: "timestamp" }).notNull().default(new Date()),
});

export const contexts = sqliteTable("contexts", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    icon: text("icon"),
    color: text("color"),
});

export const appMigrations = sqliteTable("_app_migrations", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    version: integer("version").notNull(),
});
