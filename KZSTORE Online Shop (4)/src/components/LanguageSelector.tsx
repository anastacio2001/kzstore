import { useState, useRef, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import { useI18n, Locale } from '../i18n/I18nContext';

export function LanguageSelector() {
  const { locale, setLocale, t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages: { code: Locale; name: string; flag: string }[] = [
    { code: 'pt-AO', name: 'Português (Angola)', flag: '🇦🇴' },
    { code: 'pt-PT', name: 'Português (Portugal)', flag: '🇵🇹' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
  ];

  const currentLanguage = languages.find((lang) => lang.code === locale);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLanguageChange = (newLocale: Locale) => {
    setLocale(newLocale);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label={t.common.selectLanguage}
      >
        <Globe className="size-5" />
        <span className="hidden sm:inline text-sm font-medium">
          {currentLanguage?.flag} {currentLanguage?.name.split(' ')[0]}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-2xl border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {t.common.selectLanguage}
            </p>
          </div>
          
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                locale === lang.code ? 'bg-red-50' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{lang.flag}</span>
                <span className={`text-sm font-medium ${
                  locale === lang.code ? 'text-red-600' : 'text-gray-700'
                }`}>
                  {lang.name}
                </span>
              </div>
              
              {locale === lang.code && (
                <Check className="size-5 text-red-600" />
              )}
            </button>
          ))}
          
          <div className="px-4 py-2 mt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              💡 {locale === 'en' ? 'Language is saved automatically' : 'O idioma é guardado automaticamente'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
