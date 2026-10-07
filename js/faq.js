// @ts-check
// Pricing FAQ accordion (data in faq.data.js). One open at a time, keyboard + screen-reader friendly.
import { FAQ } from './faq.data.js';

const gsap = /** @type {any} */ (window).gsap;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const list = /** @type {HTMLElement} */ (document.querySelector('[data-faq-list]'));

list.innerHTML = FAQ.map((f, i) => `
  <div class="faq__item">
    <h4 class="faq__h"><button class="faq__q" aria-expanded="false" aria-controls="faq-a-${i}" id="faq-q-${i}">
      <span>${f.q}</span><i class="faq__icon" aria-hidden="true"></i></button></h4>
    <div class="faq__a" id="faq-a-${i}" role="region" aria-labelledby="faq-q-${i}" hidden><p>${f.a}</p></div>
  </div>`).join('');

/** @param {HTMLButtonElement} btn @param {boolean} open */
function toggle(btn, open) {
  const panel = /** @type {HTMLElement} */ (document.getElementById(/** @type {string} */ (btn.getAttribute('aria-controls'))));
  btn.setAttribute('aria-expanded', String(open));
  btn.closest('.faq__item')?.classList.toggle('is-open', open);
  if (reduced) { panel.hidden = !open; return; }
  gsap.killTweensOf(panel);
  if (open) {
    panel.hidden = false;
    gsap.fromTo(panel, { height: 0, opacity: 0 }, { height: 'auto', opacity: 1, duration: .45, ease: 'power3.out', clearProps: 'height' });
  } else {
    gsap.to(panel, { height: 0, opacity: 0, duration: .3, ease: 'power2.in', onComplete: () => { panel.hidden = true; gsap.set(panel, { clearProps: 'height,opacity' }); } });
  }
}

list.addEventListener('click', e => {
  const btn = /** @type {HTMLButtonElement | null} */ ((/** @type {HTMLElement} */ (e.target)).closest('.faq__q'));
  if (!btn) return;
  const open = btn.getAttribute('aria-expanded') !== 'true';
  list.querySelectorAll('.faq__q[aria-expanded="true"]').forEach(b => b !== btn && toggle(/** @type {HTMLButtonElement} */ (b), false));
  toggle(btn, open);
});

if (!reduced) gsap.from(list.children, { opacity: 0, y: 24, duration: .6, stagger: .05, ease: 'power3.out', scrollTrigger: { trigger: list, start: 'top 85%', once: true } });
