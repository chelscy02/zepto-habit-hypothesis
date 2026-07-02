/* ═══════════════════════════════════════════════════════════
   ZEPTO INVESTIGATION — MAIN APP v3
   Author: Chelscy | June 2026
   Changes: URL hash nav, fixed wheel, grouped nav, keyboard
   ═══════════════════════════════════════════════════════════ */

'use strict';

const App = (() => {
  let current = 0;
  let slides = [];
  let navDots = [];
  let isAnimating = false;
  const ANIM_MS = 480;

  /* ── INIT ─────────────────────────────────────────────── */
  function init() {
    slides   = Array.from(document.querySelectorAll('.slide'));
    navDots  = Array.from(document.querySelectorAll('.nav-dot'));
    if (!slides.length) return;

    // Read hash on load
    const hash = window.location.hash.replace('#slide-', '');
    const startIdx = parseInt(hash, 10);
    const start = (!isNaN(startIdx) && startIdx >= 0 && startIdx < slides.length)
      ? startIdx : 0;
    goTo(start, true);

    // Hash change (back/forward)
    window.addEventListener('hashchange', () => {
      const h = window.location.hash.replace('#slide-', '');
      const i = parseInt(h, 10);
      if (!isNaN(i) && i !== current) goTo(i, true);
    });

    document.addEventListener('keydown', onKey);
    navDots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));

    const prevBtn = document.getElementById('btn-prev');
    const nextBtn = document.getElementById('btn-next');
    if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

    // Touch
    let ty0 = 0;
    document.addEventListener('touchstart', e => { ty0 = e.touches[0].clientY; }, {passive:true});
    document.addEventListener('touchend', e => {
      const dy = ty0 - e.changedTouches[0].clientY;
      const inner = slides[current]?.querySelector('.slide-inner');
      if (!inner) return;
      const atTop    = inner.scrollTop <= 1;
      const atBottom = inner.scrollTop + inner.clientHeight >= inner.scrollHeight - 4;
      if (Math.abs(dy) > 70) {
        if (dy > 0 && atBottom) goTo(current + 1);
        if (dy < 0 && atTop)    goTo(current - 1);
      }
    }, {passive:true});

    // Wheel
    document.addEventListener('wheel', onWheel, {passive: false});

    // Accordions, evidence cards, stage toggles
    document.querySelectorAll('.expand-trigger').forEach(btn => {
      btn.addEventListener('click', () => {
        const body = btn.nextElementSibling;
        const open = body.classList.contains('open');
        btn.classList.toggle('open', !open);
        body.classList.toggle('open', !open);
      });
    });
    document.querySelectorAll('.evidence-header').forEach(h => {
      h.addEventListener('click', () => h.closest('.evidence-item').classList.toggle('open'));
    });
    document.querySelectorAll('.stage-header').forEach(h => {
      h.addEventListener('click', () => {
        const item = h.closest('.stage-item');
        item.classList.toggle('open');
        const tog = h.querySelector('.stage-toggle');
        if (tog) tog.textContent = item.classList.contains('open') ? '−' : '+';
      });
    });

    if (window.Simulators) Simulators.init();
  }

  /* ── WHEEL — fixed: only advance when fully at edge ──── */
  let wAccum = 0, wTimer = null;

  function onWheel(e) {
    const inner = slides[current]?.querySelector('.slide-inner');
    if (!inner) return;

    const atTop    = inner.scrollTop <= 1;
    const atBottom = inner.scrollTop + inner.clientHeight >= inner.scrollHeight - 4;
    const goingDown = e.deltaY > 0;
    const goingUp   = e.deltaY < 0;

    // If slide can still scroll, let it — don't accumulate
    if ((goingDown && !atBottom) || (goingUp && !atTop)) {
      wAccum = 0; return;
    }

    // At edge: accumulate delta with timeout reset
    wAccum += e.deltaY;
    clearTimeout(wTimer);
    wTimer = setTimeout(() => { wAccum = 0; }, 400);

    if (Math.abs(wAccum) > 180) {
      e.preventDefault();
      goTo(current + (wAccum > 0 ? 1 : -1));
      wAccum = 0;
    }
  }

  /* ── KEY ─────────────────────────────────────────────── */
  function onKey(e) {
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'PageDown') goTo(current + 1);
    if (e.key === 'ArrowUp'   || e.key === 'ArrowLeft'  || e.key === 'PageUp')   goTo(current - 1);
    if (e.key === 'Home') goTo(0);
    if (e.key === 'End')  goTo(slides.length - 1);
  }

  /* ── GO TO ───────────────────────────────────────────── */
  function goTo(index, skipAnim) {
    if (isAnimating && !skipAnim) return;
    const next = Math.max(0, Math.min(slides.length - 1, index));
    if (next === current && !skipAnim) return;

    isAnimating = true;
    slides[current]?.classList.remove('active');
    slides[current]?.classList.add('prev');
    current = next;
    slides[current].classList.remove('prev');
    slides[current].classList.add('active');

    const inner = slides[current].querySelector('.slide-inner');
    if (inner) inner.scrollTop = 0;

    // Update URL hash
    history.replaceState(null, '', '#slide-' + current);

    updateNav();
    if (window.Simulators) Simulators.animateConfidenceBars();

    setTimeout(() => {
      isAnimating = false;
      slides.forEach((s, i) => { if (i !== current) s.classList.remove('prev'); });
    }, ANIM_MS);
  }

  /* ── UPDATE NAV ──────────────────────────────────────── */
  function updateNav() {
    navDots.forEach((d, i) => d.classList.toggle('active', i === current));
    const counter = document.getElementById('slide-counter');
    if (counter) counter.innerHTML = `<span>${String(current + 1).padStart(2,'0')}</span>&thinsp;/&thinsp;${String(slides.length).padStart(2,'0')}`;
    const prevBtn = document.getElementById('btn-prev');
    const nextBtn = document.getElementById('btn-next');
    if (prevBtn) prevBtn.disabled = current === 0;
    if (nextBtn) nextBtn.disabled = current === slides.length - 1;

    // Update section label in nav if present
    const label = document.getElementById('nav-section-label');
    if (label) {
      const slide = slides[current];
      const t = slide?.dataset.navLabel || '';
      label.textContent = t;
    }
  }

  return { init, goTo, getCurrent: () => current, total: () => slides.length };
})();

document.addEventListener('DOMContentLoaded', () => App.init());
