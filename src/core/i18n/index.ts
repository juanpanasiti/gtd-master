import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";

import en from "./locales/en.json";
import es from "./locales/es.json";

const resources = {
    en: { translation: en },
    es: { translation: es },
};

// Get device locale
const deviceLocale = Localization.getLocales()[0]?.languageCode || "en";

i18n.use(initReactI18next).init({
    resources,
    lng: deviceLocale === "es" ? "es" : "en",
    fallbackLng: "en",
    interpolation: {
        escapeValue: false,
    },
    compatibilityJSON: "v4",
});

export default i18n;

// Helper to change language programmatically
export const changeLanguage = (lang: "en" | "es" | "system") => {
    if (lang === "system") {
        const systemLang = Localization.getLocales()[0]?.languageCode || "en";
        i18n.changeLanguage(systemLang === "es" ? "es" : "en");
    } else {
        i18n.changeLanguage(lang);
    }
};
