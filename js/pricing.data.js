// @ts-check
// Single source of truth for Pharosline pricing. Edit numbers here only —
// cards, discount badges, the hero offer and WhatsApp messages are all derived from this file.
// After a change: update form.config.js + the Google Form option text, then run tools/prerender.py.
import { t } from './i18n.js';

/**
 * @typedef {Object} Package
 * @property {string} id
 * @property {string} name
 * @property {string} nameAr
 * @property {number} before   Regular price in EGP
 * @property {number} after    First-client price in EGP
 * @property {boolean} [popular]
 * @property {string[]} features
 * @property {string[]} featuresAr
 *
 * @typedef {Object} Service
 * @property {'websites'} id
 * @property {string} label
 * @property {string} labelAr
 * @property {string} planLabel        Used in the WhatsApp message
 * @property {string} [note]           Footer note under the grid
 * @property {string} [noteAr]
 * @property {Package[]} packages
 */

export const CURRENCY = 'EGP';
export const WHATSAPP_NUMBER = '201017300040';

/** @type {Service[]} */
export const SERVICES = [
  {
    id: 'websites', label: 'Websites', labelAr: 'المواقع', planLabel: 'Websites',
    note: 'Final scope is confirmed on WhatsApp before we start.',
    noteAr: 'بنأكد معاك كل تفاصيل الموقع على واتساب قبل ما نبدأ.',
    packages: [
      { id: 'landing', name: 'Landing Page', nameAr: 'صفحة هبوط', before: 6500, after: 3500,
        features: ['one high-converting page', 'responsive design', 'animated UI', 'WhatsApp / contact button', 'basic SEO setup'],
        featuresAr: ['صفحة واحدة معمولة عشان تبيع', 'تصميم متجاوب مع كل الشاشات', 'واجهة فيها حركة وأنيميشن', 'زرار واتساب وتواصل', 'تجهيز SEO أساسي'] },
      { id: 'business', name: 'Business Website (5 pages)', nameAr: 'موقع شركة (5 صفحات)', before: 11000, after: 6000, popular: true,
        features: ['up to 5 pages', 'responsive design', 'animated UI', 'contact form', 'SEO setup', 'project planning phase before build'],
        featuresAr: ['لحد 5 صفحات', 'تصميم متجاوب مع كل الشاشات', 'واجهة فيها حركة وأنيميشن', 'فورم تواصل', 'تجهيز SEO', 'مرحلة تخطيط للمشروع قبل التنفيذ'] },
      { id: 'ecommerce', name: 'E-commerce Store', nameAr: 'متجر إلكتروني', before: 25000, after: 14000,
        features: ['product catalog + cart + checkout flow', 'responsive design', 'animated UI', 'SEO setup', 'project planning phase before build', 'handover walkthrough'],
        featuresAr: ['منتجات + سلة مشتريات + إتمام طلب', 'تصميم متجاوب مع كل الشاشات', 'واجهة فيها حركة وأنيميشن', 'تجهيز SEO', 'مرحلة تخطيط للمشروع قبل التنفيذ', 'شرح كامل للمتجر عند التسليم'] },
    ],
  },
];

export const WEBSITES = SERVICES[0];

/** @param {Package} p */
export const discountPct = p => Math.round((p.before - p.after) / p.before * 100);

/** @param {number} n */
export const formatPrice = n => t(`${Math.round(n).toLocaleString('en-US')} ${CURRENCY}`, `${Math.round(n).toLocaleString('en-US')} جنيه`);

/** Headline numbers for the offer banners */
export const OFFER = {
  pct: Math.max(...WEBSITES.packages.map(discountPct)),
  from: Math.min(...WEBSITES.packages.map(p => p.after)),
  save: Math.max(...WEBSITES.packages.map(p => p.before - p.after)),
};

/** @param {Package} p */
export function whatsappLink(p) {
  const msg = t(`Hi Pharosline, I'd like the "${p.name}" website package at ${formatPrice(p.after)}.`,
    `أهلاً فاروس لاين، عايز باقة «${p.nameAr}» بسعر ${formatPrice(p.after)}.`);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}
