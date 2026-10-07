// @ts-check
// Renders the ad-results strip in Services → Advertising Campaigns and counts it up
// once, the first time the panel is shown on screen.
import { AD_STATS, AD_STATS_NOTE } from './adStats.data.js';

const gsap = /** @type {any} */ (window).gsap;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const root = /** @type {HTMLElement} */ (document.querySelector('[data-adstats]'));
const panel = /** @type {HTMLElement} */ (root.closest('.svc'));
const fmt = (/** @type {number} */ v, /** @type {import('./adStats.data.js').AdStat} */ s) =>
  `${s.prefix || ''}${v.toLocaleString('en-US', { minimumFractionDigits: s.decimals, maximumFractionDigits: s.decimals })}${s.suffix || ''}`;

/** @type {HTMLElement} */ (root.querySelector('.adstats__grid')).innerHTML = AD_STATS.map((s, i) =>
  `<div class="adstats__item"><dt>${s.label}</dt><dd data-i="${i}">${fmt(reduced ? s.value : 0, s)}</dd></div>`).join('');
/** @type {HTMLElement} */ (root.querySelector('.adstats__note')).textContent = AD_STATS_NOTE;

let done = false;
function play() {
  if (done) return;
  done = true;
  if (reduced) return;
  const items = root.querySelectorAll('.adstats__item');
  gsap.fromTo(items, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .6, stagger: .08, ease: 'power3.out', delay: .35 });
  root.querySelectorAll('dd').forEach(dd => {
    const s = AD_STATS[Number(/** @type {HTMLElement} */ (dd).dataset.i)], o = { v: 0 };
    gsap.to(o, { v: s.value, duration: 1.4, ease: 'power2.out', delay: .4, onUpdate: () => { dd.textContent = fmt(o.v, s); } });
  });
}

// count up the first time the Ads panel is active AND in view
let inView = false;
const check = () => { if (inView && panel.classList.contains('is-active')) play(); };
new IntersectionObserver(([e]) => { inView = e.isIntersecting; check(); }, { threshold: .4 }).observe(root);
new MutationObserver(check).observe(panel, { attributes: true, attributeFilter: ['class'] });
