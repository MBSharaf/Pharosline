import { initHero } from './hero3d.js';
import { t } from './i18n.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const { gsap, ScrollTrigger } = window;
gsap.registerPlugin(ScrollTrigger);

/* ------------------------------------------------------------------
   Content — only Pharosline's real websites. "View screens" opens these.
------------------------------------------------------------------ */
const shot = (src, en, ar) => ({ type: 'image', src: `assets/work/${src}.jpg`, alt: t(en, ar) });
const GALLERIES = {
  idt: { title: 'IDT', cat: t('Website · Dental technology', 'موقع · تكنولوجيا الأسنان'),
    desc: t('Live at mbsharaf.github.io/IDT — interactive 3D machines, product catalog and inquiry forms.', 'شغّال على mbsharaf.github.io/IDT — موديلات 3D تفاعلية للماكينات، كتالوج منتجات، وفورم استفسار.'),
    gallery: [shot('idt-home', 'Home page', 'الصفحة الرئيسية'), shot('idt-workflow', 'The 4-step lab story', 'قصة المعمل في 4 خطوات'),
      shot('idt-products', 'Featured machines', 'الماكينات المميزة'), shot('idt-product-3d', 'Machine page with the 3D model', 'صفحة الماكينة بالموديل الـ 3D'),
      { type: 'video', src: 'assets/work/idt-3d.mp4', poster: 'assets/work/idt-3d.jpg' },
      shot('idt-mobile', 'On a phone', 'على الموبايل'), shot('idt-mobile-3d', '3D model on a phone', 'الموديل الـ 3D على الموبايل')] },
  super: { title: 'Super App', cat: t('Website · Sports booking platform', 'موقع · منصة حجز رياضية'),
    desc: t('Live at mbsharaf.github.io/super-app — pitch booking, players, tournaments, fantasy and a shop.', 'شغّال على mbsharaf.github.io/super-app — حجز ملاعب، لاعيبة، بطولات، فانتازي، ومتجر.'),
    gallery: [shot('super-home', 'Home page', 'الصفحة الرئيسية'), shot('super-pitches', 'Book a pitch', 'احجز ملعب'),
      shot('super-fantasy', 'Fantasy league', 'الفانتازي'), shot('super-shop', 'The shop', 'المتجر'),
      shot('super-mobile', 'On a phone', 'على الموبايل'), shot('super-mobile-fantasy', 'Fantasy on a phone', 'الفانتازي على الموبايل')] },
};

/* ------------------------------------------------------------------
   Smooth scroll
------------------------------------------------------------------ */
let lenis = null;
if (!reduced && window.Lenis) {
  lenis = new window.Lenis({ duration: 1.15, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(time => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();
}
const scrollTo = target => lenis
  ? lenis.scrollTo(target, {
      offset: 0, duration: 1.6,
      // if content above the target changed height mid-scroll (lazy media, reviews loading), finish exactly on it
      onComplete: () => {
        const el = typeof target === 'string' ? $(target) : target;
        if (el instanceof Element && Math.abs(el.getBoundingClientRect().top) > 2) lenis.scrollTo(el, { offset: 0, duration: .5 });
      },
    })
  : (typeof target === 'number' ? window.scrollTo({ top: target, behavior: reduced ? 'auto' : 'smooth' }) : $(target)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }));
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href');
  if (id.length < 2 || !$(id)) return;
  e.preventDefault();
  closeMenu();
  scrollTo(id === '#top' ? 0 : id);
});

// language switch: land on the same section in the other language
$$('[data-lang-link]').forEach(a => a.addEventListener('click', () => {
  const y = scrollY + innerHeight * .4;
  const here = $$('main section[id]').filter(s => s.offsetTop <= y).pop();
  a.href = a.getAttribute('href').split('#')[0] + (here ? '#' + here.id : '');
}));

