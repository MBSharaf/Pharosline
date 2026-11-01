// @ts-check
// Reviews: show approved reviews from the sheet feed, and let customers send a new one.
import { REVIEWS } from './reviews.config.js';
import { toast } from './toast.js';
import { t } from './i18n.js';

const gsap = /** @type {any} */ (window).gsap;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (/** @type {string} */ s) => /** @type {HTMLElement} */ (document.querySelector(s));
const grid = $('[data-reviews-grid]');
const form = /** @type {HTMLFormElement} */ ($('[data-review-form]'));
const openBtn = $('[data-review-open]');
const err = $('[data-review-error]');
const esc = (/** @type {string} */ s) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] || c));

/* ---------- approved reviews ---------- */
const lede = $('[data-reviews-lede]'), ledeText = lede.textContent;
/** @param {{name:string,brand:string,service:string,rating:number,text:string}[]} list */
function render(list) {
  if (!list.length) {
    grid.hidden = true;
    lede.textContent = t('We’re new, so this wall is still empty. Worked with us? Be one of the first to leave a review.', 'إحنا لسه جداد، فالحيطة دي لسه فاضية. اشتغلت معانا؟ كن من أول الناس اللي يكتبوا رأيهم.');
    return;
  }
  lede.textContent = ledeText; // a later source may bring reviews after an empty one
  grid.hidden = false;
  grid.innerHTML = list.map(r => `
    <figure class="rcard">
      <span class="tape tape--tl" aria-hidden="true"></span>
      <div class="rcard__stars" aria-label="${t(`${r.rating} out of 5 stars`, `${r.rating} من 5 نجوم`)}">${'★'.repeat(r.rating)}<i>${'★'.repeat(5 - r.rating)}</i></div>
      <blockquote class="rcard__text" dir="auto">“${esc(r.text)}”</blockquote>
      <figcaption><strong dir="auto">${esc(r.name)}</strong><span dir="auto">${esc([r.brand, r.service].filter(Boolean).join(' · '))}</span></figcaption>
    </figure>`).join('');
  if (!reduced) gsap.from(grid.children, { opacity: 0, y: 30, duration: .7, stagger: .08, ease: 'power3.out', scrollTrigger: { trigger: grid, start: 'top 85%', once: true } });
}
// Approved reviews come from two places, loaded when the visitor nears the section:
//  1. assets/reviews.json — the snapshot from the last build; a static file, so it works for any number of visitors
//  2. the live Apps Script feed (1–3 s, max 30 calls at a time) — adds reviews approved since that build
// A failed source never wipes what's shown, and "the wall is empty" only appears when a source really said so.
const getList = (/** @type {string} */ url, ms = 8000) => Promise.race([
  fetch(url, { cache: 'no-cache' }).then(r => (r.ok ? r.json() : Promise.reject(r.status))).then(d => (Array.isArray(d.reviews) ? d.reviews : Promise.reject('bad data'))),
  new Promise((_, no) => setTimeout(() => no('timeout'), ms)),
]);
let shown = /** @type {string | null} */ (null);
const show = (/** @type {any[]} */ list) => { const key = JSON.stringify(list); if (key !== shown) { shown = key; render(list); } };
const SEEN = 'pharos-reviews';
function loadReviews() {
  try { const s = sessionStorage.getItem(SEEN); if (s) show(JSON.parse(s)); } catch { /* storage blocked */ }
  getList(REVIEWS.staticUrl, 6000).then(list => { if (shown === null) show(list); }).catch(() => {});
  getList(REVIEWS.feedUrl).then(list => {
    show(list);
    try { sessionStorage.setItem(SEEN, JSON.stringify(list)); } catch { /* storage blocked */ }
  }).catch(() => {}); // feed busy or down: keep whatever the snapshot showed
}
const section = grid.closest('section');
grid.hidden = true;
new IntersectionObserver((es, io) => { if (es.some(e => e.isIntersecting)) { io.disconnect(); loadReviews(); } }, { rootMargin: '1500px 0px' }).observe(section);

