import { useState, useEffect } from "react";

export interface Translations {
  [key: string]: string | Translations;
}

export type Language = "en" | "de";

const translations: Record<Language, Translations> = {
  en: {},
  de: {},
};

// Load translations dynamically
const loadTranslations = async (language: Language): Promise<Translations> => {
  try {
    const response = await fetch(`/src/locales/${language}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load ${language} translations`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error loading ${language} translations:`, error);
    return {};
  }
};

// Initialize translations
const initializeTranslations = async () => {
  translations.en = await loadTranslations("en");
  translations.de = await loadTranslations("de");
};

// Initialize on module load
initializeTranslations();

export function useTranslation() {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return (saved as Language) || "en";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const t = (key: string, interpolations?: Record<string, string | number>): string => {
    const keys = key.split(".");
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }
    
    if (typeof value !== "string") {
      // Fallback to English if key not found
      value = translations.en;
      for (const k of keys) {
        value = value?.[k];
        if (value === undefined) break;
      }
    }
    
    if (typeof value !== "string") {
      return key; // Return key if translation not found
    }
    
    // Handle interpolations
    if (interpolations) {
      return value.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return interpolations[key]?.toString() || match;
      });
    }
    
    return value;
  };

  const changeLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
  };

  return {
    t,
    language,
    changeLanguage,
    isReady: Object.keys(translations.en).length > 0,
  };
}

export default useTranslation;
