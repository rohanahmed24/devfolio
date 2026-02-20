/* ═══════════════════════════════════════════════════════════
   MAIN.JS — GSAP + Lenis + Swiper portfolio animations
   Matches julesstudio.co aesthetic with advanced motion.
═══════════════════════════════════════════════════════════ */

'use strict';

/* ─── Register GSAP plugins ────────────────────────────── */
gsap.registerPlugin(ScrollTrigger);

/* ─── Utility: split a text node into word spans ────────── */
function splitWords(el) {
  const text = el.innerHTML;
  // Handle <br> tags and <em> wrapping
  const parts = text.split(/(\s+|<br\s*\/?>|<em>[\s\S]*?<\/em>)/gi);
  let html = '';
  parts.forEach(part => {
    if (!part || /^\s+$/.test(part)) {
      html += ' ';
    } else if (/^<br/i.test(part)) {
      html += part;
    } else if (/^<em>/i.test(part)) {
      html += `<span class="word-wrap"><em class="word">${part.replace(/<\/?em>/gi,'')}</em></span>`;
    } else {
      html += `<span class="word-wrap"><span class="word">${part}</span></span>`;
    }
  });
  el.innerHTML = html;
  return el.querySelectorAll('.word');
}

/* ════════════════════════════════════════════════════════
   1. LOADER
════════════════════════════════════════════════════════ */
function initLoader() {
  const loader  = document.getElementById('loader');
  const pctEl   = document.getElementById('loaderPct');
  const bar     = loader.querySelector('.loader__bar');

  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 18;
    progress = clamp(0, progress, 95);
    bar.style.width    = progress + '%';
    pctEl.textContent  = Math.round(progress);
  }, 80);

  window.addEventListener('load', () => {
    clearInterval(interval);
    // Snap to 100
    bar.style.width   = '100%';
    pctEl.textContent = '100';

    gsap.to(loader, {
      yPercent: -100,
      duration: 1,
      ease: 'expo.inOut',
      delay: 0.4,
      onComplete: () => {
        loader.style.display = 'none';
        revealHero();
      }
    });
  });
}

/* ════════════════════════════════════════════════════════
   2. LENIS SMOOTH SCROLL
════════════════════════════════════════════════════════ */
function initLenis() {
  const lenis = new Lenis({
    duration: 1.6,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    smoothWheel: true,
  });

  // Sync Lenis raf with GSAP ticker
  gsap.ticker.add(time => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Smooth anchor scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -80, duration: 1.8 });
    });
  });

  return lenis;
}