/* ------------------------------------------------------------------
   Cursor + magnetic
------------------------------------------------------------------ */
const cursor = $('.cursor');
if (fine) {
  const dot = $('.cursor__dot'), ring = $('.cursor__ring'), label = $('.cursor__label');
  const dx = gsap.quickTo(dot, 'x', { duration: .08 }), dy = gsap.quickTo(dot, 'y', { duration: .08 });
  const rx = gsap.quickTo(ring, 'x', { duration: .45, ease: 'power3' }), ry = gsap.quickTo(ring, 'y', { duration: .45, ease: 'power3' });
  addEventListener('pointermove', e => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); });
  document.addEventListener('pointerover', e => {
    const el = e.target.closest('[data-cursor]');
    cursor.classList.toggle('has-label', !!el);
    if (el) label.textContent = el.dataset.cursor;
  });
  $$('[data-magnetic]').forEach(el => {
    const xTo = gsap.quickTo(el, 'x', { duration: .6, ease: 'elastic.out(1,.4)' }), yTo = gsap.quickTo(el, 'y', { duration: .6, ease: 'elastic.out(1,.4)' });
    el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * .3); yTo((e.clientY - r.top - r.height / 2) * .4); });
    el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  });
}

/* ------------------------------------------------------------------
   Mobile menu
------------------------------------------------------------------ */
const burger = $('.nav__burger');
function closeMenu() { document.body.classList.remove('menu-open'); burger.setAttribute('aria-expanded', 'false'); $('.menu').setAttribute('aria-hidden', 'true'); }
burger.addEventListener('click', () => {
  const open = document.body.classList.toggle('menu-open');
  burger.setAttribute('aria-expanded', open); $('.menu').setAttribute('aria-hidden', !open);
});

/* ------------------------------------------------------------------
   Hero 3D + intro
------------------------------------------------------------------ */
let hero = null;
try { hero = initHero($('.hero__gl'), { reduced }); } catch (err) { console.warn('WebGL unavailable', err); }

function intro() {
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  const count = $('[data-count]'), o = { v: 0 };
  tl.to('.loader__mark', { clipPath: 'inset(0% 0 0 0)', duration: 1.1, ease: 'power3.inOut' }, 0)
    .to(o, { v: 100, duration: 1.5, ease: 'power2.inOut', onUpdate: () => count.textContent = Math.round(o.v) }, 0)
    .to('.loader__bar i', { scaleX: 1, duration: 1.5, ease: 'power2.inOut' }, 0)
    .to('.loader', { clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'expo.inOut' }, 1.6)
    .from('.hero__line span', { yPercent: 105, duration: 1.4, stagger: .12 }, 2.0)
    .to(hero ? hero.state : {}, { intro: 1, duration: 2.4, ease: 'power3.out' }, 2.0)
    .from('.offer-tag', { y: 30, opacity: 0, rotate: -12, duration: 1.1 }, 2.3)
    .from('.hero__kicker, .hero__ar, .hero__lede', { y: 30, opacity: 0, duration: 1.1, stagger: .08 }, 2.4)
    .from('.hero__ctas .btn', { y: 30, opacity: 0, duration: 1.1, stagger: .08 }, 2.6)
    .from('.nav', { y: -30, opacity: 0, duration: 1 }, 2.5)
    .add(() => {
      document.body.classList.remove('is-loading'); lenis?.start(); $('.timeline').classList.add('is-on'); ScrollTrigger.refresh();
      // arrived with #section (e.g. from the language switch): the pins changed the page height, so land on it now
      const target = location.hash.length > 1 && $(location.hash);
      if (target) lenis ? lenis.scrollTo(target, { immediate: true }) : target.scrollIntoView();
    }, 2.6);
  if (reduced) tl.progress(1);
}
const kick = () => (document.fonts?.ready || Promise.resolve()).then(intro);
document.readyState === 'complete' ? kick() : addEventListener('load', kick);
$('.loader').style.clipPath = 'inset(0 0 0% 0)';