/* ---------- leave a review ---------- */
$('[data-review-services]').innerHTML = REVIEWS.services.map((s, i) => `<label><input type="radio" name="service" value="${s}"><span>${t(s, REVIEWS.servicesAr[i])}</span></label>`).join('');
openBtn.addEventListener('click', () => {
  const open = form.hidden;
  form.hidden = !open; openBtn.setAttribute('aria-expanded', String(open));
  if (open) {
    if (!reduced) gsap.fromTo(form, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .6, ease: 'expo.out' });
    /** @type {HTMLInputElement} */ (form.elements.namedItem('name')).focus({ preventScroll: true });
  }
});
const count = $('[data-review-count]'), textarea = /** @type {HTMLTextAreaElement} */ (form.elements.namedItem('text'));
textarea.addEventListener('input', () => { count.textContent = `${textarea.value.length} / ${REVIEWS.maxLength}`; });

form.addEventListener('submit', async e => {
  e.preventDefault();
  const fd = new FormData(form), get = (/** @type {string} */ k) => String(fd.get(k) || '').trim();
  const d = { name: get('name'), brand: get('brand'), service: get('service'), rating: get('rating'), text: get('text'), phone: get('phone').replace(/[\s-]/g, '') };
  form.querySelectorAll('.is-invalid').forEach(x => x.classList.remove('is-invalid'));
  const bad = (/** @type {string} */ n) => form.querySelector(`[name=${n}]`)?.closest('.field, fieldset')?.classList.add('is-invalid');
  const problems = [];
  if (!d.name) { problems.push(t('add your name', 'اكتب اسمك')); bad('name'); }
  if (!d.service) { problems.push(t('choose the service', 'اختار الخدمة')); bad('service'); }
  if (!d.rating) { problems.push(t('choose a star rating', 'اختار عدد النجوم')); bad('rating'); }
  if (d.text.length < 10) { problems.push(t('write at least 10 characters', 'اكتب 10 حروف على الأقل')); bad('text'); }
  if (d.phone && !/^\+?[0-9]{10,15}$/.test(d.phone)) { problems.push(t('fix the WhatsApp number or leave it empty', 'صحّح رقم الواتساب أو سيبه فاضي')); bad('phone'); }
  if (problems.length) { err.hidden = false; err.textContent = t('To send your review, ', 'عشان تبعت رأيك: ') + problems.join(t(', ', '، ')) + '.'; return; }
  err.hidden = true;

  const e2 = REVIEWS.entries, body = new URLSearchParams();
  body.set(`entry.${e2.name}`, d.name);
  if (d.brand) body.set(`entry.${e2.brand}`, d.brand);
  body.set(`entry.${e2.service}`, d.service);
  body.set(`entry.${e2.rating}`, d.rating);
  body.set(`entry.${e2.text}`, d.text);
  if (d.phone) body.set(`entry.${e2.phone}`, d.phone);

  const btn = /** @type {HTMLButtonElement} */ (form.querySelector('button[type=submit]')), label = /** @type {HTMLElement} */ (btn.querySelector('span'));
  btn.disabled = true; label.textContent = t('SENDING…', 'بيتبعت…');
  try {
    await fetch(REVIEWS.responseUrl, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString() });
    toast({ title: t('Review sent', 'رأيك وصل'), text: t('Thank you! It will appear on our website after a quick check.', 'شكرًا! هيظهر على موقعنا بعد مراجعة سريعة.') });
    form.hidden = true; openBtn.hidden = true;
    const done = $('[data-review-done]'); done.hidden = false;
    if (!reduced) gsap.from(done.children, { y: 30, opacity: 0, stagger: .1, duration: .8, ease: 'expo.out' });
  } catch {
    btn.disabled = false; label.textContent = t('SEND REVIEW', 'ابعت رأيك');
    err.hidden = false; err.textContent = t("Your review didn't send — check your connection and try again.", 'رأيك ما اتبعتش — اتأكد من النت وجرّب تاني.');
    toast({ type: 'error', title: t("Your review didn't send", 'رأيك ما اتبعتش'), text: t('Check your connection and try again.', 'اتأكد من النت وجرّب تاني.') });
  }
});
