// @ts-check
// Reviews: show approved reviews from the sheet feed, and let customers send a new one.
import { REVIEWS } from './reviews.config.js';
import { toast } from './toast.js';

const gsap = /** @type {any} */ (window).gsap;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (/** @type {string} */ s) => /** @type {HTMLElement} */ (document.querySelector(s));
const grid = $('[data-reviews-grid]');
const form = /** @type {HTMLFormElement} */ ($('[data-review-form]'));
const openBtn = $('[data-review-open]');
const err = $('[data-review-error]');
const esc = (/** @type {string} */ s) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] || c));

/* ---------- approved reviews ---------- */
/** @param {{name:string,brand:string,service:string,rating:number,text:string}[]} list */
function render(list) {
  if (!list.length) {
    grid.hidden = true;
    $('[data-reviews-lede]').textContent = 'We’re new, so this wall is still empty. Worked with us? Be one of the first to leave a review.';
    return;
  }
  grid.hidden = false;
  grid.innerHTML = list.map(r => `
    <figure class="rcard">
      <span class="tape tape--tl" aria-hidden="true"></span>
      <div class="rcard__stars" aria-label="${r.rating} out of 5 stars">${'★'.repeat(r.rating)}<i>${'★'.repeat(5 - r.rating)}</i></div>
      <blockquote class="rcard__text" dir="auto">“${esc(r.text)}”</blockquote>
      <figcaption><strong dir="auto">${esc(r.name)}</strong><span dir="auto">${esc([r.brand, r.service].filter(Boolean).join(' · '))}</span></figcaption>
    </figure>`).join('');
  if (!reduced) gsap.from(grid.children, { opacity: 0, y: 30, duration: .7, stagger: .08, ease: 'power3.out', scrollTrigger: { trigger: grid, start: 'top 85%', once: true } });
}
// Ask Google for approved reviews only when the visitor gets near the section (the feed takes ~1–3 s to answer)
const loadReviews = () => fetch(REVIEWS.feedUrl).then(r => r.json()).then(d => render(Array.isArray(d.reviews) ? d.reviews : [])).catch(() => render([]));
const section = grid.closest('section');
grid.hidden = true;
new IntersectionObserver((es, io) => { if (es.some(e => e.isIntersecting)) { io.disconnect(); loadReviews(); } }, { rootMargin: '1500px 0px' }).observe(section);

/* ---------- leave a review ---------- */
$('[data-review-services]').innerHTML = REVIEWS.services.map(s => `<label><input type="radio" name="service" value="${s}"><span>${s}</span></label>`).join('');
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
  if (!d.name) { problems.push('add your name'); bad('name'); }
  if (!d.service) { problems.push('choose the service'); bad('service'); }
  if (!d.rating) { problems.push('choose a star rating'); bad('rating'); }
  if (d.text.length < 10) { problems.push('write at least 10 characters'); bad('text'); }
  if (d.phone && !/^\+?[0-9]{10,15}$/.test(d.phone)) { problems.push('fix the WhatsApp number or leave it empty'); bad('phone'); }
  if (problems.length) { err.hidden = false; err.textContent = 'To send your review, ' + problems.join(', ') + '.'; return; }
  err.hidden = true;

  const e2 = REVIEWS.entries, body = new URLSearchParams();
  body.set(`entry.${e2.name}`, d.name);
  if (d.brand) body.set(`entry.${e2.brand}`, d.brand);
  body.set(`entry.${e2.service}`, d.service);
  body.set(`entry.${e2.rating}`, d.rating);
  body.set(`entry.${e2.text}`, d.text);
  if (d.phone) body.set(`entry.${e2.phone}`, d.phone);

  const btn = /** @type {HTMLButtonElement} */ (form.querySelector('button[type=submit]')), label = /** @type {HTMLElement} */ (btn.querySelector('span'));
  btn.disabled = true; label.textContent = 'SENDING…';
  try {
    await fetch(REVIEWS.responseUrl, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString() });
    toast({ title: 'Review sent', text: 'Thank you! It will appear on our website after a quick check.' });
    form.hidden = true; openBtn.hidden = true;
    const done = $('[data-review-done]'); done.hidden = false;
    if (!reduced) gsap.from(done.children, { y: 30, opacity: 0, stagger: .1, duration: .8, ease: 'expo.out' });
  } catch {
    btn.disabled = false; label.textContent = 'SEND REVIEW';
    err.hidden = false; err.textContent = "Your review didn't send — check your connection and try again.";
    toast({ type: 'error', title: "Your review didn't send", text: 'Check your connection and try again.' });
  }
});