if (hero) {
  ScrollTrigger.create({ trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true, onUpdate: s => hero.setScroll(s.progress) });
}
gsap.to('.hero__type:not(.hero__type--lit) .hero__line--a', { xPercent: -14, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
gsap.to('.hero__type .hero__line--b', { xPercent: 10, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
gsap.to('.hero__type--lit .hero__line--a', { xPercent: -14, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
gsap.to('.hero__ui', { y: -80, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: '30% top', end: 'bottom top', scrub: true } });

/* ------------------------------------------------------------------
   Manifesto — words switch on like a filament as you scroll
------------------------------------------------------------------ */
const mText = $('[data-light-words]');
const norm = w => w.replace(/[^\p{L}\p{N}]/gu, '').toLowerCase();
const amberWords = new Set((mText.dataset.amber || '').split(/\s+/).map(norm));
mText.innerHTML = mText.textContent.trim().split(/\s+/).map(w => `<span class="w${amberWords.has(norm(w)) ? ' amb' : ''}">${w}</span>`).join(' ');
const words = $$('.w', mText);
ScrollTrigger.create({
  trigger: mText, start: 'top 80%', end: 'bottom 45%', scrub: true,
  onUpdate: s => {
    const n = Math.round(s.progress * words.length);
    words.forEach((w, i) => { const on = i < n; w.classList.toggle('is-lit', on && !w.classList.contains('amb')); w.classList.toggle('is-amber', on && w.classList.contains('amb')); });
  }
});

/* ------------------------------------------------------------------
   Videos — load near view, play only while on screen
------------------------------------------------------------------ */
{
  const load = v => { if (v.dataset.src && !v.getAttribute('src')) { if (v.dataset.poster) v.poster = v.dataset.poster; v.src = v.dataset.src; } };
  const near = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { load(e.target); near.unobserve(e.target); } }), { rootMargin: '900px 0px' });
  const onScreen = new IntersectionObserver(es => es.forEach(e => {
    const v = e.target;
    if (e.isIntersecting && !reduced) { load(v); v.play().catch(() => {}); } else v.pause();
  }), { threshold: .2 });
  $$('video[data-src]').forEach(v => { near.observe(v); if (v.hasAttribute('data-autoplay')) onScreen.observe(v); });
  // reduced motion: show posters, never autoplay
  if (reduced) $$('video[data-poster]').forEach(v => { v.poster = v.dataset.poster; });
}

/* ------------------------------------------------------------------
   Work — 3D devices: the laptop opens and turns, the phone and the
   3D card slide in, all scrubbed by scroll while the project is pinned
------------------------------------------------------------------ */
const shows = $$('[data-show]');
const mmShow = gsap.matchMedia();
mmShow.add({ desk: '(min-width: 1025px)', small: '(max-width: 1024px)', reduce: '(prefers-reduced-motion: reduce)' }, ctx => {
  const { desk, reduce } = ctx.conditions;
  shows.forEach(show => {
    const flip = show.classList.contains('show--flip') ? -1 : 1;
    const laptop = $('.laptop', show), lid = $('.laptop__lid', show), phone = $('.show__phone', show), float = $('.show__float', show);
    const copy = $$('.show__copy > *', show);
    if (reduce) return;
    if (desk) {
      const tl = gsap.timeline({ scrollTrigger: { trigger: show, start: 'top top', end: 'bottom bottom', scrub: 1 } });
      tl.fromTo(laptop, { rotateX: 30, rotateY: -34 * flip, rotateZ: 3 * flip, scale: .78, y: 60 }, { rotateX: 6, rotateY: -12 * flip, rotateZ: 0, scale: 1, y: 0, ease: 'power2.out', duration: .5 }, 0)
        .fromTo(lid, { rotateX: -92 }, { rotateX: 0, ease: 'power3.out', duration: .42 }, 0)
        .fromTo(copy, { y: 50, opacity: 0 }, { y: 0, opacity: 1, stagger: .03, duration: .25, ease: 'power2.out' }, .05)
        .fromTo(phone, { x: -160 * flip, y: 80, rotateY: 50 * flip, rotateZ: -8 * flip, opacity: 0 }, { x: 0, y: 0, rotateY: 16 * flip, rotateZ: 3 * flip, opacity: 1, ease: 'power3.out', duration: .35 }, .3)
        .fromTo(float, { y: 220, rotateX: 40, rotateZ: -12 * flip, opacity: 0 }, { y: 0, rotateX: 0, rotateZ: 5 * flip, opacity: 1, ease: 'power3.out', duration: .35 }, .42)
        .to(laptop, { rotateY: -4 * flip, rotateX: 2, duration: .3, ease: 'none' }, .7)
        .to(phone, { y: -40, duration: .3, ease: 'none' }, .7)
        .to(float, { y: -70, duration: .3, ease: 'none' }, .7);
      // the whole stage leans toward the cursor
      const stage = $('.show__stage', show);
      if (fine) {
        const ry = gsap.quickTo(stage, 'rotateY', { duration: 1, ease: 'power3' }), rx = gsap.quickTo(stage, 'rotateX', { duration: 1, ease: 'power3' });
        show.addEventListener('pointermove', e => { const r = stage.getBoundingClientRect(); ry(((e.clientX - r.left) / r.width - .5) * 10); rx(-((e.clientY - r.top) / r.height - .5) * 8); });
        show.addEventListener('pointerleave', () => { ry(0); rx(0); });
      }
    } else {
      gsap.timeline({ scrollTrigger: { trigger: $('.show__stage', show), start: 'top 90%', end: 'center 55%', scrub: 1 } })
        .fromTo(laptop, { rotateX: 34, rotateY: -22 * flip, scale: .86 }, { rotateX: 6, rotateY: -8 * flip, scale: 1, ease: 'power2.out' }, 0)
        .fromTo(lid, { rotateX: -92 }, { rotateX: 0, ease: 'power3.out' }, 0)
        .fromTo(phone, { x: -70 * flip, rotateY: 40 * flip, opacity: 0 }, { x: 0, rotateY: 12 * flip, opacity: 1, ease: 'power3.out' }, .3)
        .fromTo(float, { y: 90, rotateZ: 10 * flip, opacity: 0 }, { y: 0, rotateZ: -4 * flip, opacity: 1, ease: 'power3.out' }, .45);
      gsap.from(copy, { y: 40, opacity: 0, stagger: .06, duration: .8, ease: 'expo.out', scrollTrigger: { trigger: $('.show__copy', show), start: 'top 85%' } });
    }
  });
  const mini = $('.show-mini__frame');
  if (mini && !reduce) gsap.fromTo(mini, { rotateX: 24, rotateY: 18, y: 60 }, { rotateX: 4, rotateY: -6, y: 0, ease: 'none', scrollTrigger: { trigger: '.show-mini', start: 'top bottom', end: 'center center', scrub: 1 } });
});

/* ------------------------------------------------------------------
   Any website you need — cards deal in
------------------------------------------------------------------ */
if (!reduced) {
  ScrollTrigger.batch('.type', { start: 'top 88%', once: true, onEnter: els => gsap.fromTo(els, { y: 60, rotate: (i) => (i % 2 ? 3 : -3), opacity: 0 }, { y: 0, rotate: 0, opacity: 1, duration: .9, stagger: .07, ease: 'expo.out', clearProps: 'transform' }) });
  gsap.from('.includes__list li', { y: 30, opacity: 0, stagger: .08, duration: .8, ease: 'expo.out', scrollTrigger: { trigger: '.includes', start: 'top 85%' } });
}

/* ------------------------------------------------------------------
   Reels — muted while in view; the speaker turns sound on (one at a time)
------------------------------------------------------------------ */
{
  const reels = $$('[data-reel]');
  const vids = reels.map(r => $('video', r));
  const setSound = (i, on) => {
    vids.forEach((v, j) => {
      const s = j === i && on, btn = $('.reel-card__sound', reels[j]);
      v.muted = !s; reels[j].classList.toggle('has-sound', s);
      btn.setAttribute('aria-pressed', String(s));
      btn.setAttribute('aria-label', s ? t('Mute', 'اكتم الصوت') : t('Turn sound on', 'شغّل الصوت'));
    });
  };
  reels.forEach((r, i) => {
    const v = vids[i];
    $('.reel-card__sound', r).addEventListener('click', () => {
      if (!v.getAttribute('src')) { v.poster = v.dataset.poster; v.src = v.dataset.src; }
      setSound(i, v.muted); v.play().catch(() => {});
    });
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !reduced) { if (!v.getAttribute('src')) { v.poster = v.dataset.poster; v.src = v.dataset.src; } v.play().catch(() => {}); }
      else { v.pause(); if (!v.muted) setSound(i, false); }
    }, { threshold: .35 }).observe(r);
  });
  if (!reduced) gsap.fromTo('.reel-card__phone', { rotateY: i => (i ? -28 : 28), rotateX: 14, y: 80 }, { rotateY: i => (i ? -8 : 8), rotateX: 0, y: 0, ease: 'none', scrollTrigger: { trigger: '.reels__row', start: 'top bottom', end: 'center center', scrub: 1 } });
}

