import { initHero } from './hero3d.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const { gsap, ScrollTrigger } = window;
gsap.registerPlugin(ScrollTrigger);

/* ------------------------------------------------------------------
   Content — only Pharosline's real material.
------------------------------------------------------------------ */
const SCENES = [
  { src: 'assets/video/scene-1.mp4', dur: 6, name: 'The noise', note: 'A phone buried under a pile of torn photos, film strips and scribbles — the feed everyone lives in.' },
  { src: 'assets/video/scene-2.mp4', dur: 4, name: 'Clear the page', note: 'One amber brush stroke wipes the frame clean, arrows pulling focus to the centre.' },
  { src: 'assets/video/scene-3.mp4', dur: 4, name: 'The idea', note: 'A halftone profile with an amber lightbulb — the moment the idea switches on.' },
  { src: 'assets/video/scene-4.mp4', dur: 4, name: 'What we make', note: 'Videos, ads, websites, design and content plans, each on its own torn card.' },
  { src: 'assets/video/scene-5.mp4', dur: 6, name: 'Every format', note: 'Taped frames for YouTube, social, ads, reels and documents.' },
  { src: 'assets/video/scene-6.mp4', dur: 6, name: 'On the timeline', note: 'A stack of collage cards circled in amber, with the edit playhead running beneath.' },
  { src: 'assets/video/scene-7.mp4', dur: 6, name: 'Light it up', note: 'A halftone sunburst behind the brush stroke — the idea starts to shine.' },
  { src: 'assets/video/scene-8.mp4', dur: 6, name: 'Pharosline', note: 'The P mark and wordmark resolve on paper. خلّي فكرتك تنوّر.' },
];

