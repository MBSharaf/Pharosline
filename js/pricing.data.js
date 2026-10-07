// @ts-check
// Single source of truth for Pharosline pricing. Edit numbers here only —
// cards, discount badges and WhatsApp messages are all derived from this file.

/**
 * @typedef {Object} Package
 * @property {string} id
 * @property {string} name
 * @property {number} before   Regular price in EGP
 * @property {number} after    First-client price in EGP
 * @property {boolean} [popular]
 * @property {string} [includes]  Smaller package this one contains; shown as "Everything in X, plus:"
 * @property {string[]} features
 *
 * @typedef {'social' | 'youtube' | 'websites' | 'documents' | 'ads'} ServiceId
 * @typedef {'weekly' | 'monthly'} Billing
 *
 * @typedef {Object} Service
 * @property {ServiceId} id
 * @property {string} label
 * @property {string} planLabel        Used in the WhatsApp message, e.g. "Social Media"
 * @property {boolean} billingAware    true = Weekly/Monthly changes the packages
 * @property {string} [note]           Footer note under the grid for this tab
 * @property {Package[] | Record<Billing, Package[]>} packages
 */

export const CURRENCY = 'EGP';
export const WHATSAPP_NUMBER = '201017300040';
export const DEFAULT_BILLING = /** @type {Billing} */ ('monthly');

/** @type {Service[]} */
export const SERVICES = [
  {
    id: 'social', label: 'Social Media', planLabel: 'Social Media', billingAware: true,
    packages: {
      weekly: [
        { id: 'starter', name: 'Starter', before: 1400, after: 800, features: ['2 designed posts', '1 reel (up to 20 s)', 'captions + hashtags', 'brand-consistent design', '1 revision round', 'delivered within 3 days'] },
        { id: 'growth', name: 'Growth', before: 2700, after: 1500, popular: true, includes: 'Starter', features: ['3 posts + 1 reel', '1 Meta ad campaign (setup + management)', 'weekly results summary', '2 revision rounds', 'delivered within 3 days'] },
        { id: 'pro', name: 'Pro', before: 4600, after: 2600, includes: 'Growth', features: ['4 posts + 2 reels', '1 motion graphic video', 'priority support on WhatsApp', '2 revision rounds', 'delivered within 2 days'] },
      ],
      monthly: [
        { id: 'starter', name: 'Starter', before: 5200, after: 2700, features: ['8 designed posts', '4 reels', 'captions + hashtags', 'monthly posting calendar', '2 revision rounds per item'] },
        { id: 'growth', name: 'Growth', before: 9500, after: 5000, popular: true, includes: 'Starter', features: ['12 posts + 4 reels', '1 managed Meta ad campaign', 'monthly performance report', '2 revision rounds per item'] },
        { id: 'pro', name: 'Pro', before: 17000, after: 8900, includes: 'Growth', features: ['16 posts + 8 reels', '2 managed Meta ad campaigns', '1 motion graphic video', 'full content plan for the month', 'priority WhatsApp support'] },
      ],
    },
  },
  {
    id: 'youtube', label: 'YouTube', planLabel: 'YouTube', billingAware: false,
    packages: [
      { id: 'single', name: 'Single Episode', before: 1800, after: 1000, features: ['full script', 'visual production package (scene map + visual prompts)', 'YouTube SEO (title, description, tags)', 'Reels/Shorts plan', '1 revision round'] },
      { id: 'monthly4', name: 'Monthly: 4 Episodes', before: 6000, after: 3400, popular: true, features: ['everything in Single Episode × 4', 'consistent series style', 'monthly publishing plan'] },
      { id: 'thumbs', name: 'Thumbnails Pack (4 thumbnails)', before: 1000, after: 600, features: ['4 thumbnail concepts and final designs', 'legibility check on mobile size', '1 revision round'] },
    ],
  },
  {
    id: 'websites', label: 'Websites', planLabel: 'Websites', billingAware: false,
    note: 'Final scope is confirmed on WhatsApp before we start.',
    packages: [
      { id: 'landing', name: 'Landing Page', before: 6500, after: 3500, features: ['one high-converting page', 'responsive design', 'animated UI', 'WhatsApp / contact button', 'basic SEO setup'] },
      { id: 'business', name: 'Business Website (5 pages)', before: 11000, after: 6000, popular: true, features: ['up to 5 pages', 'responsive design', 'animated UI', 'contact form', 'SEO setup', 'project planning phase before build'] },
      { id: 'ecommerce', name: 'E-commerce Store', before: 25000, after: 14000, features: ['product catalog + cart + checkout flow', 'responsive design', 'animated UI', 'SEO setup', 'project planning phase before build', 'handover walkthrough'] },
    ],
  },
  {
    id: 'documents', label: 'PDF & Presentations', planLabel: 'PDF & Presentations', billingAware: false,
    packages: [
      { id: 'upto10', name: 'Up to 10 pages', before: 1200, after: 700, features: ['designed PDF or presentation', 'brand colors and fonts', '1 revision round'] },
      { id: 'pro30', name: 'Professional, 11–30 pages', before: 1500, after: 900, popular: true, features: ['designed PDF or presentation', 'structured layout', 'brand colors and fonts', '2 revision rounds'] },
      { id: 'bundle3', name: '3 Documents Bundle', before: 3200, after: 1900, features: ['three documents (PDF, presentation or Word)', 'consistent design across all three', '2 revision rounds each'] },
    ],
  },
  {
    id: 'ads', label: 'Ads', planLabel: 'Ads', billingAware: false,
    note: 'Need campaign management? See the Growth and Pro Social Media plans.',
    packages: [
      { id: 'creative', name: 'Creative Pack', before: 1500, after: 900, features: ['10 ad designs', '3 ad copy variations', 'formats for feed and stories', '1 revision round'] },
      { id: 'strategy', name: 'Strategy + Creative + Copy', before: 2600, after: 1500, popular: true, features: ['campaign strategy and planning', '10 ad designs', 'ad copywriting adapted per platform', '2 revision rounds'] },
    ],
  },
];

/** @param {Service} s @param {Billing} billing @returns {Package[]} */
export const packagesFor = (s, billing) => Array.isArray(s.packages) ? s.packages : s.packages[billing];

/** @param {Package} p */
export const discountPct = p => Math.round((p.before - p.after) / p.before * 100);

/** @param {number} n */
export const formatPrice = n => `${Math.round(n).toLocaleString('en-US')} ${CURRENCY}`;

/** @param {Service} s @param {Package} p @param {Billing} billing */
export function whatsappLink(s, p, billing) {
  const plan = `${s.planLabel} ${p.name}`;
  const bill = s.billingAware ? ` (${billing[0].toUpperCase()}${billing.slice(1)})` : '';
  const msg = `Hi Pharosline, I'd like the "${plan}" ${s.billingAware ? 'plan' : 'package'}${bill} at ${formatPrice(p.after)}.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}