/* ------------------------------------------------------------------
   Process — scroll scrubs a playhead across five clips
------------------------------------------------------------------ */
const clipsEl = $('.process__clips'), clips = $$('.clip');
const mmP = gsap.matchMedia();
mmP.add('(min-width: 0px)', () => {
  const dist = () => clipsEl.scrollWidth - innerWidth;
  gsap.to(clipsEl, {
    x: () => -dist(), ease: 'none',
    scrollTrigger: {
      trigger: '.process', start: 'top top', end: 'bottom bottom', scrub: reduced ? true : 1, invalidateOnRefresh: true,
      onUpdate: s => {
        const p = s.progress;
        $('[data-proc-bar]').style.transform = `scaleX(${p})`;
        const secs = Math.round(p * 300);
        $('[data-proc-tc]').textContent = `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`;
        const idx = Math.min(clips.length - 1, Math.floor(p * clips.length));
        clips.forEach((c, i) => c.classList.toggle('is-on', i === idx));
      }
    }
  });
});
clips[0].classList.add('is-on');

/* ------------------------------------------------------------------
   About — tilt + section reveals
------------------------------------------------------------------ */
const tilt = $('[data-tilt]');
if (!reduced) {
  gsap.fromTo(tilt, { rotateY: -18, rotateX: 10, y: 80 }, { rotateY: 6, rotateX: -4, y: -40, ease: 'none', scrollTrigger: { trigger: '.about', start: 'top bottom', end: 'bottom top', scrub: true } });
  $$('.sec-head .display, .about .display').forEach(h => {
    gsap.from(h, { yPercent: 40, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: h, start: 'top 85%' } });
  });
  gsap.from('.proof__item strong', { yPercent: 60, opacity: 0, stagger: .1, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.proof', start: 'top 85%' } });
  gsap.from('.contact__title span', { yPercent: 50, opacity: 0, stagger: .12, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: '.contact', start: 'top 70%' } });
  gsap.fromTo('.foot__word', { letterSpacing: '.4em' }, { letterSpacing: '.08em', ease: 'none', scrollTrigger: { trigger: '.foot', start: 'top bottom', end: 'bottom bottom', scrub: true } });
}

