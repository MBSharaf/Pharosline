// @ts-check
// Google Form wiring for the site's own 'Have a project in mind?' form.
// The site posts answers straight to the form's formResponse endpoint. Public IDs/URLs only — no secrets.
// Owner account: pharosline.agency@gmail.com. Form built by tools/create-form.gs.
//
// If you change a price in pricing.data.js, change the matching option text here
// AND in the Google Form (edit link below) — pre-fill only works on an exact match.

export const FORM = {
  editUrl: 'https://docs.google.com/forms/d/1fATBQqG2qfBBrVJCL8r8Cn_FfMSfjZiGZJHqSIdQu5U/edit',
  publicUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSdx2oUiGl9zZskPci2pgTPkbZuhh4hpT2oxgRIxU38CeuQSuQ/viewform',
  responseUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSdx2oUiGl9zZskPci2pgTPkbZuhh4hpT2oxgRIxU38CeuQSuQ/formResponse',

  /** Form page index of each service's package section (page 0 = details, 6 = idea) */
  pages: { social: 1, youtube: 2, websites: 3, documents: 4, ads: 5, last: 6 },
  sheetUrl: 'https://docs.google.com/spreadsheets/d/1z1aotD1XR1kixlb9M6TVjEoRQZO7lWWVp9ws_d7HHFo/edit',

  /** entry.<id> parameters (read from the live form) */
  entries: {
    name: '2090714336',
    phone: '51694569',
    email: '673755498',
    brand: '293466123',
    service: '168417191',
    idea: '1451856679',
    package: {
      social: '1006983919',
      youtube: '1557854988',
      websites: '1773358324',
      documents: '588310269',
      ads: '617903440',
    },
  },

  /** Service choice text in the form, keyed by pricing.data service id */
  serviceChoice: {
    social: 'Social Media', youtube: 'YouTube', websites: 'Websites', documents: 'PDF & Presentations', ads: 'Ads',
  },

  /** Package choice text in the form. Social keys are "<billing>:<packageId>". */
  packageChoice: {
    social: {
      'weekly:starter': 'Weekly - Starter (2 posts + 1 reel) - 800 EGP (was 1,400)',
      'weekly:growth': 'Weekly - Growth (3 posts + 1 reel + ad campaign) - 1,500 EGP (was 2,700)',
      'weekly:pro': 'Weekly - Pro (4 posts + 2 reels + ad campaign + motion video) - 2,600 EGP (was 4,600)',
      'monthly:starter': 'Monthly - Starter (8 posts + 4 reels) - 2,700 EGP (was 5,200)',
      'monthly:growth': 'Monthly - Growth (12 posts + 4 reels + ad campaign + report) - 5,000 EGP (was 9,500)',
      'monthly:pro': 'Monthly - Pro (16 posts + 8 reels + 2 ad campaigns + motion video + content plan) - 8,900 EGP (was 17,000)',
    },
    youtube: {
      single: 'Single Episode (script + visual package + SEO) - 1,000 EGP (was 1,800)',
      monthly4: 'Monthly: 4 Episodes - 3,400 EGP (was 6,000)',
      thumbs: 'Thumbnails Pack (4 thumbnails) - 600 EGP (was 1,000)',
    },
    websites: {
      landing: 'Landing Page - 3,500 EGP (was 6,500)',
      business: 'Business Website (5 pages) - 6,000 EGP (was 11,000)',
      ecommerce: 'E-commerce Store - 14,000 EGP (was 25,000)',
    },
    documents: {
      upto10: 'Up to 10 pages - 700 EGP (was 1,200)',
      pro30: 'Professional, 11-30 pages - 900 EGP (was 1,500)',
      bundle3: '3 Documents Bundle - 1,900 EGP (was 3,200)',
    },
    ads: {
      creative: 'Creative Pack (10 designs + 3 copy variations) - 900 EGP (was 1,500)',
      strategy: 'Strategy + Creative + Copy - 1,500 EGP (was 2,600)',
    },
  },
};

/** Form choice text for a package. Social keys are "<billing>:<packageId>". */
export function packageChoice(serviceId, packageId, billing) {
  const key = serviceId === 'social' ? `${billing}:${packageId}` : packageId;
  return FORM.packageChoice[serviceId]?.[key];
}

/**
 * Body for a POST to FORM.responseUrl.
 * @param {{ name: string, phone: string, email: string, brand: string, idea: string,
 *           serviceId: string, packageId: string, billing?: string }} d
 */
export function formBody(d) {
  const e = FORM.entries, p = new URLSearchParams();
  p.set(`entry.${e.name}`, d.name);
  p.set(`entry.${e.phone}`, d.phone);
  if (d.email) p.set(`entry.${e.email}`, d.email);
  p.set(`entry.${e.brand}`, d.brand);
  p.set(`entry.${e.service}`, FORM.serviceChoice[d.serviceId]);
  p.set(`entry.${e.package[d.serviceId]}`, packageChoice(d.serviceId, d.packageId, d.billing) || '');
  if (d.idea) p.set(`entry.${e.idea}`, d.idea);
  // the form branches by service, so tell Google which pages were "visited"
  p.set('pageHistory', `0,${FORM.pages[d.serviceId]},${FORM.pages.last}`);
  return p;
}