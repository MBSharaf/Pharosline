// @ts-check
// Website packages: discount banner + animated package cards. All numbers come from pricing.data.js.
// Also fills every [data-offer="pct|from|save"] on the page (offer band, pricing banner).
import { WEBSITES, OFFER, discountPct, formatPrice } from './pricing.data.js';
import { t } from './i18n.js';

const gsap = /** @type {any} */ (window).gsap;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const root = /** @type {HTMLElement} */ (document.querySelector('#pricing'));
const grid = /** @type {HTMLElement} */ (root.querySelector('[data-pgrid]'));

/* ---------- offer numbers everywhere ---------- */
const OFFER_TEXT = { pct: `${OFFER.pct}%`, from: formatPrice(OFFER.from), save: formatPrice(OFFER.save) };
document.querySelectorAll('[data-offer]').forEach(el => {
  const k = /** @type {keyof typeof OFFER_TEXT} */ (/** @type {HTMLElement} */ (el).dataset.offer);
  if (OFFER_TEXT[k]) el.textContent = OFFER_TEXT[k];
});

/* ---------- cards ---------- */
const CHECK = '<svg class="pcheck" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3.2 3L13 4.5"/></svg>';
const ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

grid.dataset.count = String(WEBSITES.packages.length);
grid.innerHTML = WEBSITES.packages.map(p => {
  const name = t(p.name, p.nameAr);
  return `
    <article class="pcard${p.popular ? ' pcard--pop' : ''}">
      ${p.popular ? `<span class="pcard__pop">${t('Most popular', 'الأكثر طلبًا')}</span>` : ''}
      <span class="pcard__stamp" aria-hidden="true">-${discountPct(p)}%</span>
      <h3 class="pcard__name">${name}</h3>
      <p class="pcard__label">${t('Launch offer · per project', 'عرض الإطلاق · للمشروع الواحد')}</p>
      <div class="pcard__prices">
        <span class="pcard__before"><span class="sr-only">${t('Before: ', 'السعر الأصلي: ')}</span>${formatPrice(p.before)}</span>
        <span class="pcard__off">-${discountPct(p)}%</span>
      </div>
      <p class="pcard__after"><span class="sr-only">${t('Now: ', 'السعر الحالي: ')}</span><span data-price="${p.after}">${formatPrice(p.after)}</span></p>
      <p class="pcard__save">${t('You save', 'توفّر')} <b>${formatPrice(p.before - p.after)}</b></p>
      <ul class="pcard__feat">${p.features.map((f, j) => `<li>${CHECK}<span>${t(f, p.featuresAr[j])}</span></li>`).join('')}</ul>
      <a class="pcard__cta" href="#contact" data-request data-package="${p.id}" data-cursor="${t('Request', 'اطلب')}">
        <span>${t('Request this package', 'اطلب هذه الباقة')}</span>${ARROW}</a>
    </article>`;
}).join('');

const note = /** @type {HTMLElement} */ (root.querySelector('[data-pnote]'));
note.hidden = !WEBSITES.note;
note.textContent = t(WEBSITES.note || '', WEBSITES.noteAr);

/* ---------- motion ---------- */
if (!reduced) {
  // CTA buttons lean toward the cursor
  if (matchMedia('(hover: hover)').matches) grid.querySelectorAll('.pcard__cta').forEach(btn => {
    const b = /** @type {HTMLElement} */ (btn);
    const xTo = gsap.quickTo(b, 'x', { duration: .4, ease: 'power3' }), yTo = gsap.quickTo(b, 'y', { duration: .4, ease: 'power3' });
    b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * .15); yTo((e.clientY - r.top - r.height / 2) * .3); });
    b.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  });

  // banner + cards enter once: prices count up from the old price, the old price gets struck through
  const cards = [...grid.children];
  const tl = gsap.timeline({ paused: true });
  tl.fromTo('.pricing__deal > *', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: .7, stagger: .08, ease: 'power3.out', clearProps: 'opacity,transform' }, 0)
    .fromTo(cards, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: .6, stagger: .08, ease: 'power3.out', clearProps: 'opacity,transform' }, .2);
  cards.forEach((c, i) => {
    const el = /** @type {HTMLElement} */ (c.querySelector('[data-price]')), to = Number(el.dataset.price), p = WEBSITES.packages[i], o = { v: p.before };
    tl.fromTo(c.querySelector('.pcard__before'), { '--strike': 0 }, { '--strike': 1, duration: .4, ease: 'power2.out' }, .5 + i * .08)
      .to(o, { v: to, duration: .9, ease: 'power3.out', onUpdate: () => { el.textContent = formatPrice(o.v); } }, .5 + i * .08)
      .fromTo(c.querySelector('.pcard__stamp'), { scale: 2.4, opacity: 0, rotate: -40 }, { scale: 1, opacity: 1, rotate: -12, duration: .5, ease: 'back.out(2.2)' }, .9 + i * .08)
      .fromTo(c.querySelectorAll('.pcheck path'), { strokeDashoffset: 16 }, { strokeDashoffset: 0, duration: .3, stagger: .05, ease: 'power2.out' }, .7 + i * .08);
  });
  window.ScrollTrigger.create({ trigger: root.querySelector('.pricing__deal'), start: 'top 85%', once: true, onEnter: () => tl.play() });
}
