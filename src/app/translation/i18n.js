import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import { TRANSLATIONS_EN } from "./en/translations";
import { TRANSLATIONS_ES } from "./es/translations";

const resources = {
  en: {
    translation: TRANSLATIONS_EN
    },
  es: {
    translation: TRANSLATIONS_ES
  },
};

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    debug: false,
    lng: "es",
    supportedLngs: ["en","es"],
    interpolation: {
      escapeValue: false,
    },
  });

export default i18next;