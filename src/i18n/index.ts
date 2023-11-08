// Source : https://react.i18next.com/latest/using-with-hooks

import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import commonEnglish from "./locales/en/common.json";
import transEnglish from "./locales/en/translation.json";

import commonFrench from "./locales/fr/common.json";
import transFrench from "./locales/fr/translation.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    debug: true,
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        translation: transEnglish,
        common: commonEnglish,
      },
      fr: {
        translation: transFrench,
        common: commonFrench,
      },
    },
  });

export default i18n;
