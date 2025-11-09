import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ptAO } from './locales/pt-AO';
import { ptPT } from './locales/pt-PT';
import { en } from './locales/en';

export type Locale = 'pt-AO' | 'pt-PT' | 'en';

export type Translations = typeof ptAO;

type I18nContextType = {
  locale: Locale;
  t: Translations;
  setLocale: (locale: Locale) => void;
  formatCurrency: (value: number) => string;
  formatDate: (date: Date | string) => string;
};

const translations: Record<Locale, Translations> = {
  'pt-AO': ptAO,
  'pt-PT': ptPT,
  'en': en,
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

type I18nProviderProps = {
  children: ReactNode;
};

export function I18nProvider({ children }: I18nProviderProps) {
  // Carregar idioma do localStorage ou usar padrão
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = localStorage.getItem('kzstore_locale');
    return (saved as Locale) || 'pt-AO';
  });

  // Salvar idioma no localStorage quando mudar
  useEffect(() => {
    localStorage.setItem('kzstore_locale', locale);
    // Atualizar atributo lang do HTML
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
  };

  // Função para formatar moeda
  const formatCurrency = (value: number): string => {
    return `${value.toLocaleString(locale.replace('-', ''), {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })} AOA`;
  };

  // Função para formatar data
  const formatDate = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString(locale.replace('-', ''), {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const value: I18nContextType = {
    locale,
    t: translations[locale],
    setLocale,
    formatCurrency,
    formatDate,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

// Hook personalizado para usar i18n
export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

// Tipos auxiliares para garantir type-safety
export type TranslationKey = keyof Translations;
export type NestedTranslationKey<T> = T extends object
  ? { [K in keyof T]: K extends string ? K | `${K}.${NestedTranslationKey<T[K]>}` : never }[keyof T]
  : never;
