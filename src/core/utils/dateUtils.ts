import { TFunction } from "i18next";

export const getRelativeTimeUntil = (targetDate: Date, t: TFunction): string => {
    const now = new Date();
    const diffMs = targetDate.getTime() - now.getTime();

    if (diffMs <= 0) return "";

    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
        return diffDays === 1
            ? t("common.relative.oneDay")
            : t("common.relative.days", { count: diffDays });
    }

    if (diffHours > 0) {
        return diffHours === 1
            ? t("common.relative.oneHour")
            : t("common.relative.hours", { count: diffHours });
    }

    if (diffMins > 0) {
        return diffMins === 1
            ? t("common.relative.oneMinute")
            : t("common.relative.minutes", { count: diffMins });
    }

    return t("common.relative.lessThanMinute");
};
