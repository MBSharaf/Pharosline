// @ts-check
// The site has two pages: index.html (English) and ar.html (Arabic, built by tools/prerender.py).
// Static text is translated at build time from i18n/ar.json; strings drawn by JS pick their language here.

export const LANG = document.documentElement.lang === 'ar' ? 'ar' : 'en';

/** English or Arabic version of a string, for the current page. @param {string} en @param {string} [ar] */
export const t = (en, ar) => (LANG === 'ar' && ar != null ? ar : en);
