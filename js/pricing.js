// @ts-check
// Packages section: billing toggle -> service tabs -> animated package cards.
// All numbers come from pricing.data.js.
import { SERVICES, DEFAULT_BILLING, packagesFor, discountPct, formatPrice, whatsappLink } from './pricing.data.js';

const gsap = /** @type {any} */ (window).gsap;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const root = /** @type {HTMLElement} */ (document.querySelector('#pricing'));
const $ = (/** @type {string} */ s) => /** @type {HTMLElement} */ (root.querySelector(s));

const ICONS = {
  social: '<rect x="4" y="3" width="16" height="18" rx="3"/><circle cx="12" cy="11" r="3.2" class="a"/><path d="M8 18h8"/>',
  youtube: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 9l5 3-5 3z" class="a"/>',
  websites: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 8h18"/><path d="M8 13l-2 2 2 2M16 13l2 2-2 2" class="a"/>',
  documents: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M9 12h6M9 16h4" class="a"/>',
  ads: '<path d="M4 10v4h3l7 4V6L7 10z"/><path d="M17.5 9.5a4 4 0 0 1 0 5" class="a"/><path d="M8 14l1 5h2l-1-4"/>',
};

const state = { billing: DEFAULT_BILLING, service: SERVICES[0] };
/** previous rendered prices, per card slot, for count-up/down */
let lastPrices = /** @type {number[]} */ ([]);

/* ---------- tabs ---------- */
const tablist = $('.ptabs');
SERVICES.forEach((s, i) => tablist.insertAdjacentHTML('beforeend',
  `<button role="tab" id="ptab-${s.id}" aria-controls="pgrid" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-service="${s.id}">
     <svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[s.id]}</svg><span>${s.label}</span></button>`));
const tabs = /** @type {HTMLButtonElement[]} */ ([...tablist.querySelectorAll('[role=tab]')]);
const pill = $('.ptabs__pill');
$('[data-pgrid]').id = 'pgrid';

function movePill(animate = true) {
  const t = tabs.find(b => b.dataset.service === state.service.id);
  if (!t) return;
  const props = { x: t.offsetLeft, width: t.offsetWidth, height: t.offsetHeight, y: t.offsetTop };
  animate && !reduced ? gsap.to(pill, { ...props, duration: .45, ease: 'back.out(1.4)' }) : gsap.set(pill, props);
  if (animate) t.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduced ? 'auto' : 'smooth' });
}
tabs.forEach((t, i) => {
  t.addEventListener('click', () => selectService(i));
  t.addEventListener('keydown', e => {
    const k = /** @type {KeyboardEvent} */ (e).key;
    let n = k === 'ArrowRight' ? i + 1 : k === 'ArrowLeft' ? i - 1 : k === 'Home' ? 0 : k === 'End' ? tabs.length - 1 : null;
    if (n === null) return;
    e.preventDefault(); n = (n + tabs.length) % tabs.length; tabs[n].focus(); selectService(n);
  });
});
/** @param {number} i */
function selectService(i) {
  if (state.service === SERVICES[i]) return;
  state.service = SERVICES[i];
  tabs.forEach((t, j) => { t.setAttribute('aria-selected', String(j === i)); t.tabIndex = j === i ? 0 : -1; });
  $('[data-pgrid]').setAttribute('aria-labelledby', tabs[i].id);
  movePill(); syncBilling(); render();
}

/* ---------- billing toggle ---------- */
const billing = $('.billing');
const radios = /** @type {HTMLButtonElement[]} */ ([...billing.querySelectorAll('[role=radio]')]);
const thumb = $('.billing__thumb');
function moveThumb(animate = true) {
  const r = radios.find(b => b.dataset.billing === state.billing);
  if (!r) return;
  const props = { x: r.offsetLeft, width: r.offsetWidth };
  animate && !reduced ? gsap.to(thumb, { ...props, duration: .5, ease: 'elastic.out(1, .75)' }) : gsap.set(thumb, props);
}
radios.forEach((r, i) => {
  r.tabIndex = r.dataset.billing === state.billing ? 0 : -1;
  r.addEventListener('click', () => selectBilling(/** @type {any} */ (r.dataset.billing)));
  r.addEventListener('keydown', e => {
    const k = /** @type {KeyboardEvent} */ (e).key;
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(k)) return;
    e.preventDefault(); const o = radios[1 - i]; o.focus(); selectBilling(/** @type {any} */ (o.dataset.billing));
  });
});
/** @param {'weekly'|'monthly'} b */
function selectBilling(b) {
  if (state.billing === b) return;
  state.billing = b;
  radios.forEach(r => { const on = r.dataset.billing === b; r.setAttribute('aria-checked', String(on)); r.tabIndex = on ? 0 : -1; });
  moveThumb();
  if (state.service.billingAware) render();
}
function syncBilling() {
  const off = !state.service.billingAware;
  billing.classList.toggle('is-dim', off);
  $('[data-billnote]').hidden = !off;
}

/* ---------- cards ---------- */
const grid = $('[data-pgrid]');
const CHECK = '<svg class="pcheck" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3.2 3L13 4.5"/></svg>';
const ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

