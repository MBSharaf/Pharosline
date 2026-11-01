// @ts-check
// Customer reviews wiring. Public URLs/IDs only — no secrets.
// Owner: pharosline.agency@gmail.com. Built by tools/reviews.gs.
//  - Reviews land in the "Reviews" tab of the client-requests sheet.
//  - Tick "Approved" on a row and it appears on the website within about a minute.

export const REVIEWS = {
  // Apps Script web app: returns ONLY approved reviews, ONLY public fields (never phone numbers)
  feedUrl: 'https://script.google.com/macros/s/AKfycbw56nGy46xxD-b2GeeiHc6LLMnSpLdAgrN93bswd8LU752JDwHLwiwm5h-YxubF8rTE7A/exec',
  // Snapshot of the same approved reviews, written by tools/prerender.py on every build. Shown first, so the
  // wall still works when thousands of visitors arrive at once (the Apps Script feed allows only 30 calls at a time).
  staticUrl: 'assets/reviews.json',
  // Google Form the website posts new reviews to
  responseUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSefKEd5pvtXDjTx0SfmhNC2KDSx2Iihg75X7n2qO3PHRmofSA/formResponse',
  editUrl: 'https://docs.google.com/forms/d/1xm9XlpsyExVvBPJDKxCgB6d1g2QFZuHN1ospfKYz0PQ/edit',
  entries: { name: '371260723', brand: '524979771', service: '857220514', rating: '294615794', text: '884869031', phone: '1639180307' },
  // values must match the Google Form choices; servicesAr is only the label shown on ar.html
  services: ['Websites', 'Other'],
  servicesAr: ['موقع إلكتروني', 'خدمة أخرى'],
  maxLength: 600,
};
