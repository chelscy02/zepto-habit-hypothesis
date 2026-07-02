/* ═══════════════════════════════════════════════════════════
   ZEPTO INVESTIGATION — SIMULATORS
   Author: Chelscy | June 2026
   ═══════════════════════════════════════════════════════════ */

'use strict';

/* ── UNIT ECONOMICS SIMULATOR ─────────────────────────────── */
function initUnitEconSimulator() {
  const els = {
    aov:  document.getElementById('sl-aov'),
    cogs: document.getElementById('sl-cogs'),
    disc: document.getElementById('sl-disc'),
    del:  document.getElementById('sl-del'),
  };
  if (!els.aov) return;

  const CAC = 1100;

  function calc() {
    const aov  = +els.aov.value;
    const cogs = +els.cogs.value / 100;
    const disc = +els.disc.value;
    const del  = +els.del.value;

    document.getElementById('lbl-aov').textContent  = '₹' + aov;
    document.getElementById('lbl-cogs').textContent = els.cogs.value + '%';
    document.getElementById('lbl-disc').textContent = '₹' + disc;
    document.getElementById('lbl-del').textContent  = '₹' + del;

    const gm = Math.round(aov * (1 - cogs));
    const cm = gm - del - disc;
    const pb = cm > 0 ? Math.ceil(CAC / cm) : null;

    const setVal = (id, text, cls) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.textContent = text;
      el.className = 'sim-out-val ' + cls;
    };

    setVal('out-gm', '₹' + gm, gm > 50 ? 'good' : gm > 20 ? 'warn' : 'bad');
    setVal('out-cm',
      (cm >= 0 ? '+₹' : '–₹') + Math.abs(cm),
      cm > 30 ? 'good' : cm > 0 ? 'warn' : 'bad'
    );
    setVal('out-pb',
      pb === null ? '∞ orders' : '~' + pb + ' orders',
      pb && pb < 15 ? 'good' : pb && pb < 30 ? 'warn' : 'bad'
    );
  }

  Object.values(els).forEach(el => el.addEventListener('input', calc));
  calc();
}

/* ── LTV SIMULATOR ────────────────────────────────────────── */
function initLTVSimulator() {
  const retEl  = document.getElementById('sl-ret');
  const freqEl = document.getElementById('sl-freq');
  if (!retEl) return;

  const CM_PER_ORDER = 45; // ₹45 contribution near-breakeven (conservative)
  const CAC = 1100;

  function calc() {
    const ret  = +retEl.value / 100;
    const freq = +freqEl.value;

    document.getElementById('lbl-ret').textContent  = retEl.value + '%';
    document.getElementById('lbl-freq').textContent = freq + 'x / month';

    const activeMonths = 36 * ret;
    const ltv   = Math.round(activeMonths * freq * CM_PER_ORDER);
    const ratio = (ltv / CAC).toFixed(1);
    const payback = (CAC / (freq * CM_PER_ORDER)).toFixed(1);

    const setVal = (id, text, cls) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.textContent = text;
      el.className = 'sim-out-val ' + cls;
    };

    setVal('out-ltv', '₹' + ltv.toLocaleString('en-IN'), ltv > 5000 ? 'good' : ltv > 2000 ? 'warn' : 'bad');
    setVal('out-ltvr', ratio + '×', +ratio > 5 ? 'good' : +ratio > 2 ? 'warn' : 'bad');
    setVal('out-pbm', payback + ' months', +payback < 8 ? 'good' : +payback < 18 ? 'warn' : 'bad');
  }

  retEl.addEventListener('input', calc);
  freqEl.addEventListener('input', calc);
  calc();
}

/* ── SCENARIO TABS ────────────────────────────────────────── */
function initScenarioTabs() {
  const tabs = document.querySelectorAll('.stab');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const which = tab.dataset.scenario;
      // Reset all tabs
      tabs.forEach(t => t.className = 'stab');
      // Remove all scenario classes
      tab.classList.add(which);

      // Hide all panels
      document.querySelectorAll('.scenario-panel').forEach(p => p.classList.remove('on'));
      const panel = document.getElementById('sp-' + which);
      if (panel) panel.classList.add('on');
    });
  });
}

/* ── CONFIDENCE BARS ──────────────────────────────────────── */
function animateConfidenceBars() {
  const fills = document.querySelectorAll('.conf-fill');
  fills.forEach(fill => {
    // Trigger animation by briefly removing width then restoring
    const width = fill.style.width;
    fill.style.width = '0%';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        fill.style.width = width;
      });
    });
  });
}

/* ── EXPORT ───────────────────────────────────────────────── */
window.Simulators = {
  init() {
    initUnitEconSimulator();
    initLTVSimulator();
    initScenarioTabs();
  },
  animateConfidenceBars,
};
