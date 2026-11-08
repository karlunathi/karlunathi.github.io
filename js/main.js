/* ============================================================
   PORTFOLIO — Karl Unathi
   main.js
   ============================================================ */

/* ── EDIT THESE ──────────────────────────────────────────────
   Your public contact email, and (optional) your Formspree form
   ID from https://formspree.io. If FORMSPREE_ID is left empty,
   the contact form opens the visitor's email app instead.      */
const CONFIG = {
  email: 'unathikarl@gmail.com',
  formspreeId: '',
  roles: [
    'Training Manager',
    'Operations Manager',
    'Electrical Engineer (Telecoms)',
    'Private Pilot (PPL)',
    'Team Builder'
  ]
};

(function () {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Email placeholders ─────────────────────────────────── */
  $$('[data-email]').forEach(el => {
    if (el.dataset.email !== 'href') el.textContent = CONFIG.email;
    if (el.tagName === 'A') el.href = 'mailto:' + CONFIG.email;
  });

  /* ── Footer year ────────────────────────────────────────── */
  const yearEl = $('#footerYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ── Nav: scrolled state ────────────────────────────────── */
  const nav = $('#nav');
  const onScroll = () => nav && nav.classList.toggle('scrolled', window.scrollY > 12);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ── Nav: mobile drawer ─────────────────────────────────── */
  const burger = $('#navBurger');
  const drawer = $('#navMobile');
  const setDrawer = open => {
    if (!burger || !drawer) return;
    burger.classList.toggle('open', open);
    drawer.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    drawer.setAttribute('aria-hidden', String(!open));
  };
  if (burger && drawer) {
    burger.addEventListener('click', () => setDrawer(!drawer.classList.contains('open')));
    $$('a', drawer).forEach(a => a.addEventListener('click', () => setDrawer(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setDrawer(false); });
  }

  /* ── Nav: highlight current section ─────────────────────── */
  const sections = ['about', 'services', 'experience', 'contact']
    .map(id => document.getElementById(id)).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        $$('.nav__link').forEach(l => l.classList.toggle('active', l.dataset.section === id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => spy.observe(s));
  }

  /* ── Scroll-reveal animations ───────────────────────────── */
  const animated = $$('[data-animate]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const reveal = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    animated.forEach(el => reveal.observe(el));
  } else {
    animated.forEach(el => el.classList.add('animated'));
  }

  /* ── Typewriter ─────────────────────────────────────────── */
  const tw = $('#typewriter');
  if (tw) {
    if (reduceMotion) {
      tw.textContent = CONFIG.roles[0];
    } else {
      let role = 0, char = 0, deleting = false;
      const tick = () => {
        const word = CONFIG.roles[role];
        char += deleting ? -1 : 1;
        tw.textContent = word.slice(0, char);
        let delay = deleting ? 40 : 85;
        if (!deleting && char === word.length) { deleting = true; delay = 1600; }
        else if (deleting && char === 0) { deleting = false; role = (role + 1) % CONFIG.roles.length; delay = 350; }
        setTimeout(tick, delay);
      };
      tick();
    }
  }

  /* ── Stat counters ──────────────────────────────────────── */
  const counters = $$('[data-count]');
  const runCounter = el => {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    if (reduceMotion || isNaN(target)) { el.textContent = target + suffix; return; }
    const duration = 1400;
    const start = performance.now();
    const step = now => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ('IntersectionObserver' in window) {
    const countObs = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { runCounter(entry.target); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(el => countObs.observe(el));
  } else {
    counters.forEach(runCounter);
  }

  /* ── Image fallback (until you add your own photo) ──────── */
  $$('img[data-fallback]').forEach(img => {
    const swap = () => {
      const box = document.createElement('div');
      box.className = img.className + ' img-fallback';
      box.setAttribute('role', 'img');
      box.setAttribute('aria-label', img.alt || '');
      box.textContent = img.dataset.fallback;
      img.replaceWith(box);
    };
    if (img.complete && img.naturalWidth === 0) swap();
    else img.addEventListener('error', swap, { once: true });
  });

  /* ── Contact form ───────────────────────────────────────── */
  const form = $('#contactForm');
  const status = $('#formStatus');
  const submitBtn = $('#submitBtn');
  const showStatus = (type, msg) => {
    if (!status) return;
    status.className = 'form-status ' + type;
    status.textContent = msg;
  };

  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const data = new FormData(form);

      // No Formspree ID configured: fall back to the visitor's email app.
      if (!CONFIG.formspreeId) {
        const subject = data.get('subject') || 'Portfolio enquiry';
        const body = `${data.get('message')}\n\n— ${data.get('name')} (${data.get('email')})`;
        window.location.href = 'mailto:' + CONFIG.email +
          '?subject=' + encodeURIComponent(subject) +
          '&body=' + encodeURIComponent(body);
        showStatus('success', 'Opening your email app to send the message…');
        return;
      }

      const label = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }
      try {
        const res = await fetch('https://formspree.io/f/' + CONFIG.formspreeId, {
          method: 'POST',
          body: data,
          headers: { Accept: 'application/json' }
        });
        if (!res.ok) throw new Error('Request failed');
        form.reset();
        showStatus('success', 'Thanks! Your message has been sent. I will get back to you soon.');
      } catch (err) {
        showStatus('error', 'Something went wrong. Please try again or email me directly.');
      } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = label; }
      }
    });
  }
})();
