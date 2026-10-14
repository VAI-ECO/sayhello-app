import { I18n } from "i18n-js";
import { getLocales } from "expo-localization";

import ar from "../locales/ar/translation.json";
import bn from "../locales/bn/translation.json";
import de from "../locales/de/translation.json";
import en from "../locales/en/translation.json";
import fr from "../locales/fr/translation.json";
import ha from "../locales/ha/translation.json";
import hi from "../locales/hi/translation.json";
import id from "../locales/id/translation.json";
import ja from "../locales/ja/translation.json";
import ko from "../locales/ko/translation.json";
import mr from "../locales/mr/translation.json";
import pt from "../locales/pt/translation.json";
import ru from "../locales/ru/translation.json";
import ta from "../locales/ta/translation.json";
import te from "../locales/te/translation.json";
import tr from "../locales/tr/translation.json";
import ur from "../locales/ur/translation.json";
import vi from "../locales/vi/translation.json";
import zh from "../locales/zh/translation.json";
import es from "../locales/es/translation.json";

const translations = {
  ar, bn, de, en, fr, ha, hi, id, ja, ko,
  mr, pt, ru, ta, te, tr, ur, vi, zh, es,
};

const i18n = new I18n(translations);

i18n.locale = getLocales()[0]?.languageCode || "en";
i18n.enableFallback = true;

export default i18n;
