// @ts-check
// Google Form wiring for the site's own 'Have a project in mind?' form.
// The site posts answers straight to the form's formResponse endpoint. Public IDs/URLs only — no secrets.
// Owner account: pharosline.agency@gmail.com. Form built by tools/create-form.gs.
//
// If you change a price in pricing.data.js, change the matching option text here
// AND in the Google Form (run tools/update-form-options.gs) — the form rejects any answer that isn't an exact option.

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

  /** Service choice text in the form, keyed by pricing.data service id (the site sells websites only now) */
  serviceChoice: { websites: 'Websites' },

  /** Package choice text in the form — must match the Google Form options exactly (always English). */
  packageChoice: {
    websites: {
      consult: 'Technical consultation (not sure yet)',
      landing: 'Landing Page - 4,000 EGP (was 5,000)',
      business: 'Business Website (5 pages) - 7,000 EGP (was 9,000)',
      ecommerce: 'E-commerce Store - 16,000 EGP (was 20,000)',
    },
  },

  /**
   * TEMPORARY: the live Google Form still only has the old (Oct 2026) options, and it drops any answer
   * that isn't one of them. Until tools/update-form-options.gs has run, send an option the form has and
   * put the real choice at the start of the idea field, e.g. "[Technical consultation (not sure yet)]".
   * Set to null once the form shows the new options.
   */
  legacyChoice: {
    websites: {
      consult: 'Landing Page - 3,500 EGP (was 6,500)',
      landing: 'Landing Page - 3,500 EGP (was 6,500)',
      business: 'Business Website (5 pages) - 6,000 EGP (was 11,000)',
      ecommerce: 'E-commerce Store - 14,000 EGP (was 25,000)',
    },
  },
};

/** Form choice text for a package. */
export function packageChoice(serviceId, packageId) {
  return FORM.packageChoice[serviceId]?.[packageId];
}

/**
 * Body for a POST to FORM.responseUrl.
 * @param {{ name: string, phone: string, email: string, brand: string, idea: string,
 *           serviceId: string, packageId: string }} d
 */
export function formBody(d) {
  const e = FORM.entries, p = new URLSearchParams();
  p.set(`entry.${e.name}`, d.name);
  p.set(`entry.${e.phone}`, d.phone);
  if (d.email) p.set(`entry.${e.email}`, d.email);
  p.set(`entry.${e.brand}`, d.brand);
  p.set(`entry.${e.service}`, FORM.serviceChoice[d.serviceId]);
  const chosen = packageChoice(d.serviceId, d.packageId) || '';
  const legacy = FORM.legacyChoice?.[d.serviceId]?.[d.packageId];
  p.set(`entry.${e.package[d.serviceId]}`, legacy || chosen);
  const idea = legacy ? `[${chosen}]${d.idea ? ' ' + d.idea : ''}` : d.idea;
  if (idea) p.set(`entry.${e.idea}`, idea);
  // the form branches by service, so tell Google which pages were "visited"
  p.set('pageHistory', `0,${FORM.pages[d.serviceId]},${FORM.pages.last}`);
  return p;
}