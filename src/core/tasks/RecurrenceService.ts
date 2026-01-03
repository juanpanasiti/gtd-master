import { Task } from "@/store/useTasks";

export class RecurrenceService {
    /**
     * Determines if a completed recurring task should be reset (marked as incomplete).
     * Resets happen at 00:00 based on the recurrence rules.
     */
    static shouldResetTask(task: any, now: Date = new Date()): boolean {
        if (!task.is_recurring || !task.is_completed) return false;

        const lastReset = task.last_reset_at ? new Date(task.last_reset_at) : null;
        const createdAt = new Date(task.created_at);

        // Start of today (00:00:00)
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);

        // If it was already reset today, we don't reset again
        if (lastReset && lastReset >= todayStart) {
            return false;
        }

        // Logic by recurrence type
        switch (task.recurrence_type) {
            case "daily":
                return this.checkDaily(task, todayStart, createdAt, lastReset);
            case "weekly":
                return this.checkWeekly(task, todayStart, now, lastReset);
            case "monthly":
                return this.checkMonthly(task, todayStart, now, lastReset);
            default:
                return false;
        }
    }

    private static checkDaily(task: any, todayStart: Date, createdAt: Date, lastReset: Date | null): boolean {
        const interval = task.recurrence_interval || 1;
        if (interval === 1) return true; // Every day

        // For intervals > 1, we calculate days since creation or a fixed point
        // Using createdAt as the anchor
        const anchor = new Date(createdAt);
        anchor.setHours(0, 0, 0, 0);

        const diffTime = todayStart.getTime() - anchor.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        return diffDays % interval === 0;
    }

    private static checkWeekly(task: any, todayStart: Date, now: Date, lastReset: Date | null): boolean {
        // recurrence_days is a comma-separated string of day numbers (0-6, where 0 is Sunday)
        if (!task.recurrence_days) return false;

        const targetDays = task.recurrence_days.split(",").map(Number);
        const currentDay = now.getDay();

        return targetDays.includes(currentDay);
    }

    private static checkMonthly(task: any, todayStart: Date, now: Date, lastReset: Date | null): boolean {
        // Simple version: same day of month
        const anchorDate = new Date(task.created_at).getDate();
        const currentDayOfMonth = now.getDate();

        return currentDayOfMonth === anchorDate;
    }
}