/* ════════════════════════════════════════════════════════
   3. NAVIGATION
════════════════════════════════════════════════════════ */
function initNav() {
  const nav       = document.getElementById('nav');
  const hamburger = document.getElementById('hamburger');
  const menu      = document.getElementById('mobileMenu');

  // Scroll-based nav background
  ScrollTrigger.create({
    start: 'top -80',
    onEnter:       () => nav.classList.add('scrolled'),
    onLeaveBack:   () => nav.classList.remove('scrolled'),
  });

  // Mobile menu toggle
  hamburger.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    hamburger.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  // Close on link click
  menu.querySelectorAll('[data-close]').forEach(el => {
    el.addEventListener('click', () => {
      menu.classList.remove('open');
      hamburger.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

/* ════════════════════════════════════════════════════════
   4. HERO REVEAL (runs after loader exits)
════════════════════════════════════════════════════════ */
function revealHero() {
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

  // Rotating tag
  tl.from('.hero__tag-wrap', {
    opacity: 0, y: 20, duration: .8
  }, 0);

  // Headline words
  const words = splitWords(document.getElementById('heroHeadline'));
  tl.from(words, {
    y: '110%',
    opacity: 0,
    duration: 1,
    stagger: 0.06,
    ease: 'expo.out',
  }, 0.1);

  // Desc + actions
  tl.from('#heroDesc', {
    opacity: 0, y: 30, duration: .9
  }, 0.5);
  tl.from('#heroActions', {
    opacity: 0, y: 20, duration: .8
  }, 0.65);

  // Image frame
  tl.from('#heroFrame', {
    opacity: 0,
    scale: 0.96,
    y: 40,
    duration: 1.2,
    ease: 'expo.out',
  }, 0.2);

  // Badges
  tl.from('.hero__avail', {
    opacity: 0, x: -20, duration: .7
  }, 0.7);
  tl.from('.hero__badge', {
    opacity: 0, scale: 0.85, duration: .7
  }, 0.85);

  // Scroll hint
  tl.from('.hero__scroll', {
    opacity: 0, duration: 1
  }, 1);

  // Hero counter
  animateCounter(document.getElementById('heroCount'), 50, 1800, 0.9);

  // Start rotating tag
  startTagRotation();
}

/* ════════════════════════════════════════════════════════
   5. ROTATING HERO TAG
════════════════════════════════════════════════════════ */
function startTagRotation() {
  const track  = document.getElementById('tagTrack');
  const items  = track.querySelectorAll('span');
  const count  = items.length - 1; // last span is duplicate of first
  let current  = 0;

  setInterval(() => {
    current = (current + 1) % count;
    gsap.to(track, {
      y: -(current * (track.querySelector('span').offsetHeight)),
      duration: .7,
      ease: 'expo.inOut',
    });
  }, 2500);
}

/* ════════════════════════════════════════════════════════
   6. COUNTER ANIMATION
════════════════════════════════════════════════════════ */
function animateCounter(el, target, duration = 1500, delay = 0) {
  if (!el) return;
  const start    = performance.now() + delay * 1000;
  let frame;

  function step(ts) {
    const elapsed = Math.max(0, ts - start);
    const t       = Math.min(elapsed / duration, 1);
    const eased   = 1 - Math.pow(1 - t, 4); // ease out quart
    el.textContent = Math.round(eased * target);
    if (t < 1) frame = requestAnimationFrame(step);
  }
  frame = requestAnimationFrame(step);
}

/* ════════════════════════════════════════════════════════
   7. SECTION TITLE REVEALS (ScrollTrigger)
════════════════════════════════════════════════════════ */
function initSectionTitles() {
  // Reveal labels
  document.querySelectorAll('.reveal-label').forEach(el => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      onEnter: () => el.classList.add('is-visible'),
    });
  });

  // Split and reveal section titles
  document.querySelectorAll('.split-title').forEach(el => {
    const words = splitWords(el);
    gsap.from(words, {
      scrollTrigger: { trigger: el, start: 'top 85%' },
      y: '105%',
      opacity: 0,
      duration: 1,
      stagger: 0.05,
      ease: 'expo.out',
    });
  });
}

/* ════════════════════════════════════════════════════════
   8. WORK CARDS
════════════════════════════════════════════════════════ */
function initWorkCards() {
  const cards = document.querySelectorAll('.project-card');

  cards.forEach((card, i) => {
    gsap.from(card, {
      scrollTrigger: { trigger: card, start: 'top 90%' },
      y: 60,
      opacity: 0,
      duration: 1,
      delay: (i % 2) * 0.15,
      ease: 'expo.out',
    });
  });

  // Parallax on scroll for card images
  cards.forEach(card => {
    const img = card.querySelector('img');
    gsap.to(img, {
      scrollTrigger: {
        trigger: card,
        scrub: 1.5,
        start: 'top bottom',
        end: 'bottom top',
      },
      yPercent: -12,
      ease: 'none',
    });
  });
}

/* ════════════════════════════════════════════════════════
   9. MARQUEE (pure CSS — enhanced with GSAP on hover)
════════════════════════════════════════════════════════ */
function initMarquee() {
  const section = document.querySelector('.marquee-section');
  const track   = document.querySelector('.marquee__track');
  if (!section || !track) return;

  // GSAP-controlled playback rate on hover (CSS animation is fallback)
  // This controls CSS animation speed via JS
  section.addEventListener('mouseenter', () => {
    gsap.to(track, { '--marquee-speed': 0, duration: .4, overwrite: true });
    track.style.animationPlayState = 'paused';
  });
  section.addEventListener('mouseleave', () => {
    track.style.animationPlayState = 'running';
  });
}

/* ════════════════════════════════════════════════════════
   10. SERVICES — hover image swap
════════════════════════════════════════════════════════ */
function initServices() {
  const items  = document.querySelectorAll('.service-item');
  const images = document.querySelectorAll('.svc-img');

  function activateService(index) {
    items.forEach((item, i) => item.classList.toggle('active', i === index));

    images.forEach((img, i) => {
      if (i === index) {
        gsap.to(img, { opacity: 1, scale: 1, duration: .6, ease: 'expo.out' });
        img.classList.add('active');
      } else {
        gsap.to(img, { opacity: 0, scale: 1.04, duration: .4, ease: 'expo.out' });
        img.classList.remove('active');
      }
    });
  }

  items.forEach((item, i) => {
    item.addEventListener('mouseenter', () => activateService(i));
    item.addEventListener('click',      () => activateService(i));
  });

  // Scroll entrance for the section
  gsap.from('.services__list', {
    scrollTrigger: { trigger: '.services', start: 'top 75%' },
    x: -40, opacity: 0, duration: 1, ease: 'expo.out',
  });
  gsap.from('.services__images', {
    scrollTrigger: { trigger: '.services', start: 'top 75%' },
    x: 40, opacity: 0, duration: 1, ease: 'expo.out', delay: .15,
  });
}

/* ════════════════════════════════════════════════════════
   11. TESTIMONIALS — Swiper
════════════════════════════════════════════════════════ */
function initTestimonials() {
  const swiper = new Swiper('#testimonialSwiper', {
    slidesPerView: 1,
    spaceBetween: 32,
    loop: true,
    autoplay: {
      delay: 4500,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    },
    navigation: {
      prevEl: '#tPrev',
      nextEl: '#tNext',
    },
    on: {
      slideChange(s) {
        const frac = document.getElementById('testimonialFrac');
        if (frac) frac.textContent = `${s.realIndex + 1} / ${s.slides.length - 2}`;
      }
    },
    breakpoints: {
      768: { slidesPerView: 1 },
    }
  });

  gsap.from('.testimonials__swiper', {
    scrollTrigger: { trigger: '.testimonials', start: 'top 80%' },
    y: 60, opacity: 0, duration: 1.1, ease: 'expo.out',
  });
}

/* ════════════════════════════════════════════════════════
   12. ABOUT — stats counter + reveals
════════════════════════════════════════════════════════ */
function initAbout() {
  // Parallax image
  gsap.to('.about__img-wrap img', {
    scrollTrigger: {
      trigger: '.about',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1.5,
    },
    yPercent: -10,
    ease: 'none',
  });

  // Stats counter on scroll
  document.querySelectorAll('.stat__num').forEach(el => {
    const target = parseInt(el.dataset.count, 10);
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => animateCounter(el, target, 1500),
    });
  });

  // Skills grid stagger
  gsap.from('.skills-col', {
    scrollTrigger: { trigger: '.about__skills', start: 'top 85%' },
    y: 30, opacity: 0, duration: .8, stagger: 0.15, ease: 'expo.out',
  });

  // About image entrance
  gsap.from('.about__img-wrap', {
    scrollTrigger: { trigger: '.about', start: 'top 80%' },
    x: -40, opacity: 0, duration: 1.1, ease: 'expo.out',
  });

  // About content entrance
  gsap.from('.about__content > *', {
    scrollTrigger: { trigger: '.about__content', start: 'top 85%' },
    y: 30, opacity: 0, duration: .9, stagger: 0.1, ease: 'expo.out',
  });
}

