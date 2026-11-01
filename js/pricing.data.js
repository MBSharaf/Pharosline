// @ts-check
// Single source of truth for Pharosline pricing. Edit numbers here only —
// cards, discount badges and the offer numbers are all derived from this file.
// After a change: update form.config.js + the Google Form option text (tools/update-form-options.gs), then run tools/prerender.py.
import { t } from './i18n.js';

/**
 * @typedef {Object} Package
 * @property {string} id
 * @property {string} name
 * @property {string} nameAr
 * @property {number} before   Regular price in EGP
 * @property {number} after    Launch-offer price in EGP
 * @property {boolean} [popular]
 * @property {string[]} features
 * @property {string[]} featuresAr
 *
 * @typedef {Object} Service
 * @property {'websites'} id
 * @property {string} label
 * @property {string} labelAr
 * @property {string} planLabel
 * @property {string} [note]           Footer note under the grid
 * @property {string} [noteAr]
 * @property {Package[]} packages
 */

export const CURRENCY = 'EGP';
export const WHATSAPP_NUMBER = '201017300040';

/** Every package includes this many months of technical support after launch. */
export const SUPPORT_MONTHS = 6;

/** @type {Service[]} */
export const SERVICES = [
  {
    id: 'websites', label: 'Websites', labelAr: 'المواقع', planLabel: 'Websites',
    note: 'The final scope and timeline are agreed with you in writing before work begins.',
    noteAr: 'نعتمد معك نطاق العمل والجدول الزمني بشكل نهائي قبل بدء التنفيذ.',
    packages: [
      { id: 'landing', name: 'Landing Page', nameAr: 'صفحة هبوط', before: 5000, after: 4000,
        features: ['one high-converting page', 'responsive design', 'animated UI', 'WhatsApp / contact button', 'basic SEO setup', '6 months of technical support'],
        featuresAr: ['صفحة واحدة مصممة لتحقيق أعلى معدل تحويل', 'تصميم متجاوب مع جميع الشاشات', 'واجهة تفاعلية بحركة احترافية', 'زر واتساب ووسائل تواصل', 'تهيئة أساسية لمحركات البحث (SEO)', 'دعم فني لمدة 6 أشهر'] },
      { id: 'business', name: 'Business Website (5 pages)', nameAr: 'موقع شركة (5 صفحات)', before: 9000, after: 7000, popular: true,
        features: ['up to 5 pages', 'responsive design', 'animated UI', 'contact form', 'SEO setup', 'project planning phase before build', '6 months of technical support'],
        featuresAr: ['حتى 5 صفحات', 'تصميم متجاوب مع جميع الشاشات', 'واجهة تفاعلية بحركة احترافية', 'نموذج تواصل', 'تهيئة لمحركات البحث (SEO)', 'مرحلة تخطيط للمشروع قبل التنفيذ', 'دعم فني لمدة 6 أشهر'] },
      { id: 'ecommerce', name: 'E-commerce Store', nameAr: 'متجر إلكتروني', before: 20000, after: 16000,
        features: ['product catalog + cart + checkout flow', 'responsive design', 'animated UI', 'SEO setup', 'project planning phase before build', 'handover walkthrough', '6 months of technical support'],
        featuresAr: ['كتالوج منتجات + سلة مشتريات + إتمام الطلب', 'تصميم متجاوب مع جميع الشاشات', 'واجهة تفاعلية بحركة احترافية', 'تهيئة لمحركات البحث (SEO)', 'مرحلة تخطيط للمشروع قبل التنفيذ', 'شرح تفصيلي للمتجر عند التسليم', 'دعم فني لمدة 6 أشهر'] },
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