/* ------------------------------------------------------------------
   Timeline HUD — the page as an edit
------------------------------------------------------------------ */
const chapters = $$('[data-chapter]');
const clipsBar = $('.timeline__clips');
function buildTimeline() {
  const H = document.documentElement.scrollHeight;
  clipsBar.innerHTML = chapters.map((c, i) => `<button style="--w:${c.offsetHeight / H}" aria-label="${t('Go to', 'روح لـ')} ${c.dataset.chapter}" data-ch="${i}"></button>`).join('');
}
clipsBar.addEventListener('click', e => { const b = e.target.closest('button'); if (b) scrollTo(chapters[+b.dataset.ch]); });
ScrollTrigger.addEventListener('refresh', buildTimeline);
const head = $('.timeline__head'), track = $('.timeline__track');
ScrollTrigger.create({
  start: 0, end: 'max',
  onUpdate: s => {
    head.style.transform = `translateX(${s.progress * track.clientWidth}px)`;
    const fps = 25, totalFrames = 3 * 60 * fps, f = Math.round(s.progress * totalFrames);
    $('[data-tc]').textContent = `${String(Math.floor(f / fps / 60)).padStart(2, '0')}:${String(Math.floor(f / fps) % 60).padStart(2, '0')}:${String(f % fps).padStart(2, '0')}`;
    const y = scrollY + innerHeight * .5;
    let cur = 0; chapters.forEach((c, i) => { if (c.offsetTop <= y) cur = i; });
    $('[data-scene]').textContent = chapters[cur].dataset.chapter;
    $$('button', clipsBar).forEach((b, i) => b.classList.toggle('is-on', i === cur));
  }
});