function cardsHTML() {
  const s = state.service, pk = packagesFor(s, state.billing);
  return pk.map(p => `
    <article class="pcard${p.popular ? ' pcard--pop' : ''}">
      ${p.popular ? '<span class="pcard__pop">Most popular</span>' : ''}
      <h3 class="pcard__name">${p.name}</h3>
      <p class="pcard__label">First-client offer${s.billingAware ? ` · ${state.billing === 'weekly' ? 'per week' : 'per month'}` : ' · per project'}</p>
      <div class="pcard__prices">
        <span class="pcard__before"><span class="sr-only">Before: </span>${formatPrice(p.before)}</span>
        <span class="pcard__off">-${discountPct(p)}%</span>
      </div>
      <p class="pcard__after"><span class="sr-only">Now: </span><span data-price="${p.after}">${formatPrice(p.after)}</span></p>
      <ul class="pcard__feat">${p.includes ? `<li class="pcard__inc">Everything in ${p.includes}, plus:</li>` : ''}${p.features.map(f => `<li>${CHECK}<span>${f}</span></li>`).join('')}</ul>
      <a class="pcard__cta" href="#contact" data-request data-service="${s.id}" data-package="${p.id}" data-billing="${s.billingAware ? state.billing : 'monthly'}"
         data-label="${s.label}${s.billingAware ? ` (${state.billing === 'weekly' ? 'Weekly' : 'Monthly'})` : ''} – ${p.name} – ${formatPrice(p.after)}" data-cursor="Request">
        <span>Request this package</span>${ARROW}</a>
      <a class="pcard__wa" href="${whatsappLink(s, p, state.billing)}" target="_blank" rel="noopener">or get started on WhatsApp</a>
    </article>`).join('');
}

let busy = /** @type {any} */ (null);
function render(first = false) {
  const s = state.service;
  grid.dataset.count = String(packagesFor(s, state.billing).length);
  const note = $('[data-pnote]'); note.hidden = !s.note; note.textContent = s.note || '';
  const old = [...grid.children];
  const swap = () => {
    const h0 = grid.offsetHeight;
    grid.innerHTML = cardsHTML();
    bindCards();
    enter(h0, first);
  };
  busy?.kill();
  if (first || reduced || !old.length) return swap();
  busy = gsap.to(old, { opacity: 0, y: -12, duration: .2, stagger: .03, ease: 'power2.in', onComplete: swap });
}

/** @param {number} h0 @param {boolean} first */
function enter(h0, first) {
  const cards = [...grid.children];
  const prices = cards.map(c => Number(/** @type {HTMLElement} */ (c.querySelector('[data-price]')).dataset.price));
  if (reduced) { lastPrices = prices; return; }
  // keep height steady, then ease to the new one: no layout jump
  const h1 = grid.offsetHeight;
  if (!first && h0) gsap.fromTo(grid, { height: h0 }, { height: h1, duration: .4, ease: 'power2.inOut', clearProps: 'height' });
  const tl = gsap.timeline();
  tl.fromTo(cards, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: .5, stagger: .06, ease: 'power3.out' }, 0);
  cards.forEach((c, i) => {
    const before = c.querySelector('.pcard__before'), feats = c.querySelectorAll('li'), el = /** @type {HTMLElement} */ (c.querySelector('[data-price]'));
    const to = prices[i], from = lastPrices[i] ?? Math.round(to * .6), o = { v: from };
    tl.fromTo(before, { opacity: 0 }, { opacity: 1, duration: .3 }, .1 + i * .06)
      .fromTo(before, { '--strike': 0 }, { '--strike': 1, duration: .35, ease: 'power2.out' }, .25 + i * .06)
      .to(o, { v: to, duration: .5, ease: 'power2.out', onUpdate: () => { el.textContent = formatPrice(o.v); } }, .1 + i * .06)
      .fromTo(feats, { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: .3, stagger: .05, ease: 'power2.out' }, .2 + i * .06)
      .fromTo(c.querySelectorAll('.pcheck path'), { strokeDashoffset: 16 }, { strokeDashoffset: 0, duration: .3, stagger: .05, ease: 'power2.out' }, .25 + i * .06);
  });
  lastPrices = prices;
}

function bindCards() {
  if (reduced || !matchMedia('(hover: hover)').matches) return;
  grid.querySelectorAll('.pcard__cta').forEach(btn => {
    const b = /** @type {HTMLElement} */ (btn);
    const xTo = gsap.quickTo(b, 'x', { duration: .4, ease: 'power3' }), yTo = gsap.quickTo(b, 'y', { duration: .4, ease: 'power3' });
    b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * .15); yTo((e.clientY - r.top - r.height / 2) * .3); });
    b.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  });
}

/* ---------- init ---------- */
syncBilling();
render(true);
requestAnimationFrame(() => { movePill(false); moveThumb(false); });
addEventListener('resize', () => { movePill(false); moveThumb(false); });
document.fonts?.ready.then(() => { movePill(false); moveThumb(false); });

{
  if (!reduced) {
    gsap.fromTo([$('.pricing__head'), billing, tablist], { opacity: 0, y: 40 }, {
      opacity: 1, y: 0, duration: .6, stagger: .08, ease: 'power3.out', clearProps: 'opacity,transform',
      scrollTrigger: { trigger: root, start: 'top 75%', once: true },
      onComplete: () => { movePill(false); moveThumb(false); },
    });
    // "Best value" pulses once when the section first loads into view
    gsap.fromTo('.billing__badge', { scale: 1 }, { scale: 1.18, duration: .3, yoyo: true, repeat: 1, ease: 'power2.inOut', delay: .5, scrollTrigger: { trigger: root, start: 'top 75%', once: true } });
  }
}