// Selected work — real Pharosline projects (mirrors what's shown in "What we make").
// gallery: what opens in the viewer. case: true opens the brand-intro case study instead.
const WORK = [
  { id: 'showreel', size: 'xl', cats: ['motion'], title: 'Pharosline showreel', cat: 'Motion · 2026 reel',
    desc: 'Social posts, ad campaigns, motion and identity work, cut into one 35-second reel.',
    img: 'assets/showreel/poster.jpg', video: 'assets/showreel/pharosline_showreel_720p.mp4', badge: 'Watch with sound',
    gallery: [{ type: 'video', src: 'assets/showreel/pharosline_showreel_1080p.mp4', poster: 'assets/showreel/poster.jpg', sound: true }] },
  { id: 'reel-collage', size: 'v', cats: ['reels'], title: 'Collage reel', cat: 'Reel · 9:16',
    desc: 'A vertical cut in our paper-collage style, made for the scroll.',
    video: 'assets/video/Pharosline_3_collage.mp4',
    gallery: [{ type: 'video', src: 'assets/video/Pharosline_3_collage.mp4', vertical: true }] },
  { id: 'fitme', size: 'l', cats: ['websites'], title: 'Fitme brand website', cat: 'Website · Design + build',
    desc: 'A brand website for Fitme: bold product sections, smooth scrolling and motion from the first screen.',
    video: 'assets/video/fitme-website.mp4', badge: 'Live walkthrough',
    gallery: [{ type: 'video', src: 'assets/video/fitme-website.mp4' }] },  { id: 'meta-ads', size: 'l', cats: ['ads'], title: 'Meta ad campaigns', cat: 'Advertising · Results',
    desc: '8 campaigns, 4,100+ messaging conversations, EGP 2.09 average cost per conversation. Brand names hidden.',
    img: 'assets/img/ads-collage-1.jpg', badge: 'Real results',
    gallery: [{ type: 'image', src: 'assets/img/ads-collage-1.jpg' }, { type: 'image', src: 'assets/img/ads-collage-2.jpg' }, { type: 'image', src: 'assets/img/ads-collage-3.jpg' }] },
  { id: 'october', size: '', cats: ['motion'], title: 'October War 1973', cat: 'Motion graphic video',
    desc: 'A halftone archive story: the 1973 crossing and the Zamalek cup, told in 19 seconds.',
    img: 'assets/video/october-war-poster.jpg', video: 'assets/video/october-war-card.mp4',
    gallery: [{ type: 'video', src: 'assets/video/october-war-card.mp4', poster: 'assets/video/october-war-poster.jpg' }] },
  { id: 'roaming', size: '', cats: ['documents'], title: 'Roaming guide', cat: 'Presentation · 4 pages',
    desc: 'Airplane mode, data roaming, international numbers and SIM checks — explained page by page.',
    img: 'assets/img/docs-3-airplane-mode.jpg',
    gallery: ['docs-3-airplane-mode', 'pdf-image-2-data-roaming', 'pdf-image-3-intl-number', 'docs-4-hlr-view'].map(n => ({ type: 'image', src: `assets/img/${n}.jpg` })) },
  { id: 'dental', size: '', cats: ['ads'], title: 'Dental lab equipment posts', cat: 'Social media design',
    desc: 'A product post series for a dental technology importer — one machine, one bold Arabic headline per post.',
    img: 'assets/img/docs-2-idt-scanner.jpg', imgPos: 'center 35%',
    gallery: [{ type: 'image', src: 'assets/img/docs-2-idt-scanner.jpg' }] },
  { id: 'reel-saas', size: 'v', cats: ['reels'], title: 'Product reel', cat: 'Reel · 9:16',
    desc: 'A fast vertical product reel, built for short-form feeds.',
    video: 'assets/video/Pharosline_4_saas.mp4',
    gallery: [{ type: 'video', src: 'assets/video/Pharosline_4_saas.mp4', vertical: true }] },
  { id: 'october-cover', size: 'xl', cats: ['documents'], title: 'October 1973 cover', cat: 'Editorial design',
    desc: 'A collage cover: the year in halftone, a radio, a football and the crowd.',
    img: 'assets/img/docs-1-october-1973.jpg',
    gallery: [{ type: 'image', src: 'assets/img/docs-1-october-1973.jpg' }] },
  { id: 'intro', size: 'l', cats: ['branding', 'motion'], title: 'Pharosline brand intro', cat: 'Identity + motion film',
    desc: 'Our own launch: the P mark, key visual and an 8-scene brand film.',
    img: 'assets/img/f1-collage.jpg', video: 'assets/video/scene-1.mp4', badge: 'Case study', case: true },
  { id: 'mark', size: 'l', cats: ['branding'], title: 'The P mark', cat: 'Brand identity',
    desc: 'A heavy P whose amber block works as the lamp of a lighthouse.',
    img: 'assets/img/mark.jpg',
    gallery: [{ type: 'image', src: 'assets/img/mark.jpg' }, { type: 'image', src: 'assets/img/keyvisual.jpg' }] },
];

