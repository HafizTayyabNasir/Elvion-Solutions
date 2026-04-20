import en from "./en";
import ar from "./ar";
import ur from "./ur";
import es from "./es";
import fr from "./fr";
import de from "./de";
import zh from "./zh";

export type Language = "en" | "ar" | "ur" | "es" | "fr" | "de" | "zh";

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  dir: "ltr" | "rtl";
}

export const languages: LanguageOption[] = [
  { code: "en", name: "English", nativeName: "English", dir: "ltr" },
  { code: "ar", name: "Arabic", nativeName: "العربية", dir: "rtl" },
  { code: "ur", name: "Urdu", nativeName: "اردو", dir: "rtl" },
  { code: "es", name: "Spanish", nativeName: "Español", dir: "ltr" },
  { code: "fr", name: "French", nativeName: "Français", dir: "ltr" },
  { code: "de", name: "German", nativeName: "Deutsch", dir: "ltr" },
  { code: "zh", name: "Chinese", nativeName: "中文", dir: "ltr" },
];

export const translations: Record<Language, Record<string, string>> = {
  en,
  ar,
  ur,
  es,
  fr,
  de,
  zh,
};