$('[data-year]').textContent = new Date().getFullYear();
addEventListener('load', () => ScrollTrigger.refresh());

// Floating WhatsApp lamp turns black while it sits over the amber footer
const waBtns = $$('.wa'), foot = $('.foot');
if (foot) new IntersectionObserver(([e]) => waBtns.forEach(b => b.classList.toggle('on-amber', e.isIntersecting)), { rootMargin: '0px 0px -70px 0px' }).observe(foot);

/* ------------------------------------------------------------------
   Project viewer — "View screens" opens the real screenshots
------------------------------------------------------------------ */
const viewer = document.createElement('div');
viewer.className = 'viewer'; viewer.hidden = true;
viewer.setAttribute('role', 'dialog'); viewer.setAttribute('aria-modal', 'true'); viewer.setAttribute('aria-labelledby', 'viewer-title');
viewer.innerHTML = `
  <div class="viewer__bar">
    <div><h2 id="viewer-title" class="viewer__title"></h2><p class="viewer__cat"></p></div>
    <button class="viewer__close" data-cursor="${t('Close', 'اقفل')}">${t('Close', 'اقفل')}</button>
  </div>
  <div class="viewer__stage" data-lenis-prevent></div>
  <div class="viewer__foot">
    <p class="viewer__desc"></p>
    <div class="viewer__nav"><button class="viewer__prev" aria-label="${t('Previous', 'السابق')}">←</button><span class="viewer__count"></span><button class="viewer__next" aria-label="${t('Next', 'التالي')}">→</button></div>
  </div>`;