/* ------------------------------------------------------------------
   Smooth scroll
------------------------------------------------------------------ */
let lenis = null;
if (!reduced && window.Lenis) {
  lenis = new window.Lenis({ duration: 1.15, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
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
    .from('.hero__kicker, .hero__ar, .hero__lede', { y: 30, opacity: 0, duration: 1.1, stagger: .08 }, 2.4)
    .from('.hero__ctas .btn', { y: 30, opacity: 0, duration: 1.1, stagger: .08 }, 2.6)
    .from('.nav', { y: -30, opacity: 0, duration: 1 }, 2.5)
    .add(() => { document.body.classList.remove('is-loading'); lenis?.start(); $('.timeline').classList.add('is-on'); ScrollTrigger.refresh(); }, 2.6);
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
const amberWords = new Set(['signal', 'signal:', 'idea']);
mText.innerHTML = mText.textContent.trim().split(/\s+/).map(w => `<span class="w${amberWords.has(w.toLowerCase().replace(/[^a-z:]/g, '')) ? ' amb' : ''}">${w}</span>`).join(' ');
const words = $$('.w', mText);
ScrollTrigger.create({
  trigger: mText, start: 'top 80%', end: 'bottom 45%', scrub: true,
  onUpdate: s => {
    const n = Math.round(s.progress * words.length);
    words.forEach((w, i) => { const on = i < n; w.classList.toggle('is-lit', on && !w.classList.contains('amb')); w.classList.toggle('is-amber', on && w.classList.contains('amb')); });
  }
});

/* ------------------------------------------------------------------
   Showreel — one film with music; the visitor starts it (no autoplay)
------------------------------------------------------------------ */
const reelVideo = $('.reel__video'), reel = $('.reel');
const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
// the original segmented scrubber: the film split into equal parts that fill as it plays
const reelBar = $('[data-reel-bar]'), PARTS = 8;
reelBar.innerHTML = Array.from({ length: PARTS }, (_, i) => `<button style="--d:1" aria-label="Jump to part ${i + 1}" data-i="${i}"></button>`).join('');
const partBtns = $$('button', reelBar);
reelVideo.addEventListener('timeupdate', () => {
  const d = reelVideo.duration || 0, p = d ? reelVideo.currentTime / d * PARTS : 0;
  partBtns.forEach((b, i) => b.style.setProperty('--p', Math.min(1, Math.max(0, p - i)).toFixed(3)));
  $('[data-reel-tc]').textContent = `${fmt(reelVideo.currentTime)} / ${fmt(d)}`;
});
reelVideo.addEventListener('loadedmetadata', () => { $('[data-reel-tc]').textContent = `00:00 / ${fmt(reelVideo.duration)}`; });
reelBar.addEventListener('click', e => {
  const b = e.target.closest('button');
  if (b && reelVideo.duration) { reelVideo.currentTime = +b.dataset.i / PARTS * reelVideo.duration; reelVideo.play().catch(() => {}); }
});
// plays muted on its own; the amber button (or the native controls) turns the sound on
reelVideo.addEventListener('volumechange', () => reel.classList.toggle('is-playing', !reelVideo.muted));
$('.reel__play').addEventListener('click', e => { e.stopPropagation(); reelVideo.muted = false; reelVideo.play().catch(() => {}); });
ScrollTrigger.create({ trigger: reel, start: 'top 60%', end: 'bottom 20%', onEnter: () => reelVideo.play().catch(() => {}), onEnterBack: () => reelVideo.play().catch(() => {}) });// pause when the visitor scrolls away
ScrollTrigger.create({ trigger: reel, start: 'top bottom', end: 'bottom top', onLeave: () => reelVideo.pause(), onLeaveBack: () => reelVideo.pause() });
// widest the showreel can be while the whole 16:9 frame + its scrubber still fits on screen
const reelMaxW = () => (innerHeight - 120) * 16 / 9;
if (!reduced) {
  const mm = gsap.matchMedia();
  mm.add('(min-width: 721px)', () => {
    gsap.timeline({ scrollTrigger: { trigger: reel, start: 'top top', end: 'bottom bottom', scrub: 1, invalidateOnRefresh: true } })
      .fromTo('.reel__frame', { rotateX: 24, rotateY: -18, rotateZ: 4 }, { rotateX: 0, rotateY: 0, rotateZ: 0, ease: 'power2.out', duration: .5 }, 0)
      .fromTo('.reel__stage', { width: () => Math.min(innerWidth * .46, reelMaxW()) }, { width: () => Math.min(innerWidth * .92, reelMaxW()), ease: 'power2.inOut', duration: .6 }, 0)
      .to('.reel__heading', { opacity: 0, y: -60, duration: .3 }, .2)
      .to('.reel__stage', { y: 0, duration: .4 }, .6);
  });
  mm.add('(max-width: 720px)', () => {
    gsap.fromTo('.reel__frame', { rotateX: 20, rotateZ: 3 }, { rotateX: 0, rotateZ: 0, scrollTrigger: { trigger: reel, start: 'top top', end: '40% top', scrub: 1 } });
  });
}

/* ------------------------------------------------------------------
   Services — tabs with per-craft scenes
------------------------------------------------------------------ */
const svcTabs = $$('[data-svc]'), panels = $$('[data-panel]');
function showSvc(i) {
  svcTabs.forEach((t, j) => t.setAttribute('aria-selected', j === i));
  panels.forEach((p, j) => {
    const on = j === i;
    p.classList.toggle('is-active', on);
    $$('video', p).forEach(v => on ? v.play().catch(() => {}) : v.pause());
    if (on && !reduced) {
      gsap.fromTo(p.firstElementChild, { opacity: 0, y: 60, rotateX: -25, scale: .92 }, { opacity: 1, y: 0, rotateX: 0, scale: 1, duration: 1.1, ease: 'expo.out', clearProps: 'transform' });
    }
  });
}
svcTabs.forEach((t, i) => {
  t.addEventListener('click', () => showSvc(i));
  if (fine) t.addEventListener('pointerenter', () => showSvc(i));
  t.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); const n = (i + (e.key === 'ArrowDown' ? 1 : -1) + svcTabs.length) % svcTabs.length; svcTabs[n].focus(); showSvc(n); }
  });
});
let svcPicked = false;
svcTabs.forEach(t => t.addEventListener('click', () => { svcPicked = true; }));
ScrollTrigger.create({ trigger: '.services', start: 'top 70%', once: true, onEnter: () => { if (!svcPicked) showSvc(0); } });
// stage leans toward the cursor
const stage = $('.services__stage');
if (fine && !reduced) stage.addEventListener('pointermove', e => {
  const r = stage.getBoundingClientRect();
  gsap.to(stage, { rotateY: ((e.clientX - r.left) / r.width - .5) * 8, rotateX: -((e.clientY - r.top) / r.height - .5) * 8, duration: 1, ease: 'power3' });
});

