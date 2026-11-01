// @ts-check
// Contact form: technical consultation or a website package (from pricing data),
// validation, and background submit to the Google Form (see api.js / form.config.js).
import { WEBSITES, formatPrice } from './pricing.data.js';
import { submitInquiry } from './api.js';
import { toast } from './toast.js';
import { t } from './i18n.js';

const gsap = /** @type {any} */ (window).gsap;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const form = /** @type {HTMLFormElement} */ (document.querySelector('[data-inquiry]'));
const pkgList = /** @type {HTMLElement} */ (form.querySelector('[data-pkglist]'));
const err = /** @type {HTMLElement} */ (form.querySelector('.inquiry__error'));
const submitLabel = t('SEND MY REQUEST', 'أرسل الطلب');

pkgList.innerHTML = `
  <label><input type="radio" name="package" value="consult">
    <span class="inquiry__pkg inquiry__pkg--consult"><b>${t('Technical consultation', 'استشارة فنية')}</b><small>${t('not sure yet', 'لم أحدد الباقة بعد')}</small>
    <em>${t('We recommend the right package', 'نرشّح لك الباقة الأنسب')}</em></span></label>` + WEBSITES.packages.map(p => `
  <label><input type="radio" name="package" value="${p.id}">
    <span class="inquiry__pkg"><b>${t(p.name, p.nameAr)}</b><small>${t('per project', 'للمشروع الواحد')}</small>
    <em>${formatPrice(p.after)} <s>${formatPrice(p.before)}</s></em></span></label>`).join('');

form.addEventListener('change', e => {
  if (/** @type {HTMLInputElement} */ (e.target).name === 'package') form.querySelector('.inquiry__pkgs')?.classList.remove('is-invalid');
});

// "Request this package" / "Book a consultation" buttons pre-select their option here
document.addEventListener('click', e => {
  const btn = /** @type {HTMLElement | null} */ ((/** @type {HTMLElement} */ (e.target)).closest('[data-request]'));
  if (!btn) return;
  const p = /** @type {HTMLInputElement | null} */ (pkgList.querySelector(`input[value="${btn.dataset.package}"]`));
  if (!p) return;
  p.checked = true;
  form.querySelector('.inquiry__pkgs')?.classList.remove('is-invalid');
  if (!reduced) gsap.fromTo(p.nextElementSibling, { scale: .94 }, { scale: 1, duration: .6, ease: 'elastic.out(1,.5)', delay: 1.1 });
});

form.addEventListener('submit', async e => {
  e.preventDefault();
  const fd = new FormData(form);
  const get = (/** @type {string} */ k) => String(fd.get(k) || '').trim();
  const data = { serviceId: 'websites', packageId: get('package'), name: get('name'), phone: get('phone').replace(/[\s-]/g, ''), email: get('email'), brand: get('brand'), idea: get('idea') };

  form.querySelectorAll('.is-invalid').forEach(x => x.classList.remove('is-invalid'));
  const bad = (/** @type {string} */ name) => form.querySelector(`[name=${name}]`)?.closest('.field')?.classList.add('is-invalid');
  const problems = [];
  if (!data.packageId) { problems.push(t('choose a consultation or a package', 'اختر الاستشارة أو إحدى الباقات')); form.querySelector('.inquiry__pkgs')?.classList.add('is-invalid'); }
  if (!data.name) { problems.push(t('add your name', 'أدخل اسمك')); bad('name'); }
  if (!/^\+?[0-9]{10,15}$/.test(data.phone)) { problems.push(t('add a WhatsApp number (10–15 digits)', 'أدخل رقم واتساب صحيحًا (من 10 إلى 15 رقمًا)')); bad('phone'); }
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) { problems.push(t('fix the email or leave it empty', 'صحّح البريد الإلكتروني أو اترك الحقل فارغًا')); bad('email'); }
  if (!data.brand) { problems.push(t('add your brand or company name', 'أدخل اسم العلامة التجارية أو الشركة')); bad('brand'); }
  if (problems.length) { err.hidden = false; err.textContent = t('To send your request, ', 'لإرسال طلبك: ') + problems.join(t(', ', '، ')) + t('.', '.'); return; }
  err.hidden = true;

  const btn = /** @type {HTMLButtonElement} */ (form.querySelector('button[type=submit]'));
  const label = /** @type {HTMLElement} */ (btn.querySelector('span'));
  btn.disabled = true; label.textContent = t('SENDING…', 'جارٍ الإرسال…');
  try {
    await submitInquiry(data);
    const chosen = /** @type {HTMLElement | null} */ (form.querySelector('input[name=package]:checked + .inquiry__pkg b'))?.textContent || '';
    toast({ title: t('Request sent', 'تم إرسال طلبك'), text: t(`We received your ${chosen ? chosen + ' ' : ''}request and will contact you on WhatsApp shortly.`, `استلمنا طلبك${chosen ? ' («' + chosen + '»)' : ''} وسيتواصل معك فريقنا عبر واتساب قريبًا.`) });
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
    btn.disabled = false; label.textContent = submitLabel;
    err.hidden = false; err.textContent = t("Your request didn't send — check your connection and try again.", 'تعذّر إرسال الطلب — تحقّق من اتصالك بالإنترنت وحاول مرة أخرى.');
    toast({ type: 'error', title: t("Your request didn't send", 'تعذّر إرسال الطلب'), text: t('Check your connection and try again, or message us on WhatsApp.', 'تحقّق من اتصالك بالإنترنت وحاول مرة أخرى، أو راسلنا عبر واتساب.') });
  }
});
