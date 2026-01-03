import { db } from "./client";
import { appMigrations } from "./schema";
import { sql } from "drizzle-orm";

const MIGRATIONS = [
  // Version 1
  `
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    is_completed INTEGER DEFAULT 0 NOT NULL,
    project_id INTEGER,
    context_id INTEGER,
    created_at INTEGER NOT NULL
  );
  `,
  // Version 2
  `
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    status TEXT DEFAULT 'active' NOT NULL,
    created_at INTEGER NOT NULL
  );
  `,
  // Version 3
  `
  CREATE TABLE IF NOT EXISTS contexts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    icon TEXT,
    color TEXT
  );
  `,
  // Version 4
  `
  ALTER TABLE tasks ADD COLUMN due_date INTEGER;
  `,
  // Version 5
  `
  ALTER TABLE tasks ADD COLUMN status TEXT DEFAULT 'active' NOT NULL;
  `,
  // Version 6
  `
  ALTER TABLE tasks ADD COLUMN delegate_name TEXT;
  `,
  // Version 7
  `
  ALTER TABLE tasks ADD COLUMN description TEXT;
  `,
  // Version 8
  `
  ALTER TABLE tasks ADD COLUMN start_date INTEGER;
  `,
  // Version 9
  `
  CREATE TABLE IF NOT EXISTS areas (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, color TEXT NOT NULL);
  `,
  // Version 10
  `
  ALTER TABLE projects ADD COLUMN area_id INTEGER;
  `,
  // Version 11
  `
  CREATE TABLE project_references (id INTEGER PRIMARY KEY AUTOINCREMENT, project_id INTEGER NOT NULL, content TEXT NOT NULL, created_at INTEGER NOT NULL);
  `,
  // Version 12
  `ALTER TABLE tasks ADD COLUMN is_recurring INTEGER DEFAULT 0 NOT NULL;`,
  // Version 13
  `ALTER TABLE tasks ADD COLUMN recurrence_type TEXT;`,
  // Version 14
  `ALTER TABLE tasks ADD COLUMN recurrence_interval INTEGER DEFAULT 1;`,
  // Version 15
  `ALTER TABLE tasks ADD COLUMN recurrence_days TEXT;`,
  // Version 16
  `ALTER TABLE tasks ADD COLUMN last_reset_at INTEGER;`,
];

export async function runMigrations() {
  console.log("Checking migrations...");
  try {
    // 1. Create migrations table if not exists
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS _app_migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        version INTEGER NOT NULL
      );
    `);

    // 2. Get current version
    const lastMigration = await db
      .select()
      .from(appMigrations)
      .orderBy(sql`${appMigrations.version} DESC`)
      .limit(1);

    const currentVersion = lastMigration[0]?.version || 0;
    console.log(`Current DB version: ${currentVersion}. Pending: ${MIGRATIONS.length - currentVersion}`);

    // 3. Run pending migrations
    for (let i = currentVersion; i < MIGRATIONS.length; i++) {
      const migrationSql = MIGRATIONS[i];
      const version = i + 1;
      console.log(`Running migration version ${version}...`);

      try {
        await db.transaction(async (tx) => {
          await tx.run(sql.raw(migrationSql));
          await tx.insert(appMigrations).values({ version });
        });
        console.log(`Migration version ${version} successful.`);
      } catch (err: any) {
        // If it's a "duplicate column" or "table already exists" error, we might want to skip it
        // but it's safer to see why it fails.
        if (err.message?.includes("duplicate column name") || err.message?.includes("already exists")) {
          console.warn(`Migration version ${version} warning (might be already applied):`, err.message);
          // Even if it failed because it exists, we should probably mark it as done so we don't get stuck
          await db.insert(appMigrations).values({ version });
        } else {
          throw err;
        }
      }
    }

    console.log("Migrations up to date!");
  } catch (e) {
    console.error("Migration failed:", e);
    throw e;
  }
}