/* ------------------------------------------------------------------
   Selected work
------------------------------------------------------------------ */
const grid = $('[data-work-grid]');
grid.innerHTML = WORK.map(w => `
  <article class="card ${w.size ? 'card--' + w.size : ''}" data-cats="${w.cats.join(' ')}" data-id="${w.id}" tabindex="0" role="button" aria-label="${w.title} — ${w.case ? 'open case study' : 'view project'}" data-cursor="${w.video ? 'Play' : 'View'}">
    <div class="card__media">
      ${w.img ? `<img src="${w.img}" alt="" loading="lazy"${w.imgPos ? ` style="object-position:${w.imgPos}"` : ''}>` : ''}
      ${w.video ? `<video src="${w.video}${w.img ? '' : '#t=0.6'}" muted loop playsinline preload="${w.img ? 'none' : 'metadata'}"${w.img ? '' : ' class="is-poster"'}></video>` : ''}
      ${w.badge ? `<span class="card__badge">${w.badge}</span>` : ''}
      <i class="card__wipe"></i>
    </div>
    <div class="card__info"><h3 class="card__title">${w.title}</h3><span class="card__cat">${w.cat}</span><p class="card__desc">${w.desc}</p></div>
  </article>`).join('');
const cards = $$('.card', grid);
cards.forEach(c => {
  const v = $('video', c), media = $('.card__media', c);
  c.addEventListener('pointerenter', () => v?.play().catch(() => {}));
  c.addEventListener('pointerleave', () => { v?.pause(); gsap.to(media, { rotateX: 0, rotateY: 0, duration: .8, ease: 'power3' }); });
  if (fine && !reduced) c.addEventListener('pointermove', e => {
    const r = media.getBoundingClientRect();
    gsap.to(media, { rotateY: ((e.clientX - r.left) / r.width - .5) * 10, rotateX: -((e.clientY - r.top) / r.height - .5) * 10, duration: .6, ease: 'power3' });
  });
  c.addEventListener('click', () => openWork(c));
  c.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openWork(c); } });
});
// touch devices: play cards while they're centred
if (!fine) cards.forEach(c => ScrollTrigger.create({ trigger: c, start: 'top 60%', end: 'bottom 40%', onToggle: s => { const v = $('video', c); if (!v) return; s.isActive ? v.play().catch(() => {}) : v.pause(); c.classList.toggle('is-playing', s.isActive); } }));

