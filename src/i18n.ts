import Vue from "vue";
import VueI18n from "vue-i18n";
import ru from "@/locales/ru.json";
import en from "@/locales/en.json";

Vue.use(VueI18n);

const messages: VueI18n.LocaleMessages = {
  ru: ru as unknown as VueI18n.LocaleMessageObject,
  en: en as unknown as VueI18n.LocaleMessageObject,
};
const fallbackLocale = "en";
const saved = localStorage.getItem("locale");
const locale = saved && ["ru", "en"].includes(saved) ? saved : "ru";

const i18n = new VueI18n({
  locale,
  fallbackLocale,
  messages,
  silentTranslationWarn: true,
});

document.documentElement.setAttribute("lang", locale);

export function setLocale(next: "ru" | "en") {
  i18n.locale = next;
  localStorage.setItem("locale", next);
  document.documentElement.setAttribute("lang", next);
}

export default i18n;