document.body.append(viewer);
let vItem = null, vIdx = 0, vFrom = null;
function vRender() {
  const m = vItem.gallery[vIdx], stage = $('.viewer__stage', viewer);
  stage.innerHTML = m.type === 'video'
    ? `<video src="${m.src}"${m.poster ? ` poster="${m.poster}"` : ''} muted autoplay loop playsinline></video>`
    : `<img src="${m.src}" alt="${vItem.title} — ${m.alt}">`;
  $('.viewer__count', viewer).textContent = `${vIdx + 1} / ${vItem.gallery.length}${m.alt ? ' · ' + m.alt : ''}`;
  if (!reduced) gsap.fromTo(stage.firstElementChild, { opacity: 0, y: 24, scale: .97 }, { opacity: 1, y: 0, scale: 1, duration: .5, ease: 'expo.out' });
}
function openGallery(key, from) {
  vItem = GALLERIES[key]; vIdx = 0; vFrom = from;
  $('.viewer__title', viewer).textContent = vItem.title;
  $('.viewer__cat', viewer).textContent = vItem.cat;
  $('.viewer__desc', viewer).textContent = vItem.desc;
  viewer.hidden = false; lenis?.stop(); document.body.style.overflow = 'hidden';
  vRender();
  gsap.fromTo(viewer, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: reduced ? 0 : .9, ease: 'expo.inOut' });
  $('.viewer__close', viewer).focus({ preventScroll: true });
}
function closeWork() {
  $$('video', viewer).forEach(v => v.pause());
  gsap.to(viewer, { clipPath: 'inset(0 0 100% 0)', duration: reduced ? 0 : .7, ease: 'expo.inOut', onComplete: () => {
    viewer.hidden = true; $('.viewer__stage', viewer).innerHTML = ''; document.body.style.overflow = ''; lenis?.start(); vFrom?.focus({ preventScroll: true });
  } });
}
const vStep = d => { vIdx = (vIdx + d + vItem.gallery.length) % vItem.gallery.length; vRender(); };
$$('[data-gallery]').forEach(b => b.addEventListener('click', () => openGallery(b.dataset.gallery, b)));
$('.viewer__close', viewer).addEventListener('click', closeWork);
$('.viewer__prev', viewer).addEventListener('click', () => vStep(-1));
$('.viewer__next', viewer).addEventListener('click', () => vStep(1));
addEventListener('keydown', e => {
  if (viewer.hidden) return;
  const rtl = document.dir === 'rtl';
  if (e.key === 'Escape') closeWork();
  if (e.key === 'ArrowRight') vStep(rtl ? -1 : 1);
  if (e.key === 'ArrowLeft') vStep(rtl ? 1 : -1);
});

// Phones/tablets: floating WhatsApp button would cover the pricing cards — hide it while the cards are on screen
{
  const phone = matchMedia('(max-width: 1024px)');
  let onGrid = false;
  const apply = () => $$('.wa').forEach(b => b.classList.toggle('is-aside', phone.matches && onGrid));
  // pricing cards, FAQ answers and the two forms sit under the floating buttons on small screens
  const covered = new Set();
  const io = new IntersectionObserver(es => { es.forEach(e => e.isIntersecting ? covered.add(e.target) : covered.delete(e.target)); onGrid = covered.size > 0; apply(); }, { rootMargin: '-15% 0px -15% 0px' });
  [$('[data-pgrid]'), $('[data-faq-list]'), $('[data-review-form]'), $('[data-reviews-grid]'), $('[data-inquiry]')].forEach(el => el && io.observe(el));
  phone.addEventListener?.('change', apply);
}

// Back-to-top lamp: appears once the visitor has scrolled past the hero
{
  const top = $('.wa--top');
  if (top) ScrollTrigger.create({ start: () => innerHeight * .9, end: 'max', onToggle: s => top.classList.toggle('is-shown', s.isActive) });
  // past the hero the nav gets a solid strip (its blend mode would turn it blue over amber)
  ScrollTrigger.create({ start: () => innerHeight * .9, end: 'max', onToggle: s => $('.nav').classList.toggle('is-solid', s.isActive) });
}

// Keep the non-blended logo lamp exactly over the logo's lamp block
{
  const fix = $('.nav__lampfix'), mark = $('.nav__mark');
  const place = () => {
    const r = mark.getBoundingClientRect(), s = r.width / 1932; // logo artboard units
    Object.assign(fix.style, { left: `${r.left + 1133 * s}px`, top: `${r.top + 1245 * s}px`, width: `${449 * s}px`, height: `${308 * s}px` });
  };
  if (fix && mark) { place(); addEventListener('resize', place); document.fonts?.ready.then(place); setTimeout(place, 3500); }
}
