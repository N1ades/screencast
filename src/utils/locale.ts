export function getPreferredLocale(defaultLocale = 'en') {

    const browserLocales = navigator.languages ? navigator.languages : [navigator.language];
    for (const lang of browserLocales) {
        const baseLang = lang.split('-')[0];
        if (['en', 'ru', 'zh', 'ja'].includes(baseLang)) {
            return baseLang;
        }
    }
    return defaultLocale;
}
