# AGENTS.md - Project Context & Rules

## 1. Project Overview
This is a **Getting Things Done (GTD) Task Manager** built with **React Native (Expo)**. The app focuses on offline-first functionality, robust data integrity, and strict adherence to GTD methodology (Capture, Clarify, Organize, Reflect, Engage).

## 2. Tech Stack & Tools
* **Framework:** Expo SDK 50+ (Managed Workflow).
* **Language:** TypeScript (Strict Mode).
* **Package Manager:** npm (Do NOT use yarn or pnpm).
* **Navigation:** Expo Router (File-based routing).
* **Styling:** NativeWind v4 (TailwindCSS for React Native).
* **State Management:** Zustand (Global UI state), React Query (optional for future sync).
* **Database:** `expo-sqlite/next` + **Drizzle ORM**.
* **Internationalization:** `i18next` + `react-i18next` (English default, Spanish supported).
* **Forms/Validation:** Zod.

## 3. Architecture & Folder Structure
We follow a **Feature-based Clean Architecture**. Code should be modular and isolated.

```text
src/
├── app/                 # Expo Router routes (presentation layer only)
├── components/          # Shared UI components
│   └── ui/              # Atomic design components (Button, Input, Card) - Themed
├── core/                # Core configurations
│   ├── theme/           # Colors, typography, spacing tokens
│   ├── i18n/            # Translation files (en.json, es.json) & config
│   └── utils/           # Helper functions
├── db/                  # Database Layer
│   ├── client.ts        # SQLite connection export
│   ├── schema.ts        # Drizzle table definitions
│   └── migrations/      # Custom migration logic & SQL files
├── features/            # Feature-Specific Logic (The "Brain")
│   ├── tasks/           # e.g., Task management
│   │   ├── components/  # Components specific to Tasks
│   │   ├── hooks/       # Custom hooks (logic controllers)
│   │   └── services/    # DB queries wrapped in functions
│   ├── projects/
│   └── contexts/
└── store/               # Global stores (Zustand) for UI state (e.g., theme, filters)
```

## 4. Critical Implementation Rules

### A. Database & Migrations
* **ORM:** Always use Drizzle ORM for queries. Avoid raw SQL strings in components.
* **Migrations:** We use a custom **Sequential Migration System**.
    * Migrations are stored as `.sql` files in `src/db/sql`.
    * The app checks `user_version` in the DB on startup.
    * If `user_version` < `current_version`, run missing SQL scripts strictly in order.
    * **Agent Note:** When modifying the schema, always propose a corresponding `.sql` migration file and update the version mapping.

### B. Styling (NativeWind)
* Use utility classes (e.g., `className="bg-white dark:bg-black p-4"`).
* **Dark Mode:** All components MUST support dark mode using the `dark:` prefix or CSS variables defined in `global.css`.
* Avoid `StyleSheet.create` unless absolutely necessary for complex animations.

### C. Internationalization
* Never hardcode strings. Use `t('key')` from `useTranslation`.
* When adding new UI text, update `src/core/i18n/locales/en.json` and `es.json`.

### D. GTD Methodology Constraints
* **Inbox:** Tasks created here have NO Project and NO Context initially.
* **Projects:** Must have a status (Active, On Hold, Completed).
* **Contexts:** Tags like @home, @office, @phone.

## 5. Coding Standards
1.  **Functional Components:** Use strict typing for props (`interface Props { ... }`).
2.  **Aliases:** Use `@/components`, `@/features`, etc., to import files. Do not use relative paths like `../../../`.
3.  **Error Handling:** Wrap DB operations in `try/catch` blocks and use a central error logger (console for now).
4.  **File Naming:** PascalCase for Components (`TaskCard.tsx`), camelCase for hooks/utils (`useTasks.ts`).

## 6. Command Reference
* `npm start`: Run development server.
* `npm run android` / `npm run ios`: Run on simulators.
* `npx drizzle-kit generate:sqlite`: Generate migration snapshots (for reference).