// counts on filters
$$('.filters button').forEach(b => {
  const f = b.dataset.filter, n = f === 'all' ? WORK.length : WORK.filter(w => w.cats.includes(f)).length;
  b.insertAdjacentHTML('beforeend', `<sup>${n}</sup>`);
});
function reveal(els) {
  if (reduced) return;
  els.forEach((c, i) => {
    const wipe = $('.card__wipe', c);
    gsap.timeline({ delay: i * .07 })
      .fromTo(wipe, { scaleY: 0, transformOrigin: 'bottom' }, { scaleY: 1, duration: .45, ease: 'power3.in' })
      .set(wipe, { transformOrigin: 'top' })
      .to(wipe, { scaleY: 0, duration: .6, ease: 'power3.out' })
      .fromTo(c, { y: 40 }, { y: 0, duration: 1, ease: 'expo.out' }, 0);
  });
}
$('.filters').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  $$('.filters button').forEach(x => x.classList.toggle('is-on', x === b));
  const f = b.dataset.filter;
  const shown = cards.filter(c => f === 'all' || c.dataset.cats.split(' ').includes(f));
  cards.forEach(c => c.classList.toggle('is-hidden', !shown.includes(c)));
  $('.work__empty').hidden = shown.length > 0;
  if (!shown.length && !reduced) gsap.fromTo('.work__empty', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .8, ease: 'expo.out' });
  reveal(shown);
  ScrollTrigger.refresh();
});
ScrollTrigger.batch(cards, { start: 'top 88%', once: true, onEnter: reveal });

/* ------------------------------------------------------------------
   Case study overlay
------------------------------------------------------------------ */
const caseEl = $('.case');
$('[data-case-scenes]').innerHTML = SCENES.map((s, i) => `
  <figure><video src="${s.src}" muted loop playsinline preload="none"></video>
  <figcaption><b>${String(i + 1).padStart(2, '0')} ${s.name}</b>${s.note}</figcaption></figure>`).join('');
const caseVids = $$('.case__scenes video');
const caseIO = new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? e.target.play().catch(() => {}) : e.target.pause()), { root: $('.case__scroll'), threshold: .3 });
caseVids.forEach(v => caseIO.observe(v));
let lastFocus = null;
function openCase(from) {
  lastFocus = from;
  caseEl.hidden = false; lenis?.stop(); document.body.style.overflow = 'hidden';
  $('.case__scroll').scrollTop = 0;
  $$('video[data-poster]', caseEl).forEach(v => { v.poster = v.dataset.poster; });
  $$('img[data-src]', caseEl).forEach(i => { i.src = i.dataset.src; });
  $('.case__hero video').play().catch(() => {});
  gsap.fromTo(caseEl, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: reduced ? 0 : 1.1, ease: 'expo.inOut' });
  gsap.from('.case__hero-copy > *', { y: 60, opacity: 0, duration: 1, stagger: .1, delay: .6, ease: 'expo.out' });
  $('.case__close').focus({ preventScroll: true });
}
function closeCase() {
  $$('video', caseEl).forEach(v => v.pause());
  gsap.to(caseEl, { clipPath: 'inset(0 0 100% 0)', duration: reduced ? 0 : .9, ease: 'expo.inOut', onComplete: () => { caseEl.hidden = true; document.body.style.overflow = ''; lenis?.start(); lastFocus?.focus({ preventScroll: true }); } });
}
$('.case__close').addEventListener('click', closeCase);
addEventListener('keydown', e => { if (e.key === 'Escape' && !caseEl.hidden) closeCase(); });

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
   Playground
