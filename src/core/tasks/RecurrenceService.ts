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

    static getNextResetDate(task: any, now: Date = new Date()): Date | null {
        if (!task.is_recurring) return null;

        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        // We iterate forward day by day until shouldResetTask returns true
        // and it's in the future. 
        // Limit search to 365 days to avoid infinite loops
        const searchDate = new Date(tomorrow);
        for (let i = 0; i < 366; i++) {
            // We use shouldResetTask but we need to bypass the is_completed check
            if (this.willResetOn(task, searchDate)) {
                if (task.recurrence_time) {
                    const [hours, minutes] = task.recurrence_time.split(':').map(Number);
                    searchDate.setHours(hours, minutes, 0, 0);
                }
                return searchDate;
            }
            searchDate.setDate(searchDate.getDate() + 1);
            searchDate.setHours(0, 0, 0, 0);
        }

        return null;
    }

    private static willResetOn(task: any, targetDate: Date): boolean {
        const createdAt = new Date(task.created_at);
        const dayStart = new Date(targetDate);
        dayStart.setHours(0, 0, 0, 0);

        switch (task.recurrence_type) {
            case "daily":
                return this.checkDaily(task, dayStart, createdAt, null);
            case "weekly":
                return this.checkWeekly(task, dayStart, targetDate, null);
            case "monthly":
                return this.checkMonthly(task, dayStart, targetDate, null);
            default:
                return false;
        }
    }

    private static checkDaily(task: any, todayStart: Date, createdAt: Date, lastReset: Date | null): boolean {
        const interval = task.recurrence_interval || 1;
        if (interval === 1) return true; // Every day

        const anchor = new Date(createdAt);
        anchor.setHours(0, 0, 0, 0);

        const diffTime = todayStart.getTime() - anchor.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        return diffDays % interval === 0;
    }

    private static checkWeekly(task: any, todayStart: Date, now: Date, lastReset: Date | null): boolean {
        if (!task.recurrence_days) return false;

        const targetDays = task.recurrence_days.split(",").map(Number);
        const currentDay = now.getDay();

        return targetDays.includes(currentDay);
    }

    private static checkMonthly(task: any, todayStart: Date, now: Date, lastReset: Date | null): boolean {
        const interval = task.recurrence_interval || 1;
        const targetDay = task.recurrence_day_of_month || new Date(task.created_at).getDate();
        const currentDayOfMonth = now.getDate();

        // Check if it's the correct day of the month
        if (currentDayOfMonth !== targetDay) return false;

        // Check interval (months since creation)
        const anchor = new Date(task.created_at);
        const monthsDiff = (now.getFullYear() - anchor.getFullYear()) * 12 + (now.getMonth() - anchor.getMonth());

        return monthsDiff % interval === 0;
    }
}