/* ════════════════════════════════════════════════════════
   13. FAQ — accordion
════════════════════════════════════════════════════════ */
function initFAQ() {
  const items = document.querySelectorAll('.faq-item');

  items.forEach(item => {
    const btn = item.querySelector('.faq-item__q');
    const ans = item.querySelector('.faq-item__a');

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all
      items.forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq-item__a').style.maxHeight = '0';
      });

      // Open clicked if it was closed
      if (!isOpen) {
        item.classList.add('open');
        ans.style.maxHeight = ans.scrollHeight + 'px';

        gsap.from(ans.querySelector('p'), {
          y: 10, opacity: 0, duration: .5, ease: 'expo.out',
        });
      }
    });
  });

  // Stagger entrance
  gsap.from('.faq-item', {
    scrollTrigger: { trigger: '.faq__list', start: 'top 85%' },
    y: 30, opacity: 0, duration: .8, stagger: 0.1, ease: 'expo.out',
  });
}

/* ════════════════════════════════════════════════════════
   14. CTA BAND — decorative rings + title
════════════════════════════════════════════════════════ */
function initCTA() {
  gsap.from('.cta-band__content > *', {
    scrollTrigger: { trigger: '.cta-band', start: 'top 80%' },
    y: 40, opacity: 0, duration: 1, stagger: 0.12, ease: 'expo.out',
  });

  // Rings entrance
  gsap.from('.cta-band__ring', {
    scrollTrigger: { trigger: '.cta-band', start: 'top 90%' },
    scale: 0.5, opacity: 0, duration: 1.4, stagger: .2, ease: 'expo.out',
  });
}