------------------------------------------------------------------ */
// 1. Night watch — a lighthouse beam from the corner lamp, aimed by the cursor
const beamBox = $('.exp__beam');
let beamVisible = false;
new IntersectionObserver(([e]) => { beamVisible = e.isIntersecting; }).observe(beamBox);
(() => {
  let tx = .6, ty = .4, cx = tx, cy = ty, auto = true, t0 = performance.now();
  beamBox.addEventListener('pointermove', e => { const r = beamBox.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width; ty = (e.clientY - r.top) / r.height; auto = false; });
  beamBox.addEventListener('pointerleave', () => auto = true);
  const dark = $('.exp__dark');
  (function tick(now) {
    requestAnimationFrame(tick);
    if (!beamVisible) return; // skip work while off-screen
    if (auto) { const k = (now - t0) / 1000; tx = .5 + Math.sin(k * .6) * .35; ty = .4 + Math.cos(k * .4) * .2; }
    cx += (tx - cx) * .08; cy += (ty - cy) * .08;
    const r = beamBox.getBoundingClientRect();
    const ang = Math.atan2(cx * r.width, -(cy * r.height - r.height)) * 180 / Math.PI;
    dark.style.setProperty('--a', ang.toFixed(1) + 'deg');
    dark.style.setProperty('--mx', (cx * 100).toFixed(1) + '%');
    dark.style.setProperty('--my', (cy * 100).toFixed(1) + '%');
  })(performance.now());
})();

