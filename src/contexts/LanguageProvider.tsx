
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";

type Language = "es" | "en";

type LanguageProviderProps = {
  children: ReactNode;
  defaultLanguage?: Language;
  storageKey?: string;
};

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
};

const initialState: LanguageContextType = {
  language: "en",
  setLanguage: () => null,
  t: (key: string) => key,
};

const LanguageContext = createContext<LanguageContextType>(initialState);

export function LanguageProvider({
  children,
  defaultLanguage = "en",
  storageKey = "app-language",
}: LanguageProviderProps) {
  const { toast } = useToast();
  const [language, setLanguage] = useState<Language>(
    () => (localStorage.getItem(storageKey) as Language) || defaultLanguage
  );
  const [translations, setTranslations] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const translationsModule = await import(`../translations/${language}.json`);
        setTranslations(translationsModule.default);
      } catch (error) {
        console.error("Failed to load translations:", error);
        setTranslations({});
      }
    };

    loadTranslations();
    document.documentElement.setAttribute("lang", language);
  }, [language]);

  const t = (key: string): string => {
    return translations[key] || key;
  };

  const handleSetLanguage = (newLanguage: Language) => {
    localStorage.setItem(storageKey, newLanguage);
    setLanguage(newLanguage);
    
    const languageName = newLanguage === 'en' ? 'English' : 'Español';
    toast({
      title: newLanguage === 'en' ? 'Language changed' : 'Idioma cambiado',
      description: newLanguage === 'en' ? 
        `Language set to ${languageName}` : 
        `Idioma cambiado a ${languageName}`,
    });
  };

  return (
    <LanguageContext.Provider 
      value={{ 
        language, 
        setLanguage: handleSetLanguage, 
        t 
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  
  return context;
};
