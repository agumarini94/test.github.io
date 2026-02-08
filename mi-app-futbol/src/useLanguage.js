import { useState, useMemo } from 'react';
import { texts, getSaved } from './helpers';

export const useLanguage = () => {
    // Inicializa con el idioma guardado o español por defecto
    const [lang, setLang] = useState(() => getSaved('lang', 'es'));

    const changeLanguage = (newLang) => {
        setLang(newLang);
        localStorage.setItem('lang', JSON.stringify(newLang));
    };

    // Genera el objeto de textos actual
    const t = useMemo(() => {
        const base = texts['es'] || {};
        const selected = texts[lang] || {};
        return { ...base, ...selected };
    }, [lang]);

    return { t, lang, changeLanguage };
};