// 2. Halftone tagline
(() => {
  const cv = $('[data-halftone]'), ctx = cv.getContext('2d');
  const off = document.createElement('canvas'), octx = off.getContext('2d', { willReadFrequently: true });
  let W, H, dpr, pts = [], mx = -999, my = -999, step;
  function build() {
    dpr = Math.min(devicePixelRatio, 2);
    W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr;
    off.width = W; off.height = H;
    octx.fillStyle = '#000'; octx.fillRect(0, 0, W, H);
    octx.fillStyle = '#fff'; octx.textAlign = 'center'; octx.textBaseline = 'middle';
    octx.font = `900 ${Math.min(W * .3, H * .62)}px Cairo`;
    octx.direction = 'rtl'; octx.fillText('تنوّر', W / 2, H * .46);
    step = W < 500 ? 7 : 9;
    const data = octx.getImageData(0, 0, W, H).data; pts = [];
    for (let y = step / 2; y < H; y += step) for (let x = step / 2; x < W; x += step) {
      const v = data[((y | 0) * W + (x | 0)) * 4] / 255;
      pts.push({ x, y, v });
    }
  }
  cv.parentElement.addEventListener('pointermove', e => { const r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
  cv.parentElement.addEventListener('pointerleave', () => { mx = my = -999; });
  let vis = false; new IntersectionObserver(([e]) => vis = e.isIntersecting).observe(cv);
  function draw(now) {
    requestAnimationFrame(draw); if (!vis) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    const k = now / 1000;
    for (const p of pts) {
      const d = Math.hypot(p.x - mx, p.y - my), near = Math.max(0, 1 - d / 140);
      const wave = (Math.sin(p.x * .02 + k * 1.4) + 1) * .5;
      const r = (p.v * (.32 + .12 * wave) + near * .45) * step * .5 + .5;
      ctx.fillStyle = near > .05 ? `rgba(221,153,51,${.4 + near * .6})` : (p.v > .5 ? '#F2ECDF' : 'rgba(242,236,223,.14)');
      ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(.6, r), 0, 6.283); ctx.fill();
    }
  }
  (document.fonts?.ready || Promise.resolve()).then(() => { build(); requestAnimationFrame(draw); });
  addEventListener('resize', () => build());
})();

// 3. Cutting table — drag the film's cut-outs
$$('[data-table] .cut').forEach(cut => {
  let sx, sy, ox, oy, rot = parseFloat(getComputedStyle(cut).getPropertyValue('--r')) || 0;
  cut.addEventListener('pointerdown', e => {
    cut.setPointerCapture(e.pointerId); cut.classList.add('is-drag');
    sx = e.clientX; sy = e.clientY; ox = gsap.getProperty(cut, 'x'); oy = gsap.getProperty(cut, 'y');
    cut.parentElement.append(cut);
    gsap.to(cut, { scale: 1.06, rotate: rot + (Math.random() - .5) * 10, duration: .3 });
  });
  cut.addEventListener('pointermove', e => { if (!cut.hasPointerCapture(e.pointerId)) return; gsap.set(cut, { x: ox + e.clientX - sx, y: oy + e.clientY - sy }); });
  const up = () => { cut.classList.remove('is-drag'); rot = gsap.getProperty(cut, 'rotate'); gsap.to(cut, { scale: 1, duration: .6, ease: 'elastic.out(1,.5)' }); };
  cut.addEventListener('pointerup', up); cut.addEventListener('pointercancel', up);
});

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
  clipsBar.innerHTML = chapters.map((c, i) => `<button style="--w:${c.offsetHeight / H}" aria-label="Go to ${c.dataset.chapter}" data-ch="${i}"></button>`).join('');
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

// Motion Graphic Videos card: play only while that tab is active AND on screen;
// the editor playhead follows the clip. Reduced motion shows the poster instead.
(() => {
  const v = $('[data-motion-video]');
  if (!v) return;
  if (reduced) {
    const img = document.createElement('img');
    img.src = v.dataset.poster || v.poster; img.alt = 'October War 1973 motion graphic video, still frame';
    img.style.cssText = 'width:100%;height:100%;object-fit:cover';
    v.replaceWith(img);
    return;
  }
  const panel = v.closest('.svc'), head = $('.editor__head'), tracks = $('.editor__tracks');
  let onScreen = false;
  const sync = () => (onScreen && panel.classList.contains('is-active')) ? v.play().catch(() => {}) : v.pause();
  new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; sync(); }, { threshold: .25 }).observe(v);
  new MutationObserver(sync).observe(panel, { attributes: true, attributeFilter: ['class'] });
  head.style.animation = 'none';
  const move = () => {
    if (v.duration) head.style.transform = `translateX(${(v.currentTime / v.duration) * (tracks.clientWidth - 30)}px)`;
    if (!v.paused) requestAnimationFrame(move);
  };
  v.addEventListener('play', () => requestAnimationFrame(move));
  v.addEventListener('seeked', move);
})();

/* ------------------------------------------------------------------
   Project viewer — opens a work card's real media (image gallery or video)
------------------------------------------------------------------ */
const viewer = document.createElement('div');
viewer.className = 'viewer'; viewer.hidden = true;
viewer.setAttribute('role', 'dialog'); viewer.setAttribute('aria-modal', 'true'); viewer.setAttribute('aria-labelledby', 'viewer-title');
viewer.innerHTML = `
  <div class="viewer__bar">
    <div><h2 id="viewer-title" class="viewer__title"></h2><p class="viewer__cat"></p></div>
    <button class="viewer__close" data-cursor="Close">Close</button>
  </div>
  <div class="viewer__stage" data-lenis-prevent></div>
  <div class="viewer__foot">
    <p class="viewer__desc"></p>
    <div class="viewer__nav"><button class="viewer__prev" aria-label="Previous">←</button><span class="viewer__count"></span><button class="viewer__next" aria-label="Next">→</button></div>
  </div>`;
