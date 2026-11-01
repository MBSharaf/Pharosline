// @ts-check
// Branded pop-up notification ("toast"). Used after an order or a review is sent.
// toast({ title, text, type: 'success' | 'error' })

import { t } from './i18n.js';

const gsap = /** @type {any} */ (window).gsap;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

const host = document.createElement('div');
host.className = 'toasts';
host.setAttribute('role', 'status');
host.setAttribute('aria-live', 'polite');
document.body.append(host);

const ICON = {
  success: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.2 4L19 7"/></svg>',
  error: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 7v6M12 16.8v.2"/></svg>',
};

/** @param {{ title: string, text?: string, type?: 'success' | 'error', duration?: number }} o */
export function toast({ title, text = '', type = 'success', duration = 6500 }) {
  const el = document.createElement('div');
  el.className = `toast toast--${type}`;
  el.innerHTML = `
    <span class="toast__lamp">${ICON[type]}</span>
    <div class="toast__body"><strong>${title}</strong>${text ? `<span>${text}</span>` : ''}</div>
    <button class="toast__close" type="button" aria-label="${t('Close notification', 'إغلاق الإشعار')}">×</button>
    <i class="toast__timer" aria-hidden="true"></i>`;
  host.append(el);

  let gone = false;
  const close = () => {
    if (gone) return; gone = true;
    if (reduced) return el.remove();
    gsap.to(el, { opacity: 0, y: -12, scale: .96, duration: .35, ease: 'power2.in', onComplete: () => el.remove() });
  };
  el.querySelector('.toast__close')?.addEventListener('click', close);

  if (!reduced) {
    gsap.fromTo(el, { opacity: 0, y: -24, scale: .94 }, { opacity: 1, y: 0, scale: 1, duration: .6, ease: 'back.out(1.6)' });
    gsap.fromTo(el.querySelector('.toast__lamp svg path'), { strokeDashoffset: 30 }, { strokeDashoffset: 0, duration: .5, delay: .3, ease: 'power2.out' });
  }
  const timer = /** @type {HTMLElement} */ (el.querySelector('.toast__timer'));
  timer.style.animationDuration = `${duration}ms`;
  // pause the countdown while the visitor hovers or focuses it
  let t = setTimeout(close, duration), left = duration, start = Date.now();
  el.addEventListener('pointerenter', () => { clearTimeout(t); left -= Date.now() - start; el.classList.add('is-paused'); });
  el.addEventListener('pointerleave', () => { start = Date.now(); t = setTimeout(close, left); el.classList.remove('is-paused'); });
  return close;
}
