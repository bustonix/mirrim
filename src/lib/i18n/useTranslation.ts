'use client';

import { useSearchParams } from 'next/navigation';
import frTranslations from './fr.json';
import arTranslations from './ar.json';

type TranslationKeys = keyof typeof frTranslations.common;

const translations = {
    fr: frTranslations,
    ar: arTranslations
};

export function useTranslation() {
    const searchParams = useSearchParams();
    const lang = (searchParams.get('lang') as 'fr' | 'ar') || 'fr';

    const t = (key: TranslationKeys): string => {
        return translations[lang]?.common?.[key] || translations.fr.common[key] || key;
    };

    const isRTL = lang === 'ar';

    return { t, lang, isRTL };
}
