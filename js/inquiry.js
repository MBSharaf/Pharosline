// @ts-check
// "Have a project in mind?" form: service → package picker (from pricing data),
// validation, and background submit to the Google Form (see api.js / form.config.js).
import { SERVICES, packagesFor, formatPrice } from './pricing.data.js';
import { submitInquiry } from './api.js';
import { toast } from './toast.js';

const gsap = /** @type {any} */ (window).gsap;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const form = /** @type {HTMLFormElement} */ (document.querySelector('[data-inquiry]'));
const pkgBox = /** @type {HTMLElement} */ (form.querySelector('[data-pkgs]'));
const pkgList = /** @type {HTMLElement} */ (form.querySelector('[data-pkglist]'));
const err = /** @type {HTMLElement} */ (form.querySelector('.inquiry__error'));

/** @param {string} serviceId */
function renderPackages(serviceId) {
  const s = SERVICES.find(x => x.id === serviceId);
  if (!s) return;
  const groups = s.billingAware ? /** @type {const} */ (['weekly', 'monthly']) : [/** @type {const} */ ('monthly')];
  pkgList.innerHTML = groups.map(b => `
    ${s.billingAware ? `<p class="inquiry__group">${b === 'weekly' ? 'Weekly' : 'Monthly'}</p>` : ''}
    ${packagesFor(s, b).map(p => `
      <label><input type="radio" name="package" value="${b}:${p.id}">
        <span class="inquiry__pkg"><b>${p.name}</b><small>${s.billingAware ? (b === 'weekly' ? 'per week' : 'per month') : 'per project'}</small>
        <em>${formatPrice(p.after)} <s>${formatPrice(p.before)}</s></em></span></label>`).join('')}`).join('');
  pkgBox.hidden = false;
  if (!reduced) gsap.fromTo(pkgList.children, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: .4, stagger: .04, ease: 'power3.out' });
}

form.addEventListener('change', e => {
  const t = /** @type {HTMLInputElement} */ (e.target);
  if (t.name === 'service') { renderPackages(t.value); form.querySelector('.inquiry__types')?.classList.remove('is-invalid'); }
});

// "Request this package" buttons in Pricing pre-select service + package here
document.addEventListener('click', e => {
  const btn = /** @type {HTMLElement | null} */ ((/** @type {HTMLElement} */ (e.target)).closest('[data-request]'));
  if (!btn) return;
  const { service = '', package: pkg, billing } = btn.dataset;
  const radio = /** @type {HTMLInputElement | null} */ (form.querySelector(`input[name=service][value="${service}"]`));
  if (!radio) return;
  radio.checked = true;
  renderPackages(service);
  const p = /** @type {HTMLInputElement | null} */ (pkgList.querySelector(`input[value="${billing}:${pkg}"]`));
  if (p) {
    p.checked = true;
    if (!reduced) gsap.fromTo(p.nextElementSibling, { scale: .94 }, { scale: 1, duration: .6, ease: 'elastic.out(1,.5)', delay: 1.1 });
  }
});

form.addEventListener('submit', async e => {
  e.preventDefault();
  const fd = new FormData(form);
  const get = (/** @type {string} */ k) => String(fd.get(k) || '').trim();
  const [billing, packageId] = get('package').split(':');
  const data = { serviceId: get('service'), packageId, billing, name: get('name'), phone: get('phone').replace(/[\s-]/g, ''), email: get('email'), brand: get('brand'), idea: get('idea') };

  form.querySelectorAll('.is-invalid').forEach(x => x.classList.remove('is-invalid'));
  const bad = (/** @type {string} */ name) => form.querySelector(`[name=${name}]`)?.closest('.field')?.classList.add('is-invalid');
  const problems = [];
  if (!data.serviceId) { problems.push('choose a service'); form.querySelector('.inquiry__types')?.classList.add('is-invalid'); }
  else if (!packageId) problems.push('choose a package');
  if (!data.name) { problems.push('add your name'); bad('name'); }
  if (!/^\+?[0-9]{10,15}$/.test(data.phone)) { problems.push('add a WhatsApp number (10–15 digits)'); bad('phone'); }
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) { problems.push('fix the email or leave it empty'); bad('email'); }
  if (!data.brand) { problems.push('add your brand or company name'); bad('brand'); }
  if (problems.length) { err.hidden = false; err.textContent = 'To send your request, ' + problems.join(', ') + '.'; return; }
  err.hidden = true;

  const btn = /** @type {HTMLButtonElement} */ (form.querySelector('button[type=submit]'));
  const label = /** @type {HTMLElement} */ (btn.querySelector('span'));
  btn.disabled = true; label.textContent = 'SENDING…';
  try {
    await submitInquiry(data);
    const chosen = /** @type {HTMLElement | null} */ (form.querySelector('input[name=package]:checked + .inquiry__pkg b'))?.textContent || '';
    toast({ title: 'Request sent', text: `We received your ${chosen ? chosen + ' ' : ''}request and will contact you on WhatsApp very soon.` });
    const done = /** @type {HTMLElement} */ (document.querySelector('.inquiry__done'));
    const show = () => {
      form.hidden = true; done.hidden = false;
      if (!reduced) {
        gsap.from(done.children, { y: 40, opacity: 0, stagger: .1, duration: 1, ease: 'expo.out' });
        gsap.from('.inquiry__mark', { rotate: -90, scale: .4, duration: 1.4, ease: 'elastic.out(1,.5)' });
      }
    };
    reduced ? show() : gsap.to(form, { opacity: 0, y: -30, duration: .5, onComplete: show });
  } catch {
    btn.disabled = false; label.textContent = 'START A PROJECT';
    err.hidden = false; err.textContent = "Your request didn't send — check your connection and try again.";
    toast({ type: 'error', title: "Your request didn't send", text: 'Check your connection and try again, or message us on WhatsApp.' });
  }
});
