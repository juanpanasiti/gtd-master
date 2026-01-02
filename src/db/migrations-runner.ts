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
];

export async function runMigrations() {
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

    // 3. Run pending migrations
    for (let i = currentVersion; i < MIGRATIONS.length; i++) {
      const migrationSql = MIGRATIONS[i];
      console.log(`Running migration version ${i + 1}...`);

      await db.transaction(async (tx) => {
        await tx.run(sql.raw(migrationSql));
        await tx.insert(appMigrations).values({ version: i + 1 });
      });
    }

    console.log("Migrations up to date!");
  } catch (e) {
    console.error("Migration failed:", e);
    throw e;
  }
}