document.body.append(viewer);
let vItem = null, vIdx = 0, vFrom = null;
function vRender() {
  const m = vItem.gallery[vIdx], stage = $('.viewer__stage', viewer);
  stage.innerHTML = m.type === 'video'
    ? `<video src="${m.src}"${m.poster ? ` poster="${m.poster}"` : ''} ${m.sound ? 'controls' : 'muted'} autoplay loop playsinline class="${m.vertical ? 'is-vertical' : ''}"></video>`
    : `<img src="${m.src}" alt="${vItem.title}${vItem.gallery.length > 1 ? ` — page ${vIdx + 1}` : ''}">`;
  const many = vItem.gallery.length > 1;
  $('.viewer__nav', viewer).hidden = !many;
  $('.viewer__count', viewer).textContent = `${vIdx + 1} / ${vItem.gallery.length}`;
  if (!reduced) gsap.fromTo(stage.firstElementChild, { opacity: 0, y: 24, scale: .97 }, { opacity: 1, y: 0, scale: 1, duration: .5, ease: 'expo.out' });
}
function openWork(card) {
  const w = WORK.find(x => x.id === card.dataset.id);
  if (!w) return;
  if (w.case) return openCase(card);
  vItem = w; vIdx = 0; vFrom = card;
  $('.viewer__title', viewer).textContent = w.title;
  $('.viewer__cat', viewer).textContent = w.cat;
  $('.viewer__desc', viewer).textContent = w.desc;
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
$('.viewer__close', viewer).addEventListener('click', closeWork);
$('.viewer__prev', viewer).addEventListener('click', () => vStep(-1));
$('.viewer__next', viewer).addEventListener('click', () => vStep(1));
addEventListener('keydown', e => {
  if (viewer.hidden) return;
  if (e.key === 'Escape') closeWork();
  if (vItem?.gallery.length > 1 && e.key === 'ArrowRight') vStep(1);
  if (vItem?.gallery.length > 1 && e.key === 'ArrowLeft') vStep(-1);
});

// Cutting-table cut-outs are CSS backgrounds (they'd load on first paint); attach them only near view
const cutTable = $('[data-table]');
if (cutTable) new IntersectionObserver(([e], io) => { if (e.isIntersecting) { cutTable.classList.add('is-near'); io.disconnect(); } }, { rootMargin: '800px 0px' }).observe(cutTable);

// Video posters download immediately even for videos far down the page — attach them as each video nears view
{
  const pio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.poster = e.target.dataset.poster; pio.unobserve(e.target);
  }), { rootMargin: '1000px 0px' });
  // the case-study modal is fixed over the viewport, so its posters are set when it opens instead
  $$('video[data-poster]').forEach(v => v.closest('.case') ? null : pio.observe(v));
}

// Phones/tablets: floating WhatsApp button would cover the pricing cards — hide it while the cards are on screen
{
  const waEl = $('.wa'), grid = $('[data-pgrid]'), phone = matchMedia('(max-width: 1024px)');
  let onGrid = false;
  const apply = () => $$('.wa').forEach(b => b.classList.toggle('is-aside', phone.matches && onGrid));
  // pricing cards, FAQ answers and the two forms sit under the floating buttons on small screens
  const covered = new Set();
  const io = new IntersectionObserver(es => { es.forEach(e => e.isIntersecting ? covered.add(e.target) : covered.delete(e.target)); onGrid = covered.size > 0; apply(); }, { rootMargin: '-15% 0px -15% 0px' });
  [grid, $('[data-faq-list]'), $('[data-review-form]'), $('[data-reviews-grid]'), $('[data-inquiry]')].forEach(t => t && io.observe(t));
  phone.addEventListener?.('change', apply);
}

// Back-to-top lamp: appears once the visitor has scrolled past the hero
{
  const top = $('.wa--top');
  if (top) ScrollTrigger.create({ start: () => innerHeight * .9, end: 'max', onToggle: s => top.classList.toggle('is-shown', s.isActive) });
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