/* ════════════════════════════════════════════════════════
   15. FOOTER — stagger links
════════════════════════════════════════════════════════ */
function initFooter() {
  gsap.from('.footer__col', {
    scrollTrigger: { trigger: '.footer', start: 'top 90%' },
    y: 20, opacity: 0, duration: .8, stagger: .1, ease: 'expo.out',
  });
}

/* ════════════════════════════════════════════════════════
   16. MAGNETIC BUTTONS (subtle tilt on hover)
════════════════════════════════════════════════════════ */
function initMagneticButtons() {
  document.querySelectorAll('.btn--primary, .btn--large, .btn--outline').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r   = btn.getBoundingClientRect();
      const cx  = r.left + r.width  / 2;
      const cy  = r.top  + r.height / 2;
      const dx  = (e.clientX - cx) / (r.width  / 2);
      const dy  = (e.clientY - cy) / (r.height / 2);

      gsap.to(btn, {
        x: dx * 6,
        y: dy * 4,
        duration: .4,
        ease: 'power2.out',
      });
    });

    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: .6, ease: 'elastic.out(1, 0.5)' });
    });
  });
}

/* ════════════════════════════════════════════════════════
   17. HERO IMAGE PARALLAX on scroll
════════════════════════════════════════════════════════ */
function initHeroParallax() {
  gsap.to('.hero__img', {
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1.5,
    },
    yPercent: 20,
    ease: 'none',
  });
}

/* ════════════════════════════════════════════════════════
   18. CURSOR (custom cursor blob — desktop only)
════════════════════════════════════════════════════════ */
function initCursor() {
  if (window.matchMedia('(pointer: coarse)').matches) return; // skip mobile

  const cursor = document.createElement('div');
  cursor.className = 'cursor-blob';
  cursor.style.cssText = `
    position: fixed;
    width: 12px; height: 12px;
    border-radius: 50%;
    background: var(--ink);
    pointer-events: none;
    z-index: 9998;
    mix-blend-mode: difference;
    will-change: transform;
    transition: width .3s, height .3s, background .3s;
  `;
  document.body.appendChild(cursor);

  let mx = 0, my = 0;
  let cx = 0, cy = 0;

  window.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
  });

  function tick() {
    cx += (mx - cx) * 0.12;
    cy += (my - cy) * 0.12;
    cursor.style.transform = `translate(${cx - 6}px, ${cy - 6}px)`;
    requestAnimationFrame(tick);
  }
  tick();

  // Expand on interactive elements
  const hoverEls = 'a, button, .project-card, .service-item, .faq-item__q';
  document.querySelectorAll(hoverEls).forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.width  = '44px';
      cursor.style.height = '44px';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.width  = '12px';
      cursor.style.height = '12px';
    });
  });
}

/* ════════════════════════════════════════════════════════
   19. SCROLL PROGRESS LINE (top of page)
════════════════════════════════════════════════════════ */
function initScrollProgress() {
  const line = document.createElement('div');
  line.style.cssText = `
    position: fixed; top: 0; left: 0; height: 2px;
    background: var(--accent); z-index: 10000;
    transform-origin: left center;
    width: 100%; transform: scaleX(0);
    will-change: transform;
  `;
  document.body.appendChild(line);

  gsap.to(line, {
    scrollTrigger: {
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0,
      onUpdate: self => {
        line.style.transform = `scaleX(${self.progress})`;
      }
    },
  });
}

/* ════════════════════════════════════════════════════════
   20. WORK CTA reveal
════════════════════════════════════════════════════════ */
function initWorkCTA() {
  gsap.from('.work__cta', {
    scrollTrigger: { trigger: '.work__cta', start: 'top 90%' },
    y: 30, opacity: 0, duration: .9, ease: 'expo.out',
  });
}

/* ════════════════════════════════════════════════════════
   BOOT — run everything
════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initNav();
  initLenis();

  // All scroll-triggered init after a tick so DOM is fully ready
  requestAnimationFrame(() => {
    initSectionTitles();
    initHeroParallax();
    initWorkCards();
    initWorkCTA();
    initMarquee();
    initServices();
    initTestimonials();
    initAbout();
    initFAQ();
    initCTA();
    initFooter();
    initMagneticButtons();
    initCursor();
    initScrollProgress();

    // Refresh ScrollTrigger after all is set up
    ScrollTrigger.refresh();
  });
});
